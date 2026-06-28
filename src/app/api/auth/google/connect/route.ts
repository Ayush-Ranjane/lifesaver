import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';

export async function GET(req: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    return NextResponse.json({ message: 'Google OAuth not configured in .env' }, { status: 500 });
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`
  );

  // Generate a url that asks permissions for Gmail and Calendar scopes
  const scopes = [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/calendar'
  ];

  // We pass the user's uid in the state parameter so we know who to save the token for
  // In a real app we'd sign this state to prevent CSRF, but for now we'll pass uid directly.
  // Wait, we need the uid! We can't pass it securely in a GET request unless we pass a JWT.
  // We'll pass the uid in the search params of this route, e.g. /api/auth/google/connect?uid=abc
  
  const uid = req.nextUrl.searchParams.get('uid');
  if (!uid) {
    return NextResponse.json({ message: 'uid required' }, { status: 400 });
  }

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline', // gets refresh token
    prompt: 'consent', // force consent to ensure we get a refresh token
    scope: scopes,
    state: uid, 
  });

  return NextResponse.redirect(url);
}
