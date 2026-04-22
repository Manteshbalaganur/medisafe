import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // In demo mode, state is in localStorage. Return a mock or empty.
  return NextResponse.json({ success: true, data: { id: params.id } });
}
