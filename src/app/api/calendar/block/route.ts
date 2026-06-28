import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { getCalendarClient } from '@/lib/calendarClient';

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyIdToken(token);
    const uid = decoded.uid;

    const { taskId, start, end, title } = await req.json();

    const calendar = await getCalendarClient(uid);

    // Create event on primary calendar
    const res = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: `🎯 ${title}`,
        description: 'Scheduled via LifeSaver AI',
        start: { dateTime: new Date(start).toISOString() },
        end: { dateTime: new Date(end).toISOString() },
        colorId: '9', // Blueberry color
      }
    });

    // Update task in firestore with event ID
    if (res.data.id) {
      await adminDb.doc(`users/${uid}/tasks/${taskId}`).update({
        calendarEventId: res.data.id,
      });
    }

    return NextResponse.json({ success: true, eventId: res.data.id });
  } catch (err) {
    console.error('[Calendar Block Error]', err);
    return NextResponse.json({ message: 'Failed to block calendar' }, { status: 500 });
  }
}
