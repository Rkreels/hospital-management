import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  
  if (id) {
    const nurse = db.getNurse(id);
    if (!nurse) {
      return NextResponse.json({ error: "Nurse not found" }, { status: 404 });
    }
    return NextResponse.json(nurse);
  }
  
  const nurses = db.getNurses();
  return NextResponse.json(nurses);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const nurse = db.addNurse(body);
    return NextResponse.json(nurse, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create nurse" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const nurse = db.updateNurse(id, data);
    if (!nurse) {
      return NextResponse.json({ error: "Nurse not found" }, { status: 404 });
    }
    return NextResponse.json(nurse);
  } catch {
    return NextResponse.json({ error: "Failed to update nurse" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    const success = db.deleteNurse(id);
    if (!success) {
      return NextResponse.json({ error: "Nurse not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete nurse" }, { status: 400 });
  }
}
