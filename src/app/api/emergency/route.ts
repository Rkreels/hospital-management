import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  
  if (id) {
    const emergencyCase = db.getEmergencyCase(id);
    if (!emergencyCase) {
      return NextResponse.json({ error: "Emergency case not found" }, { status: 404 });
    }
    return NextResponse.json(emergencyCase);
  }
  
  const emergencyCases = db.getEmergencyCases();
  return NextResponse.json(emergencyCases);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const emergencyCase = db.addEmergencyCase(body);
    return NextResponse.json(emergencyCase, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create emergency case" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const emergencyCase = db.updateEmergencyCase(id, data);
    if (!emergencyCase) {
      return NextResponse.json({ error: "Emergency case not found" }, { status: 404 });
    }
    return NextResponse.json(emergencyCase);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update emergency case" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    const success = db.deleteEmergencyCase(id);
    if (!success) {
      return NextResponse.json({ error: "Emergency case not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete emergency case" }, { status: 400 });
  }
}
