import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  
  if (id) {
    const admission = db.getAdmission(id);
    if (!admission) {
      return NextResponse.json({ error: "Admission not found" }, { status: 404 });
    }
    return NextResponse.json(admission);
  }
  
  const admissions = db.getAdmissions();
  return NextResponse.json(admissions);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const admission = db.addAdmission(body);
    return NextResponse.json(admission, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create admission" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const admission = db.updateAdmission(id, data);
    if (!admission) {
      return NextResponse.json({ error: "Admission not found" }, { status: 404 });
    }
    return NextResponse.json(admission);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update admission" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    const success = db.deleteAdmission(id);
    if (!success) {
      return NextResponse.json({ error: "Admission not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete admission" }, { status: 400 });
  }
}
