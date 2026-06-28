// ─── GET /api/habits — list habits
// ─── POST /api/habits — create habit

import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken, extractBearerToken, adminDb } from '@/lib/firebase/admin';
import { v4 as uuidv4 } from 'uuid';
import type { CreateHabitInput, Habit } from '@/types';

export async function GET(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { uid } = await verifyIdToken(token);

    const snap = await adminDb.collection(`users/${uid}/habits`).orderBy('createdAt', 'desc').get();
    const habits = snap.docs.map(d => ({ ...d.data(), habitId: d.id, createdAt: d.data().createdAt?.toDate?.(), updatedAt: d.data().updatedAt?.toDate?.() }));
    return NextResponse.json(habits);
  } catch (error) {
    console.error('[GET /api/habits]', error);
    return NextResponse.json({ message: 'Failed to fetch habits' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const token = extractBearerToken(req.headers.get('Authorization'));
    if (!token) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    const { uid } = await verifyIdToken(token);

    const body: CreateHabitInput = await req.json();
    if (!body.name) return NextResponse.json({ message: 'name is required' }, { status: 400 });

    const habitId = uuidv4();
    const now = new Date();
    const habit: Omit<Habit, 'habitId'> = {
      userId: uid,
      name: body.name,
      description: '',
      frequency: body.frequency ?? 'daily',
      targetDaysOfWeek: body.targetDaysOfWeek ?? [],
      reminderTime: body.reminderTime ?? null,
      category: body.category ?? 'personal',
      currentStreak: 0,
      longestStreak: 0,
      streakLastUpdatedDate: '',
      isPaused: false,
      pausedUntil: null,
      pauseCount: 0,
      entries: [],
      milestonesReached: [],
      createdAt: now,
      updatedAt: now,
    };

    await adminDb.doc(`users/${uid}/habits/${habitId}`).set(habit);
    return NextResponse.json({ ...habit, habitId }, { status: 201 });
  } catch (error) {
    console.error('[POST /api/habits]', error);
    return NextResponse.json({ message: 'Failed to create habit' }, { status: 500 });
  }
}
