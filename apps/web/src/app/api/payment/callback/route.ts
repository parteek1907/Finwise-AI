import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8000";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const data: Record<string, string> = {};
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    const txnid = data.txnid || "";
    const rawStatus = data.status || "failure";

    // Call backend to verify hash and record payment
    let verifiedStatus = rawStatus;
    try {
      const verifyRes = await fetch(`${BACKEND_URL}/api/payment/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (verifyRes.ok) {
        const verifyJson = await verifyRes.json();
        verifiedStatus = verifyJson.status || rawStatus;
      } else {
        console.error("Backend verification HTTP error:", verifyRes.status);
        verifiedStatus = "failure";
      }
    } catch (verErr) {
      console.error("Error communicating with backend verification:", verErr);
    }

    // Redirect user to status page
    const redirectUrl = new URL(
      `/payment/status?txnid=${encodeURIComponent(txnid)}&status=${encodeURIComponent(verifiedStatus)}`,
      req.url
    );
    return NextResponse.redirect(redirectUrl, { status: 303 });
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
