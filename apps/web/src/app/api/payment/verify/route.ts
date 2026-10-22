import { NextRequest, NextResponse } from "next/server";
import { verifyAndProcessCallbackNative } from "@/lib/paymentService";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // 1. Try backend if configured
    if (BACKEND_URL && BACKEND_URL !== "http://localhost:8000") {
      try {
        const res = await fetch(`${BACKEND_URL}/api/payment/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(3000)
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data, { status: res.status });
        }
      } catch (backendErr) {
        console.warn("Backend verification unavailable:", backendErr);
      }
    }

    // 2. Native verification
    const result = verifyAndProcessCallbackNative(body);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to verify payment." },
      { status: 400 }
    );
  }
}
