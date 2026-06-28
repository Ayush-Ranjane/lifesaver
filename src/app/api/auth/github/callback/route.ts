import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';

type GitHubTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

export async function GET(req: NextRequest) {
  const code = req.nextUrl.searchParams.get('code');
  const state = req.nextUrl.searchParams.get('state'); // uid

  if (!code || !state) {
    return NextResponse.json({ message: 'Missing code or state' }, { status: 400 });
  }

  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  try {
    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`
      })
    });

    const data = await res.json() as GitHubTokenResponse;
    if (data.error) {
      throw new Error(data.error_description || data.error);
    }

    // Save token
    await adminDb.doc(`users/${state}`).update({
      githubToken: data.access_token,
      githubConnected: true,
      githubTokenUpdatedAt: new Date(),
    });

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/settings?github_connected=true`);
  } catch (err) {
    console.error('[GitHub Callback Error]', err);
    return NextResponse.json({ message: 'Failed to authenticate with GitHub' }, { status: 500 });
  }
}
