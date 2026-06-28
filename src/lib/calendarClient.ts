import { google } from 'googleapis';
import { adminDb } from '@/lib/firebase/admin';

export async function getCalendarClient(uid: string) {
  const userDoc = await adminDb.doc(`users/${uid}`).get();
  const data = userDoc.data();

  if (!data?.googleRefreshToken) {
    throw new Error('Google account not connected');
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  
  oauth2Client.setCredentials({ refresh_token: data.googleRefreshToken });
  
  return google.calendar({ version: 'v3', auth: oauth2Client });
}
