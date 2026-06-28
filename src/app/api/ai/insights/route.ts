import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { generateAIInsight } from '@/lib/ai/insights';
import { computeFocusScore, getPeakProductivityHours } from '@/lib/analytics';
import type { Task } from '@/types';

// ─── Per-user server-side cooldown ────────────────────────────────────────────
// Prevents hammering Gemini when Dashboard + Analytics both mount at once.
// The in-memory prompt cache in gemini.ts also deduplicates, but this guard
// stops us even building the prompt or hitting Firestore unnecessarily.
const INSIGHTS_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour
const lastInsightAt = new Map<string, number>();

function isRateLimitError(err: unknown) {
  if (!(err instanceof Error)) return false;
  const maybeStatus = err as Error & { status?: number };
  return err.message.includes('rate limit') || maybeStatus.status === 429;
}

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { uid } = await verifyIdToken(token);

    // ── Cooldown check ──────────────────────────────────────────────────────
    const last = lastInsightAt.get(uid) ?? 0;
    const elapsed = Date.now() - last;
    if (elapsed < INSIGHTS_COOLDOWN_MS) {
      const retryAfterSec = Math.ceil((INSIGHTS_COOLDOWN_MS - elapsed) / 1000);
      console.debug(`[GET /api/ai/insights] Cooldown active for ${uid}. Retry in ${retryAfterSec}s`);
      return NextResponse.json(
        { message: 'Insight already generated recently. Try again later.' },
        {
          status: 429,
          headers: { 'Retry-After': String(retryAfterSec) },
        }
      );
    }

    const userDoc = await adminDb.doc(`users/${uid}`).get();
    const userData = userDoc.data() ?? {};

    const snap = await adminDb.collection(`users/${uid}/tasks`).get();
    const tasks = snap.docs.map((d) => {
      const data = d.data();
      return {
        ...data,
        taskId: d.id,
        deadline: data.deadline?.toDate?.() ?? new Date(),
        completedAt: data.completedAt?.toDate?.() ?? null,
        createdAt: data.createdAt?.toDate?.() ?? new Date(),
      } as Task;
    });

    const focusScore = computeFocusScore(tasks, userData.currentStreak ?? 0, 'week');
    const peakData = getPeakProductivityHours(tasks);
    let insight;
    try {
      insight = await generateAIInsight(uid, tasks, focusScore, peakData);
      // Record successful call time to trigger cooldown
      lastInsightAt.set(uid, Date.now());
    } catch (err) {
      // If it failed because of a rate limit (429), trigger the cooldown anyway
      // to avoid calling the API repeatedly on page refreshes.
      if (isRateLimitError(err)) {
        lastInsightAt.set(uid, Date.now());
      }
      throw err;
    }

    return NextResponse.json(insight);
  } catch (error) {
    console.error('[GET /api/ai/insights]', error);
    // Return the fallback response directly from the API endpoint
    return NextResponse.json({
      narrative: "You're making steady progress on your tasks. Keep building consistency!",
      recommendation: "Plan your most important tasks during your peak energy hours.",
      generatedAt: new Date()
    });
  }
}
