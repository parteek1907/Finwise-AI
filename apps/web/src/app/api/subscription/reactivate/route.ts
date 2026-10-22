import { NextRequest, NextResponse } from "next/server";
import { decodeAuthToken, reactivateSubscriptionNative } from "@/lib/paymentService";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const decoded = decodeAuthToken(authHeader);
    const userId = decoded?.uid || "demo_user";

    // 1. Try backend if configured
    if (BACKEND_URL && BACKEND_URL !== "http://localhost:8000") {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (authHeader) headers["Authorization"] = authHeader;

        const res = await fetch(`${BACKEND_URL}/api/subscription/reactivate`, {
          method: "POST",
          headers,
          signal: AbortSignal.timeout(3000)
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data, { status: res.status });
        }
      } catch (backendErr) {
        console.warn("Backend reactivate unavailable:", backendErr);
      }
    }

    // 2. Native reactivation
    const result = reactivateSubscriptionNative(userId);
    return NextResponse.json(result, { status: 200 });
  } catch (error: any) {
    console.error("Error reactivating subscription:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to reactivate subscription." },
      { status: 500 }
    );
  }
}
