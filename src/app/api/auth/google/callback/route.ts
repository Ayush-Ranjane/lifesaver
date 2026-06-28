import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { adminDb } from '@/lib/firebase/admin';

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state'); // this is the uid

  if (!code || !state) {
    return NextResponse.json({ message: 'Missing code or state' }, { status: 400 });
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  );

  try {
    const { tokens } = await oauth2Client.getToken(code);
    
    // Save the refresh token to the user's document
    await adminDb.doc(`users/${state}`).update({
      googleRefreshToken: tokens.refresh_token || null,
      googleCalendarConnected: true,
      googleTokensUpdatedAt: new Date(),
    });

    // Redirect back to settings or dashboard
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?google_connected=true`);
  } catch (err) {
    console.error('[Google Callback Error]', err);
    return NextResponse.json({ message: 'Failed to authenticate with Google' }, { status: 500 });
  }
}
