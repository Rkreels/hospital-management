import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET() {
  try {
    const theaters = db.getSurgeryTheaters();
    return NextResponse.json(theaters);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch theaters' }, { status: 500 });
  }
}
