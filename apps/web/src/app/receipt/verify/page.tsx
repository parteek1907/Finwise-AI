"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  Search, 
  ArrowLeft, 
  Calendar, 
  CreditCard, 
  FileText,
  Lock,
  Loader2,
  ExternalLink
} from "lucide-react";

interface VerificationResult {
  valid: boolean;
  receipt_number?: string;
  txnid?: string;
  issue_date?: string;
  plan_name?: string;
  amount?: number;
  currency?: string;
  status?: string;
  payment_method?: string;
  customer_name_masked?: string;
  customer_email_masked?: string;
  verification_issuer?: string;
  verified_at?: string;
  error?: string;
}

function ReceiptVerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const queryId = searchParams.get("id") || "";

  const [inputVal, setInputVal] = useState(queryId);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const performVerification = async (idToVerify: string) => {
    if (!idToVerify.trim()) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`/api/receipt/verify?id=${encodeURIComponent(idToVerify.trim())}`);
      const data = await res.json();
      console.log("Receipt verification response:", res.status, data);
      if (res.ok && data.verification) {
        setResult(data.verification);
      } else {
        setResult({
          valid: false,
          error: data.error || data.detail || "No verified payment record found for this receipt identifier."
        });
      }
    } catch (err) {
      setResult({
        valid: false,
        error: "Unable to connect to verification service. Please try again."
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("Verify page useEffect triggered! queryId is:", queryId);
    if (queryId) {
      setInputVal(queryId);
      performVerification(queryId);
    }
  }, [queryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      router.push(`/receipt/verify?id=${encodeURIComponent(inputVal.trim())}`);
      performVerification(inputVal.trim());
    }
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#F9FAFB", padding: "40px 16px" }}>
      <div style={{ maxWidth: "640px", margin: "0 auto" }}>
        
        {/* Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Link 
            href="/settings" 
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              gap: "6px", 
              fontSize: "13px", 
              color: "#4B5563", 
              textDecoration: "none", 
              marginBottom: "20px",
              fontWeight: 500
            }}
          >
            <ArrowLeft size={15} /> Back to FinWise Settings
          </Link>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", marginBottom: "8px" }}>
            <img 
              src="/logo.png" 
              alt="FinWise Logo" 
              style={{ height: "32px", width: "auto", display: "block" }} 
            />
            <h1 style={{ fontSize: "22px", fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.02em" }}>
              FinWise Verification Portal
            </h1>
          </div>
          <p style={{ fontSize: "14px", color: "#6B7280", margin: "4px 0 0 0" }}>
            Official electronic receipt & payment verification system
          </p>
        </div>

        {/* Search Input Box */}
        <div style={{
          backgroundColor: "#FFFFFF",
          borderRadius: "16px",
          border: "1px solid #E5E7EB",
          padding: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
          marginBottom: "24px"
        }}>
          <form onSubmit={handleSubmit} style={{ display: "flex", gap: "10px" }}>
            <div style={{ position: "relative", flex: 1 }}>
              <Search size={16} color="#9CA3AF" style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)" }} />
              <input
                type="text"
                placeholder="Enter Receipt # or Txn ID (e.g. FW-REC-...)"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                style={{
                  width: "100%",
                  padding: "11px 14px 11px 40px",
                  borderRadius: "10px",
                  border: "1px solid #D1D5DB",
                  fontSize: "14px",
                  outline: "none",
                  boxSizing: "border-box",
                  fontFamily: "monospace"
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading || !inputVal.trim()}
              style={{
                backgroundColor: "#19533B",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "10px",
                padding: "0 20px",
                fontSize: "13.5px",
                fontWeight: 600,
                cursor: loading || !inputVal.trim() ? "not-allowed" : "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                opacity: loading || !inputVal.trim() ? 0.6 : 1
              }}
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : "Verify"}
            </button>
          </form>
        </div>

        {/* Verification Result Area */}
        {loading && (
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            padding: "48px 24px",
            textAlign: "center",
            color: "#6B7280"
          }}>
            <Loader2 size={28} className="animate-spin" color="#19533B" style={{ margin: "0 auto 12px auto" }} />
            <p style={{ margin: 0, fontSize: "14px" }}>Verifying receipt record against payment ledger...</p>
          </div>
        )}

        {!loading && result && result.valid && (
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #E5E7EB",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0,0,0,0.05)"
          }}>
            {/* Success Top Banner */}
            <div style={{
              backgroundColor: "#ECFDF5",
              borderBottom: "1px solid #A7F3D0",
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              gap: "12px"
            }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                backgroundColor: "#DEF7EC",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#059669",
                flexShrink: 0
              }}>
                <ShieldCheck size={22} />
              </div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h3 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#065F46" }}>
                    Authentic Verified Payment Receipt
                  </h3>
                  <span style={{
                    backgroundColor: "#059669",
                    color: "#FFFFFF",
                    fontSize: "11px",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "9999px"
                  }}>
                    PAID
                  </span>
                </div>
                <p style={{ margin: "3px 0 0 0", fontSize: "12.5px", color: "#047857" }}>
                  Recorded in FinWise ledger and confirmed by payment provider.
                </p>
              </div>
            </div>

            {/* Receipt Summary Grid */}
            <div style={{ padding: "24px" }}>
              <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "16px",
                marginBottom: "20px"
              }}>
                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>
                    Receipt Number
                  </span>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginTop: "2px", fontFamily: "monospace" }}>
                    {result.receipt_number}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>
                    Issue Date & Time
                  </span>
                  <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#111827", marginTop: "2px" }}>
                    {result.issue_date ? new Date(result.issue_date).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>
                    Product / Plan
                  </span>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#111827", marginTop: "2px" }}>
                    {result.plan_name}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>
                    Total Amount Paid
                  </span>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#19533B", marginTop: "2px" }}>
                    ₹{Number(result.amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>
                    Billed Customer
                  </span>
                  <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#374151", marginTop: "2px" }}>
                    {result.customer_name_masked}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6B7280" }}>
                    {result.customer_email_masked}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "11px", fontWeight: 700, color: "#6B7280", textTransform: "uppercase" }}>
                    Merchant Txn ID
                  </span>
                  <div style={{ fontSize: "12px", color: "#4B5563", marginTop: "2px", fontFamily: "monospace", wordBreak: "break-all" }}>
                    {result.txnid}
                  </div>
                </div>
              </div>

              {/* Privacy protection notice */}
              <div style={{
                backgroundColor: "#F9FAFB",
                border: "1px solid #E5E7EB",
                borderRadius: "10px",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "12px",
                color: "#6B7280"
              }}>
                <Lock size={15} color="#9CA3AF" style={{ flexShrink: 0 }} />
                <span>
                  For customer security and privacy, full personal and card payment details are masked on public verification records.
                </span>
              </div>
            </div>
          </div>
        )}

        {!loading && result && !result.valid && (
          <div style={{
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            border: "1px solid #FEE2E2",
            padding: "36px 24px",
            textAlign: "center"
          }}>
            <div style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              backgroundColor: "#FEF2F2",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#DC2626",
              margin: "0 auto 16px auto"
            }}>
              <AlertCircle size={26} />
            </div>
            <h3 style={{ margin: "0 0 6px 0", fontSize: "16px", fontWeight: 700, color: "#991B1B" }}>
              Receipt Not Found or Unverified
            </h3>
            <p style={{ margin: 0, fontSize: "13.5px", color: "#6B7280", maxWidth: "420px", marginLeft: "auto", marginRight: "auto" }}>
              {result.error || "No verified successful transaction record matches this identifier. Receipts are only issued after successful payment confirmation."}
            </p>
          </div>
        )}

      </div>
    </div>
  );
}

export default function ReceiptVerifyPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <Loader2 size={24} className="animate-spin" color="#19533B" />
      </div>
    }>
      <ReceiptVerifyContent />
    </Suspense>
  );
}
