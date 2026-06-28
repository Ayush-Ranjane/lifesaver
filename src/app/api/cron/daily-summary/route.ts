import { NextRequest, NextResponse } from 'next/server';
import { adminDb, adminAuth } from '@/lib/firebase/admin';
import { sendEmail } from '@/lib/email';
import { render } from '@react-email/components';
import SummaryEmail from '@/emails/SummaryEmail';
import type { Task, Goal } from '@/types';

// Vercel Cron compatible endpoint
export async function GET(req: NextRequest) {
  try {
    // Optional: Protect with a CRON_SECRET in production
    const authHeader = req.headers.get('authorization');
    if (
      process.env.CRON_SECRET &&
      authHeader !== `Bearer ${process.env.CRON_SECRET}`
    ) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Get all users from Firebase Auth
    // Note: In a production app with many users, you would iterate with pagination
    // or use a Pub/Sub fan-out architecture.
    const listUsersResult = await adminAuth.listUsers(100);
    const users = listUsersResult.users;

    let emailsSent = 0;

    for (const userRecord of users) {
      const uid = userRecord.uid;
      const userEmail = userRecord.email;
      const userName = userRecord.displayName || 'User';

      if (!userEmail) continue;

      // 1. Fetch active tasks for this user (filter/sort in memory)
      const tasksSnap = await adminDb
        .collection(`users/${uid}/tasks`)
        .where('isArchived', '==', false)
        .get();

      const tasks: Task[] = tasksSnap.docs
        .map((doc) => ({
          ...(doc.data() as Omit<Task, 'taskId'>),
          taskId: doc.id,
          deadline: doc.data().deadline?.toDate?.() ?? new Date(),
        }))
        .filter((t) => t.status === 'pending' || t.status === 'in_progress')
        .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

      // Skip sending email if they have 0 tasks? Optional.
      if (tasks.length === 0) continue;

      // 2. Fetch active goals for this user (filter/sort in memory)
      const goalsSnap = await adminDb
        .collection(`users/${uid}/goals`)
        .get();

      const goals: Goal[] = goalsSnap.docs
        .map((doc) => ({
          ...(doc.data() as Omit<Goal, 'goalId'>),
          goalId: doc.id,
          deadline: doc.data().deadline?.toDate?.() ?? new Date(),
        }))
        .filter((g) => g.status === 'not_started' || g.status === 'in_progress')
        .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

      // 3. Render Email
      const emailHtml = await render(
        SummaryEmail({
          userName,
          tasks,
          goals,
        })
      );

      // 4. Send Email
      await sendEmail({
        to: userEmail,
        subject: '🚀 Your LifeSaver Daily Briefing',
        text: `Good morning, ${userName}! You have ${tasks.length} active tasks today.`,
        html: emailHtml,
      });

      emailsSent++;
    }

    return NextResponse.json(
      { message: `Daily summaries processed successfully. Sent ${emailsSent} emails.` },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error('[GET /api/cron/daily-summary]', error);
    return NextResponse.json(
      { message: 'Failed to process daily summaries' },
      { status: 500 }
    );
  }
}
