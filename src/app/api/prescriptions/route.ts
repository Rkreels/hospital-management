import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const patientId = searchParams.get('patientId');
    
    if (id) {
      const prescription = db.getPrescription(id);
      return NextResponse.json(prescription || { error: 'Prescription not found' }, { 
        status: prescription ? 200 : 404 
      });
    }
    
    let prescriptions = db.getPrescriptions();
    
    if (patientId) {
      prescriptions = prescriptions.filter(p => p.patientId === patientId);
    }
    
    return NextResponse.json(prescriptions);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch prescriptions' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newPrescription = db.addPrescription(body);
    
    db.addActivity({
      type: 'pharmacy',
      title: 'New prescription created',
      description: `Prescription ${newPrescription.prescriptionNumber} for ${body.patientName || 'patient'}`,
      department: 'Pharmacy',
    });
    
    return NextResponse.json(newPrescription);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create prescription' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Prescription ID required' }, { status: 400 });
    }
    
    const updated = db.updatePrescription(id, data);
    
    if (data.status === 'Dispensed') {
      db.addActivity({
        type: 'pharmacy',
        title: 'Prescription dispensed',
        description: `Prescription ${updated?.prescriptionNumber} has been dispensed`,
        department: 'Pharmacy',
      });
    }
    
    return NextResponse.json(updated || { error: 'Prescription not found' }, { 
      status: updated ? 200 : 404 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update prescription' }, { status: 500 });
  }
}
