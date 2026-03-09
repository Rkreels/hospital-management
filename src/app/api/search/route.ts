import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    
    if (query.length < 2) {
      return NextResponse.json([]);
    }
    
    const results = db.globalSearch(query);
    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to search' }, { status: 500 });
  }
}
