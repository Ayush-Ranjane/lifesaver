// ─── POST /api/pods/create ─────────────────────────────────────────────────────
// Creates a new accountability pod.

import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';
import { randomBytes } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyIdToken(token);
    const uid = decoded.uid;

    const { name, isPublic = false, description } = await req.json();
    if (!name) return NextResponse.json({ message: 'Name is required' }, { status: 400 });

    const inviteCode = randomBytes(4).toString('hex').toUpperCase();

    // Create pod document
    const podRef = adminDb.collection('pods').doc();
    const podData = {
      id: podRef.id,
      name,
      description: description || null,
      isPublic,
      inviteCode,
      creatorId: uid,
      members: [uid],
      createdAt: FieldValue.serverTimestamp(),
    };

    const batch = adminDb.batch();
    batch.set(podRef, podData);
    
    // Create member doc inside subcollection
    const memberRef = podRef.collection('members').doc(uid);
    batch.set(memberRef, {
      userId: uid,
      role: 'admin',
      joinedAt: FieldValue.serverTimestamp(),
      weeklyGoal: null,
      completedGoal: false,
    });

    // Update user's profile with podId
    const userRef = adminDb.doc(`users/${uid}`);
    batch.update(userRef, {
      podIds: FieldValue.arrayUnion(podRef.id),
    });

    await batch.commit();

    return NextResponse.json(podData);
  } catch (err) {
    console.error('[POST /api/pods/create]', err);
    return NextResponse.json({ message: 'Failed to create pod' }, { status: 500 });
  }
}
