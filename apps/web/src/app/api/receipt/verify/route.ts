import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Receipt identifier query parameter 'id' is required." },
        { status: 400 }
      );
    }

    const res = await fetch(`${BACKEND_URL}/api/receipt/verify?id=${encodeURIComponent(id)}`, {
      method: "GET",
      cache: "no-store",
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    console.error("Error verifying receipt:", error);
    return NextResponse.json(
      { error: "Failed to verify receipt. Verification service currently unavailable." },
      { status: 500 }
    );
  }
}
