import { NextRequest, NextResponse } from "next/server";

export async function PUT(req: NextRequest, { params }: { params: { medicineId: string } }) {
  try {
    const body = await req.json();
    return NextResponse.json({ success: true, updated: { medicineId: params.medicineId, ...body } });
  } catch (e) {
    return NextResponse.json({ success: false, error: "Invalid body" }, { status: 400 });
  }
}
