import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';

type GitHubIssue = {
  id: number;
  title: string;
  repository: {
    full_name: string;
  };
  html_url: string;
  number: number;
};

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const decoded = await verifyIdToken(token);
    const uid = decoded.uid;

    const userDoc = await adminDb.doc(`users/${uid}`).get();
    const data = userDoc.data();

    if (!data?.githubToken) {
      return NextResponse.json({ message: 'GitHub not connected' }, { status: 400 });
    }

    const githubToken = data.githubToken;

    // Fetch user's assigned issues across all repos
    const res = await fetch('https://api.github.com/issues?state=open&filter=assigned', {
      headers: {
        'Authorization': `Bearer ${githubToken}`,
        'Accept': 'application/vnd.github.v3+json',
      }
    });

    if (!res.ok) {
      throw new Error(`GitHub API returned ${res.status}`);
    }

    const issues = await res.json() as GitHubIssue[];
    
    // Map to a simpler structure
    const mappedIssues = issues.map((i) => ({
      id: i.id.toString(),
      title: i.title,
      repo: i.repository.full_name,
      url: i.html_url,
      number: i.number
    }));

    return NextResponse.json({ issues: mappedIssues });
  } catch (err) {
    console.error('[GitHub Sync Error]', err);
    return NextResponse.json({ message: 'Failed to sync GitHub' }, { status: 500 });
  }
}
