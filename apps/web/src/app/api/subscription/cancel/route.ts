import { NextRequest, NextResponse } from "next/server";
import { cancelSubscriptionNative, decodeAuthToken } from "@/lib/paymentService";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const authHeader = req.headers.get("authorization");
    const decoded = decodeAuthToken(authHeader);
    const userId = decoded?.uid || body.user_id || "demo_user";

    // 1. Try backend if configured
    if (BACKEND_URL && BACKEND_URL !== "http://localhost:8000") {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (authHeader) headers["Authorization"] = authHeader;

        const res = await fetch(`${BACKEND_URL}/api/subscription/cancel`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(3000)
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data, { status: res.status });
        }
      } catch (backendErr) {
        console.warn("Backend cancel unavailable:", backendErr);
      }
    }

    // 2. Native cancellation
    const result = cancelSubscriptionNative(userId, body.reason, body.feedback);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error cancelling subscription:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to process cancellation request." },
      { status: 400 }
    );
  }
}
