import { NextRequest, NextResponse } from "next/server";
import { verifyAndProcessCallbackNative } from "@/lib/paymentService";

const BACKEND_URL = process.env.BACKEND_URL;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const txnid = data.txnid || "";
    const rawStatus = (data.status || "failure").toLowerCase();

    let verifiedStatus = rawStatus;
    let paymentRecord: any = null;

    // 1. If custom BACKEND_URL is configured, try backend verification
    if (BACKEND_URL && BACKEND_URL !== "http://localhost:8000") {
      try {
        const verifyRes = await fetch(`${BACKEND_URL}/api/payment/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
          signal: AbortSignal.timeout(3000)
        });

        if (verifyRes.ok) {
          const verifyJson = await verifyRes.json();
          verifiedStatus = verifyJson.status || rawStatus;
          paymentRecord = verifyJson.payment || null;
        }
      } catch (verErr) {
        console.warn("Backend verification unavailable, using native verification:", verErr);
      }
    }

    // 2. Native verification in Next.js (works 100% on Vercel)
    if (!paymentRecord) {
      try {
        const nativeResult = verifyAndProcessCallbackNative(data);
        verifiedStatus = nativeResult.status;
        paymentRecord = nativeResult.payment;
      } catch (nativeErr: any) {
        console.error("Native verification error:", nativeErr);
        verifiedStatus = rawStatus === "success" ? "success" : "failure";
      }
    }

    // Redirect user to status page with verified details
    const planId = paymentRecord?.plan_id || data.udf2 || "PREMIUM_MONTHLY";
    const redirectUrl = new URL(
      `/payment/status?txnid=${encodeURIComponent(txnid)}&status=${encodeURIComponent(verifiedStatus)}&plan_id=${encodeURIComponent(planId)}`,
      req.url
    );

    const response = NextResponse.redirect(redirectUrl, { status: 303 });
    if (paymentRecord) {
      response.cookies.set("finwise_last_payment", JSON.stringify(paymentRecord), {
        path: "/",
        maxAge: 86400,
        sameSite: "lax"
      });
    }

    return response;
  } catch (error) {
    console.error("Payment callback handler error:", error);
    const fallbackUrl = new URL("/payment/status?status=failure", req.url);
    return NextResponse.redirect(fallbackUrl, { status: 303 });
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const txnid = searchParams.get("txnid") || "";
  const status = searchParams.get("status") || "pending";
  const redirectUrl = new URL(
    `/payment/status?txnid=${encodeURIComponent(txnid)}&status=${encodeURIComponent(status)}`,
    req.url
  );
  return NextResponse.redirect(redirectUrl, { status: 303 });
}
