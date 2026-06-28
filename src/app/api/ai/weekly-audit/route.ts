// ─── GET /api/ai/weekly-audit — fetch existing audit for current week
// ─── POST /api/ai/weekly-audit — generate new audit (static fallback)

import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { getISOWeek, getYear, subDays } from 'date-fns';
import { FieldValue } from 'firebase-admin/firestore';

type WeeklyAuditTaskData = {
  title?: string;
  status?: string;
  deadline?: { toDate?: () => Date };
};

function getWeekId() {
  const now = new Date();
  return `${getYear(now)}-W${String(getISOWeek(now)).padStart(2, '0')}`;
}

async function authenticate(req: NextRequest) {
  const token = extractBearerToken(req.headers.get('Authorization'));
  if (!token) return null;
  return verifyIdToken(token);
}

// ── GET: fetch existing audit for this week ──────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const decoded = await authenticate(req);
    if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const weekId = getWeekId();
    const auditRef = adminDb.doc(`users/${decoded.uid}/weeklyAudits/${weekId}`);
    const snap = await auditRef.get();

    if (!snap.exists) return NextResponse.json(null);
    return NextResponse.json({ weekId, ...snap.data() });
  } catch (err) {
    console.error('[GET /api/ai/weekly-audit]', err);
    return NextResponse.json({ message: 'Failed to fetch audit' }, { status: 500 });
  }
}

// ── POST: generate new audit ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const decoded = await authenticate(req);
    if (!decoded) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const uid = decoded.uid;
    const weekId = getWeekId();
    const sevenDaysAgo = subDays(new Date(), 7);

    // Fetch data in parallel
    const tasksSnap = await adminDb.collection(`users/${uid}/tasks`).where('deadline', '>=', sevenDaysAgo).get();

    const allTasks = tasksSnap.docs.map(d => d.data() as WeeklyAuditTaskData);
    const completedTasks = allTasks.filter(t => t.status === 'completed');
    const now = new Date();
    const overdueTasks = allTasks.filter((t) => {
      const deadline = t.deadline?.toDate?.();
      return t.status !== 'completed' && deadline !== undefined && deadline < now;
    });

    const auditData = {
      weekScore: completedTasks.length > 5 ? 8 : 5,
      headline: `You completed ${completedTasks.length} tasks this week. Keep the momentum going!`,
      wins: [
        `Completed ${completedTasks.length} tasks`,
        "Stayed consistent with the app",
        "Kept your goals in focus"
      ],
      patterns: [
        "You're actively logging your priorities",
        overdueTasks.length > 0 ? "Some tasks are slipping past deadlines" : "Great job hitting deadlines"
      ],
      avoidances: overdueTasks.slice(0, 2).map((t) => t.title ?? 'Untitled task') || ["None!"],
      nextWeekGoals: [
        "Review overdue tasks",
        "Plan your top 3 priorities for Monday",
        "Take a break and recharge"
      ],
      closingNote: "Consistency is key. You're doing great, just take it one day at a time."
    };

    // Save to Firestore
    await adminDb.doc(`users/${uid}/weeklyAudits/${weekId}`).set({
      ...auditData,
      weekId,
      generatedAt: FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ weekId, ...auditData, generatedAt: new Date().toISOString() });
  } catch (err) {
    console.error('[POST /api/ai/weekly-audit]', err);
    return NextResponse.json({ message: 'Audit generation failed' }, { status: 500 });
  }
}
