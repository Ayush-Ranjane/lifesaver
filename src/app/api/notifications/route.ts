// ─── GET /api/notifications ─── list
// ─── POST /api/notifications ── mark read

import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { uid } = await verifyIdToken(token);

    const snap = await adminDb
      .collection(`users/${uid}/notifications`)
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    const notifications = snap.docs.map(d => ({
      ...d.data(),
      notificationId: d.id,
      createdAt: d.data().createdAt?.toDate?.(),
      readAt: d.data().readAt?.toDate?.() ?? null,
    }));

    return NextResponse.json(notifications);
  } catch (error) {
    console.error('[GET /api/notifications]', error);
    return NextResponse.json({ message: 'Failed to fetch notifications' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { uid } = await verifyIdToken(token);

    const { ids, action } = await req.json();
    if (action !== 'mark_read' || !Array.isArray(ids)) {
      return NextResponse.json({ message: 'Invalid request' }, { status: 400 });
    }

    const batch = adminDb.batch();
    for (const id of ids) {
      const ref = adminDb.doc(`users/${uid}/notifications/${id}`);
      batch.update(ref, { isRead: true, readAt: FieldValue.serverTimestamp() });
    }
    await batch.commit();

    return NextResponse.json({ updated: ids.length });
  } catch (error) {
    console.error('[POST /api/notifications]', error);
    return NextResponse.json({ message: 'Failed to update notifications' }, { status: 500 });
  }
}
