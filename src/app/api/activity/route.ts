import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  try {
    const activities = db.getActivityLog(10);
    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch activity log' }, { status: 500 });
  }
}
