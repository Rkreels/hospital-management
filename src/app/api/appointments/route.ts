import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const limit = searchParams.get('limit');
    
    if (id) {
      const appointment = db.getAppointment(id);
      return NextResponse.json(appointment || { error: 'Appointment not found' }, { 
        status: appointment ? 200 : 404 
      });
    }
    
    let appointments = db.getAppointments();
    
    if (limit) {
      appointments = appointments.slice(0, parseInt(limit));
    }
    
    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newAppointment = db.addAppointment(body);
    return NextResponse.json(newAppointment);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });
    }
    
    const updated = db.updateAppointment(id, data);
    return NextResponse.json(updated || { error: 'Appointment not found' }, { 
      status: updated ? 200 : 404 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });
    }
    
    const deleted = db.deleteAppointment(id);
    return NextResponse.json({ success: deleted });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete appointment' }, { status: 500 });
  }
}
