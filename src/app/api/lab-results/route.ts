import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const patientId = searchParams.get('patientId');
    
    if (id) {
      const labResult = db.getLabResult(id);
      return NextResponse.json(labResult || { error: 'Lab result not found' }, { 
        status: labResult ? 200 : 404 
      });
    }
    
    let labResults = db.getLabResults();
    
    if (patientId) {
      labResults = labResults.filter(l => l.patientId === patientId);
    }
    
    return NextResponse.json(labResults);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch lab results' }, { status: 500 });
  }
}
