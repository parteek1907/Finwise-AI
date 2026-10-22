import { NextRequest, NextResponse } from "next/server";
import { decodeAuthToken, getUserSubscriptionNative } from "@/lib/paymentService";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const decoded = decodeAuthToken(authHeader);
    const userId = decoded?.uid || "demo_user";
    const email = decoded?.email || "";

    // 1. Try backend if configured
    if (BACKEND_URL && BACKEND_URL !== "http://localhost:8000") {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (authHeader) headers["Authorization"] = authHeader;

        const res = await fetch(`${BACKEND_URL}/api/subscription/current`, {
          method: "GET",
          headers,
          cache: "no-store",
          signal: AbortSignal.timeout(3000)
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data, { status: res.status });
        }
      } catch (backendErr) {
        console.warn("Backend subscription unavailable:", backendErr);
      }
    }

    // 2. Native subscription from memory / default
    const subscription = getUserSubscriptionNative(userId, email);
    return NextResponse.json({ ...subscription, subscription }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching subscription details:", error);
    return NextResponse.json(
      { detail: "Failed to fetch subscription information." },
      { status: 500 }
    );
  }
}
