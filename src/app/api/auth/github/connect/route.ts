import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const uid = req.nextUrl.searchParams.get('uid');

  if (!clientId) {
    return NextResponse.json({ message: 'GitHub OAuth not configured in .env' }, { status: 500 });
  }

  if (!uid) {
    return NextResponse.json({ message: 'uid required' }, { status: 400 });
  }

  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`);
  url.searchParams.append('scope', 'repo');
  url.searchParams.append('state', uid);

  return NextResponse.redirect(url.toString());
}
