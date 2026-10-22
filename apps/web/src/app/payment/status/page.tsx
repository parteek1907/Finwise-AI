"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AppLayout } from "@/components/layout/AppLayout";
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ArrowRight, 
  RotateCcw, 
  ShieldCheck, 
  Download, 
  Sparkles,
  Receipt,
  FileCheck2,
  Check,
  ExternalLink
} from "lucide-react";
import confetti from "canvas-confetti";
import { useAppStore } from "@/store/useAppStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { downloadReceiptPdf } from "@/utils/generateReceiptPdf";
import { auth } from "@/lib/firebase";
import Link from "next/link";

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const txnid = searchParams.get("txnid") || "";
  const rawStatus = (searchParams.get("status") || "pending").toLowerCase();

  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [pdfDownloaded, setPdfDownloaded] = useState(false);
  const [status, setStatus] = useState<"success" | "failure" | "pending">(
    rawStatus === "success" ? "success" : rawStatus === "failure" ? "failure" : "pending"
  );

  const user = useAppStore((state) => state.user);
  const profile = useSettingsStore((state) => state.profile);
  const setUserTier = useAppStore((state) => state.setUserTier);
  const syncEntitlements = useAppStore((state) => state.syncEntitlements);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    let isMountedLocal = true;

    async function fetchStatus() {
      if (!txnid) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`/api/payment/status/${encodeURIComponent(txnid)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMountedLocal && data.payment) {
            setPaymentDetails(data.payment);
            const verified = data.payment.status.toLowerCase();
            if (verified === "success") {
              setStatus("success");
              const tier = data.payment.plan_id.includes("PREMIUM")
                ? "PREMIUM"
                : data.payment.plan_id.includes("STUDENT")
                ? "STUDENT"
                : "FOUNDATION";
              setUserTier(tier, data.payment.plan_id);
              syncEntitlements();

              // Trigger celebration confetti
              confetti({
                particleCount: 90,
                spread: 75,
                origin: { y: 0.55 },
                colors: ["#19533B", "#10B981", "#C4B896", "#047857", "#F59E0B"],
              });
            } else if (verified === "failure" || verified === "cancelled") {
              setStatus("failure");
            }
          }
        }
      } catch (err) {
        console.error("Failed to query payment status:", err);
      } finally {
        if (isMountedLocal) setLoading(false);
      }
    }

    fetchStatus();

    return () => {
      isMountedLocal = false;
    };
  }, [txnid, setUserTier, syncEntitlements]);

  const customerName = paymentDetails?.user_name || auth.currentUser?.displayName || profile.name || user.name || "FinWise Customer";
  const customerEmail = paymentDetails?.user_email || auth.currentUser?.email || profile.email || user.email || "";
  const planName = paymentDetails?.product_name || paymentDetails?.plan_id || "FinWise Pro Plan";
  const amount = paymentDetails?.amount || "0";
  const payuId = paymentDetails?.payu_id || undefined;
  const bankRef = paymentDetails?.bank_ref_num || undefined;

  const formattedDate = isMounted
    ? (paymentDetails?.created_at
        ? new Date(paymentDetails.created_at).toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          })
        : new Date().toLocaleString("en-IN", {
            dateStyle: "medium",
            timeStyle: "short",
          }))
    : (paymentDetails?.created_at || "21 Oct 2026, 6:50 pm");

  const handleDownloadReceipt = async () => {
    if (status !== "success") return;
    await downloadReceiptPdf({
      txnid: paymentDetails?.txnid || txnid || "FW_TXN",
      receiptNumber: paymentDetails?.receipt_number,
      date: formattedDate,
      planName,
      amount: String(amount),
      currency: "INR",
      customerName,
      customerEmail,
      billingAddress: paymentDetails?.billing_address,
      billingCity: paymentDetails?.billing_city,
      billingState: paymentDetails?.billing_state,
      billingPincode: paymentDetails?.billing_pincode,
      billingCountry: paymentDetails?.billing_country,
      paymentMethod: paymentDetails?.payment_method || "Online Payment (PayU Gateway)",
      payuId,
      bankRef: bankRef && bankRef !== (paymentDetails?.txnid || txnid) ? bankRef : undefined,
      status: "success",
      verificationUrl: paymentDetails?.receipt_number 
        ? `https://finwise.ai/receipt/verify?id=${encodeURIComponent(paymentDetails.receipt_number)}`
        : undefined,
    });
    setPdfDownloaded(true);
    setTimeout(() => setPdfDownloaded(false), 3500);
  };

  return (
    <div
      style={{
        maxWidth: "590px",
        margin: "0 auto 16px auto",
        backgroundColor: "#FFFFFF",
        borderRadius: "20px",
        border: "1px solid #E5E7EB",
        boxShadow: "0 20px 45px -12px rgba(0, 0, 0, 0.07), 0 2px 10px rgba(0, 0, 0, 0.02)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      {/* Luxury Brand Top Ribbon */}
      <div
        style={{
          height: "4px",
          width: "100%",
          background: "linear-gradient(90deg, #19533B 0%, #29A367 50%, #C4B896 100%)",
        }}
      />

      <div style={{ padding: "22px 26px 22px 26px" }}>
        {/* Real Brand Logo & Security Pill */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <img 
              src="/logo.png" 
              alt="FinWise Logo" 
              style={{ height: "34px", width: "auto", display: "block" }} 
            />
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#111827", letterSpacing: "-0.02em" }}>
              FinWise
            </span>
          </div>

          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              backgroundColor: "#ECFDF5",
              color: "#065F46",
              border: "1px solid #A7F3D0",
              padding: "4px 11px",
              borderRadius: "20px",
              fontSize: "11.5px",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}
          >
            <ShieldCheck size={13} color="#059669" /> Verified Payment Receipt
          </span>
        </div>

        {/* Status Header */}
        {status === "success" && (
          <div style={{ textAlign: "center", marginBottom: "18px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#ECFDF5",
                border: "2px solid #10B981",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px",
                boxShadow: "0 8px 20px -4px rgba(16, 185, 129, 0.22)",
              }}
            >
              <CheckCircle2 size={30} color="#059669" />
            </div>
            <h2 style={{ fontSize: "21px", fontWeight: 700, color: "#111827", marginBottom: "4px", letterSpacing: "-0.02em" }}>
              Payment Verified & Completed!
            </h2>
            <p style={{ color: "#4B5563", fontSize: "13px", maxWidth: "440px", margin: "0 auto", lineHeight: 1.45 }}>
              Your FinWise subscription has been authenticated and activated. Your account is now upgraded with full feature access.
            </p>
          </div>
        )}

        {status === "failure" && (
          <div style={{ textAlign: "center", marginBottom: "18px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#FEF2F2",
                border: "2px solid #EF4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px",
                boxShadow: "0 8px 20px -4px rgba(239, 68, 68, 0.2)",
              }}
            >
              <XCircle size={30} color="#DC2626" />
            </div>
            <h2 style={{ fontSize: "21px", fontWeight: 700, color: "#111827", marginBottom: "4px", letterSpacing: "-0.02em" }}>
              Payment Unsuccessful
            </h2>
            <p style={{ color: "#4B5563", fontSize: "13px", maxWidth: "440px", margin: "0 auto", lineHeight: 1.45 }}>
              {paymentDetails?.error_message || "The payment transaction could not be completed. No charges were deducted."}
            </p>
          </div>
        )}

        {status === "pending" && (
          <div style={{ textAlign: "center", marginBottom: "18px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                backgroundColor: "#FFFBEB",
                border: "2px solid #F59E0B",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 10px",
                boxShadow: "0 8px 20px -4px rgba(245, 158, 11, 0.2)",
              }}
            >
              <Clock size={30} color="#D97706" />
            </div>
            <h2 style={{ fontSize: "21px", fontWeight: 700, color: "#111827", marginBottom: "4px", letterSpacing: "-0.02em" }}>
              Processing Payment...
            </h2>
            <p style={{ color: "#4B5563", fontSize: "13px", maxWidth: "440px", margin: "0 auto", lineHeight: 1.45 }}>
              Awaiting confirmation from the payment processor. This normally takes just a few seconds.
            </p>
          </div>
        )}

        {/* Official Receipt Summary Card */}
        <div
          style={{
            backgroundColor: "#F9FAFB",
            borderRadius: "14px",
            border: "1px solid #E5E7EB",
            padding: "14px 18px",
            marginBottom: "18px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "11px", fontWeight: 700, color: "#19533B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              <Receipt size={13} />
              <span>Official Receipt Summary</span>
            </div>
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 600,
                padding: "2px 7px",
                borderRadius: "5px",
                backgroundColor: status === "success" ? "#ECFDF5" : status === "failure" ? "#FEF2F2" : "#FFFBEB",
                color: status === "success" ? "#065F46" : status === "failure" ? "#991B1B" : "#92400E",
                border: `1px solid ${status === "success" ? "#A7F3D0" : status === "failure" ? "#FECACA" : "#FDE68A"}`,
              }}
            >
              {status === "success" ? "STATUS: ACTIVE" : status === "failure" ? "STATUS: FAILED" : "STATUS: PROCESSING"}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px" }}>
            {paymentDetails?.receipt_number && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#6B7280" }}>Receipt Number</span>
                <span style={{ fontFamily: "monospace", color: "#19533B", fontSize: "11.5px", fontWeight: 700, backgroundColor: "#ECFDF5", padding: "2px 6px", borderRadius: "4px", border: "1px solid #A7F3D0" }}>
                  {paymentDetails.receipt_number}
                </span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#6B7280" }}>Subscribed Plan</span>
              <strong style={{ color: "#111827", fontWeight: 600 }}>
                {planName}
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#6B7280" }}>Total Paid</span>
              <strong style={{ color: "#19533B", fontSize: "15px", fontWeight: 700 }}>
                ₹{Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#6B7280" }}>Transaction ID</span>
              <span style={{ fontFamily: "monospace", color: "#374151", fontSize: "11.5px", fontWeight: 600, backgroundColor: "#FFFFFF", padding: "2px 6px", borderRadius: "4px", border: "1px solid #E5E7EB" }}>
                {paymentDetails?.txnid || txnid || "Not available"}
              </span>
            </div>

            {paymentDetails?.payu_id && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#6B7280" }}>Gateway Reference</span>
                <span style={{ fontFamily: "monospace", color: "#4B5563", fontSize: "11.5px" }}>
                  {paymentDetails.payu_id}
                </span>
              </div>
            )}

            {paymentDetails?.bank_ref_num && paymentDetails.bank_ref_num !== paymentDetails.txnid && (
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#6B7280" }}>Bank Reference</span>
                <span style={{ fontFamily: "monospace", color: "#4B5563", fontSize: "11.5px" }}>
                  {paymentDetails.bank_ref_num}
                </span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#6B7280" }}>Issue Date & Time</span>
              <span style={{ color: "#374151", fontSize: "11.5px" }} suppressHydrationWarning>
                {formattedDate}
              </span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "6px", borderTop: "1px dashed #E5E7EB" }}>
              <span style={{ color: "#6B7280" }}>Receipt Verification</span>
              {paymentDetails?.receipt_number ? (
                <Link
                  href={`/receipt/verify?id=${encodeURIComponent(paymentDetails.receipt_number)}`}
                  target="_blank"
                  style={{
                    color: "#059669",
                    fontWeight: 600,
                    fontSize: "11.5px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    textDecoration: "none"
                  }}
                >
                  <ShieldCheck size={12} />
                  <span>Verify online</span>
                  <ExternalLink size={10} />
                </Link>
              ) : (
                <span style={{ color: status === "success" ? "#059669" : "#DC2626", fontWeight: 600, fontSize: "11.5px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <ShieldCheck size={12} />
                  {status === "success" ? "Backend Verified" : "Pending Verification"}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons Section */}
        <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
          {status === "success" ? (
            <>
              {/* Button 1: Download Official PDF Receipt */}
              <button
                type="button"
                onClick={handleDownloadReceipt}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "11px 18px",
                  backgroundColor: "#19533B",
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(25, 83, 59, 0.22)",
                  transition: "all 0.2s ease",
                }}
              >
                {pdfDownloaded ? (
                  <>
                    <Check size={16} />
                    <span>Receipt Downloaded (PDF)!</span>
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    <span>Download Official PDF Receipt</span>
                  </>
                )}
              </button>

              {/* Button 2: Explore Unlocked Courses & Labs */}
              <Link
                href="/learn"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "10px 18px",
                  backgroundColor: "#FFFFFF",
                  color: "#19533B",
                  border: "1.5px solid #19533B",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  textDecoration: "none",
                  transition: "all 0.2s ease",
                }}
              >
                <Sparkles size={15} />
                <span>Explore Unlocked Courses & Labs</span>
                <ArrowRight size={15} />
              </Link>

              {/* Navigation Footnote */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px", marginTop: "2px" }}>
                <Link
                  href="/settings"
                  style={{
                    color: "#6B7280",
                    fontSize: "12px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Manage Billing in Settings
                </Link>
                <span style={{ color: "#D1D5DB" }}>•</span>
                <Link
                  href="/dashboard"
                  style={{
                    color: "#6B7280",
                    fontSize: "12px",
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  Return to Dashboard
                </Link>
              </div>
            </>
          ) : (
            <>
              <Link
                href="/#pricing"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  width: "100%",
                  padding: "11px 18px",
                  backgroundColor: "#19533B",
                  color: "#FFFFFF",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "13.5px",
                  textDecoration: "none",
                  boxShadow: "0 4px 14px rgba(25, 83, 59, 0.22)",
                }}
              >
                <RotateCcw size={16} />
                <span>Retry Payment</span>
              </Link>

              <Link
                href="/dashboard"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  padding: "10px 18px",
                  backgroundColor: "#FFFFFF",
                  color: "#374151",
                  border: "1px solid #D1D5DB",
                  borderRadius: "10px",
                  fontWeight: 600,
                  fontSize: "13px",
                  textDecoration: "none",
                }}
              >
                Return to Dashboard
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentStatusPage() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div style={{ textAlign: "center", padding: "60px 20px", color: "#6B7280", fontSize: "14px" }}>
          Confirming payment status...
        </div>
      }>
        <PaymentStatusContent />
      </Suspense>
    </AppLayout>
  );
}
