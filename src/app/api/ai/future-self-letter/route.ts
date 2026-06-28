import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyIdToken(token);
    const uid = decoded.uid;

    const { targetDate, prompt: userPrompt } = await req.json();

    const letterContent = `Dear Future Me,\n\n${userPrompt}\n\nKeep pushing forward!`;

    // Save to Firestore so a background cron/Cloud Function can pick it up
    const docRef = adminDb.collection('futureLetters').doc();
    await docRef.set({
      userId: uid,
      targetDate: new Date(targetDate),
      content: letterContent,
      status: 'scheduled',
      createdAt: new Date(),
    });

    return NextResponse.json({ success: true, letterId: docRef.id });
  } catch (err) {
    console.error('[Future Letter Error]', err);
    return NextResponse.json({ message: 'Failed to save letter' }, { status: 500 });
  }
}
