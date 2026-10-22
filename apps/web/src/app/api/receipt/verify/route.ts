import { NextRequest, NextResponse } from "next/server";
import { getPublicReceiptVerificationNative } from "@/lib/paymentService";

const BACKEND_URL = process.env.BACKEND_URL;

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

    // 1. Try backend if configured
    if (BACKEND_URL && BACKEND_URL !== "http://localhost:8000") {
      try {
        const res = await fetch(`${BACKEND_URL}/api/receipt/verify?id=${encodeURIComponent(id)}`, {
          method: "GET",
          cache: "no-store",
          signal: AbortSignal.timeout(3000)
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data, { status: res.status });
        }
      } catch (backendErr) {
        console.warn("Backend receipt verification unavailable:", backendErr);
      }
    }

    // 2. Native receipt verification
    const verification = getPublicReceiptVerificationNative(id);
    if (!verification.valid) {
      return NextResponse.json(
        { error: verification.error || "No verified payment record found for this receipt identifier." },
        { status: 404 }
      );
    }

    return NextResponse.json(verification, { status: 200 });
  } catch (error: any) {
    console.error("Error verifying receipt:", error);
    return NextResponse.json(
      { error: "Failed to verify receipt. Verification service currently unavailable." },
      { status: 500 }
    );
  }
}
