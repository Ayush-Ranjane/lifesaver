// ─── GET /api/goals — list goals
// ─── POST /api/goals — create goal + AI roadmap

import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { breakGoalIntoMilestones } from '@/lib/ai/goalRoadmap';
import { addDays } from 'date-fns';
import { v4 as uuidv4 } from 'uuid';
import type { CreateGoalInput, Goal } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { uid } = await verifyIdToken(token);

    const snapshot = await adminDb
      .collection(`users/${uid}/goals`)
      .where('status', 'in', ['active', 'paused'])
      .orderBy('targetDate', 'asc')
      .get();

    const goals = snapshot.docs.map(doc => ({
      ...doc.data(),
      goalId: doc.id,
      startDate: doc.data().startDate?.toDate?.(),
      targetDate: doc.data().targetDate?.toDate?.(),
      createdAt: doc.data().createdAt?.toDate?.(),
      updatedAt: doc.data().updatedAt?.toDate?.(),
    }));

    return NextResponse.json(goals);
  } catch (error) {
    console.error('[GET /api/goals]', error);
    return NextResponse.json({ message: 'Failed to fetch goals' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { uid } = await verifyIdToken(token);

    const body: CreateGoalInput = await req.json();
    if (!body.title || !body.type || !body.durationDays) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const now = new Date();
    const goalId = uuidv4();
    const startDate = now;
    const targetDate = addDays(now, body.durationDays);

    // Generate AI roadmap
    const milestones = await breakGoalIntoMilestones(body, startDate);

    const goal: Omit<Goal, 'goalId'> = {
      userId: uid,
      title: body.title,
      description: body.description ?? '',
      type: body.type,
      status: 'active',
      durationDays: body.durationDays,
      startDate,
      targetDate,
      milestones,
      checkIns: [],
      linkedTaskIds: [],
      progressPercent: 0,
      createdAt: now,
      updatedAt: now,
    };

    await adminDb.doc(`users/${uid}/goals/${goalId}`).set(goal);

    return NextResponse.json({ ...goal, goalId }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/goals]', error);
    return NextResponse.json({ message: 'Failed to create goal' }, { status: 500 });
  }
}
