import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyIdToken(token);
    const uid = decoded.uid;

    const { podId } = await req.json();
    if (!podId) return NextResponse.json({ message: 'podId required' }, { status: 400 });

    // Verify membership
    const memberSnap = await adminDb.doc(`pods/${podId}/members/${uid}`).get();
    if (!memberSnap.exists) return NextResponse.json({ message: 'Not a member' }, { status: 403 });

    // Get all members and their goals
    const membersSnap = await adminDb.collection(`pods/${podId}/members`).get();
    const membersData = membersSnap.docs.map(d => d.data());

    const completedCount = membersData.filter(m => m.completedGoal).length;
    const totalCount = membersData.length;

    const digestText = `### Weekly Pod Progress\n\nThis week, **${completedCount} out of ${totalCount} members** successfully completed their goals!\n\nKeep pushing each other and stay accountable for next week!`;

    await adminDb.doc(`pods/${podId}`).update({
      latestDigest: digestText,
      digestGeneratedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ digest: digestText });
  } catch (err) {
    console.error('[POST /api/pods/digest]', err);
    return NextResponse.json({ message: 'Failed to generate digest' }, { status: 500 });
  }
}
