import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { format } from 'date-fns';

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { uid } = await verifyIdToken(token);

    const formatParam = req.nextUrl.searchParams.get('format') ?? 'csv';
    if (formatParam !== 'csv') {
      return NextResponse.json({ message: 'Only csv format is supported' }, { status: 400 });
    }

    const snap = await adminDb.collection(`users/${uid}/tasks`).get();
    const headers = [
      'taskId', 'title', 'status', 'priority', 'category', 'effort',
      'deadline', 'completedAt', 'createdAt', 'estimatedMinutes', 'actualMinutes', 'tags',
    ];

    const rows = snap.docs.map((doc) => {
      const t = doc.data();
      const deadline = t.deadline?.toDate?.();
      const completedAt = t.completedAt?.toDate?.();
      const createdAt = t.createdAt?.toDate?.();
      return [
        doc.id,
        t.title ?? '',
        t.status ?? '',
        t.priority ?? '',
        t.category ?? '',
        t.effort ?? '',
        deadline ? format(deadline, 'yyyy-MM-dd HH:mm') : '',
        completedAt ? format(completedAt, 'yyyy-MM-dd HH:mm') : '',
        createdAt ? format(createdAt, 'yyyy-MM-dd HH:mm') : '',
        String(t.estimatedMinutes ?? ''),
        t.actualMinutes != null ? String(t.actualMinutes) : '',
        (t.tags ?? []).join(';'),
      ].map((v) => escapeCsv(String(v)));
    });

    const csv = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const filename = `lifesaver-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('[GET /api/analytics/export]', error);
    return NextResponse.json({ message: 'Failed to export analytics' }, { status: 500 });
  }
}
