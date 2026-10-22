import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id") || "demo_user";
    const email = searchParams.get("email") || "";

    const url = new URL(`${BACKEND_URL}/api/user/access`);
    url.searchParams.set("user_id", userId);
    if (email) url.searchParams.set("email", email);

    const res = await fetch(url.toString(), { cache: "no-store" });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
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
