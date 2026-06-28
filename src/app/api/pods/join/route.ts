// ─── POST /api/pods/join ───────────────────────────────────────────────────────
// Joins an existing accountability pod via invite code.

import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyIdToken(token);
    const uid = decoded.uid;

    const { inviteCode } = await req.json();
    if (!inviteCode) return NextResponse.json({ message: 'Invite code required' }, { status: 400 });

    const snapshot = await adminDb.collection('pods').where('inviteCode', '==', inviteCode).limit(1).get();
    if (snapshot.empty) {
      return NextResponse.json({ message: 'Invalid or expired invite code' }, { status: 404 });
    }

    const podDoc = snapshot.docs[0];
    const podData = podDoc.data();
    
    if (podData.members.includes(uid)) {
      return NextResponse.json({ message: 'Already a member' }, { status: 400 });
    }

    const batch = adminDb.batch();

    // Update pod members array
    batch.update(podDoc.ref, {
      members: FieldValue.arrayUnion(uid)
    });

    // Create member doc
    const memberRef = podDoc.ref.collection('members').doc(uid);
    batch.set(memberRef, {
      userId: uid,
      role: 'member',
      joinedAt: FieldValue.serverTimestamp(),
      weeklyGoal: null,
      completedGoal: false,
    });

    // Update user profile
    const userRef = adminDb.doc(`users/${uid}`);
    batch.update(userRef, {
      podIds: FieldValue.arrayUnion(podDoc.id),
    });

    await batch.commit();

    return NextResponse.json({ id: podDoc.id, name: podData.name });
  } catch (err) {
    console.error('[POST /api/pods/join]', err);
    return NextResponse.json({ message: 'Failed to join pod' }, { status: 500 });
  }
}
