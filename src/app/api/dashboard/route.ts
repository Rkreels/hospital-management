import { NextResponse } from "next/server";
import { db } from "@/lib/store";

export async function GET() {
  const stats = db.getDashboardStats();
  return NextResponse.json(stats);
}
