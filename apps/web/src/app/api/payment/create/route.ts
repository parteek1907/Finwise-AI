import { NextRequest, NextResponse } from "next/server";
import { createPaymentOrderNative, decodeAuthToken, getFrontendUrl } from "@/lib/paymentService";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const authHeader = req.headers.get("authorization");
    const decoded = decodeAuthToken(authHeader);
    const userId = decoded?.uid || body.user_id || "demo_user";

    // 1. If custom BACKEND_URL is configured and reachable, try forwarding
    if (BACKEND_URL && BACKEND_URL !== "http://localhost:8000") {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (authHeader) headers["Authorization"] = authHeader;

        const res = await fetch(`${BACKEND_URL}/api/payment/create`, {
          method: "POST",
          headers,
          body: JSON.stringify(body),
          signal: AbortSignal.timeout(3000)
        });

        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data, { status: res.status });
        }
      } catch (e: any) {
        console.warn("Backend unavailable, executing payment order natively in Next.js:", e?.message);
      }
    }

    // 2. Execute natively in Next.js serverless runtime (works 100% on Vercel)
    const frontendUrl = getFrontendUrl(req);
    const orderData = createPaymentOrderNative(
      {
        ...body,
        user_id: userId
      },
      frontendUrl
    );

    return NextResponse.json(orderData, { status: 200 });
  } catch (error: any) {
    console.error("Error creating payment order:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to initiate payment." },
      { status: 400 }
    );
  }
}
