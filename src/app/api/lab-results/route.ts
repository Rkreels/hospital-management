import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const id = searchParams.get("id");
  
  if (id) {
    const labResult = db.getLabResult(id);
    if (!labResult) {
      return NextResponse.json({ error: "Lab result not found" }, { status: 404 });
    }
    return NextResponse.json(labResult);
  }
  
  const labResults = db.getLabResults();
  return NextResponse.json(labResults);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const labResult = db.addLabResult(body);
    return NextResponse.json(labResult, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create lab result" }, { status: 400 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    const labResult = db.updateLabResult(id, data);
    if (!labResult) {
      return NextResponse.json({ error: "Lab result not found" }, { status: 404 });
    }
    return NextResponse.json(labResult);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update lab result" }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    const success = db.deleteLabResult(id);
    if (!success) {
      return NextResponse.json({ error: "Lab result not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete lab result" }, { status: 400 });
  }
}
