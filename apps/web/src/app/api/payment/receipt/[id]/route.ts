import { NextRequest, NextResponse } from "next/server";
import { decodeAuthToken, getPaymentReceiptNative } from "@/lib/paymentService";

const BACKEND_URL = process.env.BACKEND_URL;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authHeader = req.headers.get("authorization");
    const decoded = decodeAuthToken(authHeader);
    const userId = decoded?.uid;

    // 1. Try backend if configured
    if (BACKEND_URL && BACKEND_URL !== "http://localhost:8000") {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (authHeader) headers["Authorization"] = authHeader;

        const res = await fetch(`${BACKEND_URL}/api/payment/receipt/${encodeURIComponent(id)}`, {
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
        console.warn("Backend receipt unavailable:", backendErr);
      }
    }

    // 2. Native receipt retrieval
    const receipt = getPaymentReceiptNative(id, userId);
    if (!receipt) {
      return NextResponse.json(
        { detail: "Payment record not found or not yet confirmed." },
        { status: 404 }
      );
    }

    return NextResponse.json({ receipt }, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching payment receipt:", error);
    return NextResponse.json(
      { detail: error.message || "Failed to retrieve verified payment receipt." },
      { status: 500 }
    );
  }
}
