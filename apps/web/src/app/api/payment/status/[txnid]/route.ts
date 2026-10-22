import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ txnid: string }> }
) {
  try {
    const { txnid } = await params;
    if (!txnid) {
      return NextResponse.json({ error: "Missing txnid" }, { status: 400 });
    }

    const res = await fetch(`${BACKEND_URL}/api/payment/status/${encodeURIComponent(txnid)}`, {
      cache: "no-store",
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Error proxying payment status:", error);
    return NextResponse.json({ error: "Failed to fetch payment status" }, { status: 500 });
  }
}
