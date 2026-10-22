import { NextRequest, NextResponse } from "next/server";
import { decodeAuthToken, getUserPaymentsNative } from "@/lib/paymentService";

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
        const headers: Record<string, string> = {};
        if (authHeader) headers["Authorization"] = authHeader;

        const res = await fetch(`${BACKEND_URL}/api/payment/history`, {
          headers,
          cache: "no-store",
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data, { status: res.status });
        }
      } catch (backendErr) {
        console.warn("Backend payment history unavailable:", backendErr);
      }
    }

    // 2. Native payments from memory store
    const payments = getUserPaymentsNative(userId, email);

    // Also check last payment cookie
    const cookieVal = req.cookies.get("finwise_last_payment")?.value;
    if (cookieVal) {
      try {
        const parsed = JSON.parse(cookieVal);
        if (!payments.some((p) => p.txnid === parsed.txnid)) {
          payments.unshift(parsed);
        }
      } catch (e) {
        // ignore parse error
      }
    }

    return NextResponse.json({ payments }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching payment history:", error);
    return NextResponse.json({ payments: [] }, { status: 200 });
  }
}
