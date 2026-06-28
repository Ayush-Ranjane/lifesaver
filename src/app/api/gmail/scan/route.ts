import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { google } from 'googleapis';

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyIdToken(token);
    const uid = decoded.uid;

    const userDoc = await adminDb.doc(`users/${uid}`).get();
    const data = userDoc.data();

    if (!data?.googleRefreshToken) {
      return NextResponse.json({ message: 'Google account not connected' }, { status: 400 });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ refresh_token: data.googleRefreshToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Fetch last 10 unread emails
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults: 10,
    });

    const messages = res.data.messages || [];
    if (messages.length === 0) {
      return NextResponse.json({ extractedTasks: [] });
    }

    // Get full message bodies
    const emailData = await Promise.all(
      messages.map(async (m) => {
        const msg = await gmail.users.messages.get({ userId: 'me', id: m.id!, format: 'full' });
        const headers = msg.data.payload?.headers;
        const subject = headers?.find(h => h.name === 'Subject')?.value || 'Untitled Email';
        const from = headers?.find(h => h.name === 'From')?.value || 'Unknown Sender';
        const snippet = msg.data.snippet;
        return { id: m.id, subject, from, snippet };
      })
    );

    // Fallback logic: Just suggest reading the emails
    const extractedTasks = emailData.map(email => ({
      title: `Read email: ${email.subject}`,
      sourceEmailId: email.id,
      confidence: 1.0,
      suggestedPriority: 'low'
    }));

    return NextResponse.json({ extractedTasks });
  } catch (err) {
    console.error('[Gmail Scan Error]', err);
    return NextResponse.json({ message: 'Failed to scan inbox' }, { status: 500 });
  }
}
