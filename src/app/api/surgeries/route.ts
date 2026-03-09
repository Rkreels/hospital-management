import { NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const date = searchParams.get('date');
    
    if (id) {
      const surgery = db.getSurgery(id);
      return NextResponse.json(surgery || { error: 'Surgery not found' }, { status: surgery ? 200 : 404 });
    }
    
    let surgeries = db.getSurgeries();
    if (date) {
      surgeries = surgeries.filter(s => s.scheduledDate === date);
    }
    
    return NextResponse.json(surgeries);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch surgeries' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const surgery = db.addSurgery(body);
    return NextResponse.json(surgery);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create surgery' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    const surgery = db.updateSurgery(id, updates);
    return NextResponse.json(surgery || { error: 'Surgery not found' }, { status: surgery ? 200 : 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update surgery' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Surgery ID is required' }, { status: 400 });
    }
    
    // Set status to Cancelled instead of deleting
    const surgery = db.updateSurgery(id, { status: 'Cancelled' });
    return NextResponse.json(surgery || { error: 'Surgery not found' }, { status: surgery ? 200 : 404 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete surgery' }, { status: 500 });
  }
}
