import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken } from '@/lib/firebase/admin';
import { getCalendarClient } from '@/lib/calendarClient';
import { startOfDay, endOfDay } from 'date-fns';

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyIdToken(token);
    const uid = decoded.uid;

    const calendar = await getCalendarClient(uid);

    // Get today's events to show busy blocks
    const now = new Date();
    const res = await calendar.events.list({
      calendarId: 'primary',
      timeMin: startOfDay(now).toISOString(),
      timeMax: endOfDay(now).toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    });

    const events = res.data.items || [];
    const busyBlocks = events.map(e => ({
      id: e.id,
      title: e.summary,
      start: e.start?.dateTime || e.start?.date,
      end: e.end?.dateTime || e.end?.date,
    }));

    return NextResponse.json({ busyBlocks });
  } catch (err) {
    console.error('[Calendar Sync Error]', err);
    return NextResponse.json({ message: 'Failed to sync calendar' }, { status: 500 });
  }
}
