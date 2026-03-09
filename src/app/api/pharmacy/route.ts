import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  
  if (id) {
    const medication = db.getMedication(id);
    if (!medication) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 });
    }
    return NextResponse.json(medication);
  }
  
  const medications = db.getMedications();
  return NextResponse.json(medications);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const medication = db.addMedication(body);
    return NextResponse.json(medication, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create medication" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const medication = db.updateMedication(id, data);
    if (!medication) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 });
    }
    return NextResponse.json(medication);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update medication" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    const success = db.deleteMedication(id);
    if (!success) {
      return NextResponse.json({ error: "Medication not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete medication" }, { status: 400 });
  }
}
