import { NextRequest, NextResponse } from "next/server";
import { getUserSubscriptionNative } from "@/lib/paymentService";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id") || "demo_user";
    const email = searchParams.get("email") || "";

    // 1. Try backend if configured and not local default
    if (BACKEND_URL && BACKEND_URL !== "http://localhost:8000") {
      try {
        const url = new URL(`${BACKEND_URL}/api/user/access`);
        url.searchParams.set("user_id", userId);
        if (email) url.searchParams.set("email", email);

        const res = await fetch(url.toString(), {
          cache: "no-store",
          signal: AbortSignal.timeout(2000)
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data, { status: res.status });
        }
      } catch (backendErr) {
        console.warn("Backend access check unavailable:", backendErr);
      }
    }

    // 2. Native entitlement check
    const sub = getUserSubscriptionNative(userId, email);
    let tier = sub.tier;
    let planId = sub.plan_id;

    // Check last payment cookie if memory is cold
    const cookieVal = req.cookies.get("finwise_last_payment")?.value;
    if (cookieVal && tier === "FOUNDATION") {
      try {
        const parsed = JSON.parse(cookieVal);
        if (parsed.status === "success" && (parsed.user_id === userId || (email && parsed.user_email === email))) {
          tier = parsed.plan_id?.includes("STUDENT") ? "STUDENT" : parsed.plan_id?.includes("PREMIUM") ? "PREMIUM" : "FOUNDATION";
          planId = parsed.plan_id;
        }
      } catch (e) {
        // ignore
      }
    }

    return NextResponse.json(
      {
        entitlement: {
          user_id: userId,
          user_email: email,
          tier,
          plan_id: planId,
          status: sub.status || "active",
          purchased_items: [planId],
          expires_at: sub.expires_at
        },
        daily_usage: { mentor_queries: 0, scam_scans: 0, emotion_scans: 0 }
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching user access:", error);
    return NextResponse.json(
      {
        entitlement: { tier: "FOUNDATION", plan_id: "FOUNDATION", status: "active", purchased_items: [] },
        daily_usage: { mentor_queries: 0, scam_scans: 0, emotion_scans: 0 }
      },
      { status: 200 }
    );
  }
}
