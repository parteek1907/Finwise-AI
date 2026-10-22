import { NextRequest, NextResponse } from "next/server";
import { getPaymentNative } from "@/lib/paymentService";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ txnid: string }> }
) {
  try {
    const { txnid } = await params;
    if (!txnid) {
      return NextResponse.json({ error: "Missing txnid" }, { status: 400 });
    }

    // 1. Check in-memory store
    const nativePayment = getPaymentNative(txnid);
    if (nativePayment) {
      return NextResponse.json({ payment: nativePayment }, { status: 200 });
    }

    // 2. Check cookie fallback
    const cookieVal = req.cookies.get("finwise_last_payment")?.value;
    if (cookieVal) {
      try {
        const parsed = JSON.parse(cookieVal);
        if (parsed.txnid === txnid) {
          return NextResponse.json({ payment: parsed }, { status: 200 });
        }
      } catch (e) {
        // ignore parse error
      }
    }

    // 3. Try backend if configured
    if (BACKEND_URL && BACKEND_URL !== "http://localhost:8000") {
      try {
        const res = await fetch(`${BACKEND_URL}/api/payment/status/${encodeURIComponent(txnid)}`, {
          cache: "no-store",
          signal: AbortSignal.timeout(3000)
        });
        if (res.ok) {
          const data = await res.json();
          return NextResponse.json(data, { status: res.status });
        }
      } catch (backendErr) {
        console.warn("Backend status unavailable:", backendErr);
      }
    }

    return NextResponse.json({ error: "Payment not found" }, { status: 404 });
  } catch (error: any) {
    console.error("Error fetching payment status:", error);
    return NextResponse.json({ error: "Failed to fetch payment status" }, { status: 500 });
  }
}
