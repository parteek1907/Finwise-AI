import { NextRequest, NextResponse } from "next/server";
import { devResetUserBillingNative, decodeAuthToken } from "@/lib/paymentService";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const authHeader = req.headers.get("authorization");
  const decoded = decodeAuthToken(authHeader);
  const userId = decoded?.uid || body.user_id || "demo_user";
  const email = decoded?.email || body.email || "";

  // 1. Try forwarding to FastAPI backend if configured
  if (BACKEND_URL && BACKEND_URL !== "http://localhost:8000") {
    try {
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (authHeader) headers["Authorization"] = authHeader;

      const res = await fetch(`${BACKEND_URL}/api/subscription/dev-reset`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(3000)
      });

      if (res.ok) {
        const data = await res.json();
        return NextResponse.json(data, { status: res.status });
      }
    } catch (error: any) {
      console.warn("Backend server unreachable for dev-reset, falling back to native execution:", error?.message);
    }
  }

  // 2. Native Next.js serverless reset (100% reliable on Vercel)
  const result = devResetUserBillingNative(userId, email);
  const response = NextResponse.json(result, { status: 200 });
  response.cookies.delete("finwise_last_payment");
  return response;
}
