import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { sendEmail } from '@/lib/email';
import { render } from '@react-email/components';
import SummaryEmail from '@/emails/SummaryEmail';
import type { Task, Goal } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }
    
    const decoded = await verifyIdToken(token);
    const uid = decoded.uid;
    const userEmail = decoded.email;
    const userName = decoded.name || 'User';

    if (!userEmail) {
      return NextResponse.json({ message: 'User email not found in token' }, { status: 400 });
    }

    // Fetch active tasks (filter/sort in memory to avoid index requirements)
    const tasksSnap = await adminDb
      .collection(`users/${uid}/tasks`)
      .where('isArchived', '==', false)
      .get();
      
    let tasks: Task[] = tasksSnap.docs
      .map(doc => ({
        ...(doc.data() as Omit<Task, 'taskId'>),
        taskId: doc.id,
        deadline: doc.data().deadline?.toDate?.() ?? new Date(),
      }))
      .filter(t => t.status === 'pending' || t.status === 'in_progress')
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

    // Fetch active goals (filter/sort in memory to avoid index requirements)
    const goalsSnap = await adminDb
      .collection(`users/${uid}/goals`)
      .get();
      
    let goals: Goal[] = goalsSnap.docs
      .map(doc => ({
        ...(doc.data() as Omit<Goal, 'goalId'>),
        goalId: doc.id,
        deadline: doc.data().deadline?.toDate?.() ?? new Date(),
      }))
      .filter(g => g.status === 'not_started' || g.status === 'in_progress')
      .sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

    // Render the email
    const emailHtml = await render(
      SummaryEmail({
        userName,
        tasks,
        goals,
      })
    );

    // Send email
    await sendEmail({
      to: userEmail,
      subject: '🚀 Your LifeSaver Daily Briefing',
      text: `Good morning, ${userName}! You have ${tasks.length} active tasks today.`,
      html: emailHtml,
    });

    return NextResponse.json({ message: 'Summary email sent successfully' }, { status: 200 });
  } catch (error: unknown) {
    console.error('[POST /api/email/summary]', error);
    return NextResponse.json({ message: 'Failed to send summary email' }, { status: 500 });
  }
}
