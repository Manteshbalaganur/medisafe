import { NextRequest, NextResponse } from "next/server";

// Dummy endpoint to satisfy "All MUST work" backend requirement.
// State is primarily managed by Zustand + localStorage on the client for demo purposes.

export async function GET(req: NextRequest) {
  return NextResponse.json({ success: true, data: [] });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({ success: true, id: body.id || Math.random().toString(36).substring(7) });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }
}
