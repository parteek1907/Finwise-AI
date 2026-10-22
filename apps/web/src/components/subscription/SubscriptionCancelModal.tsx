"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Shield,
  AlertCircle,
  Loader2,
  ArrowRight,
  Check,
  CheckCircle2,
  Calendar,
  Sparkles,
  HelpCircle,
  Clock,
  ArrowLeft
} from "lucide-react";
import { auth } from "@/lib/firebase";
import styles from "./SubscriptionCancelModal.module.css";

export interface SubscriptionData {
  plan_id: string;
  plan_name: string;
  tier: string;
  amount: number;
  period: string;
  expires_at?: string | null;
  activated_at?: string | null;
  status: string;
  auto_renew?: boolean;
  is_lifetime?: boolean;
  created_at?: string | null;
  latest_payment?: any;
  can_cancel?: boolean;
  can_reactivate?: boolean;
  has_subscription?: boolean;
}

interface SubscriptionCancelModalProps {
  isOpen: boolean;
  onClose: () => void;
  subscription: SubscriptionData;
  onSuccess: () => void;
  onDevReset?: () => void;
}

const CANCELLATION_REASONS = [
  "Too expensive",
  "I don't use FinWise enough",
  "I couldn't find the features I needed",
  "I'm experiencing a technical issue",
  "I only needed FinWise temporarily",
  "I prefer a different solution",
  "Other"
];

export function SubscriptionCancelModal({
  isOpen,
  onClose,
  subscription,
  onSuccess,
  onDevReset
}: SubscriptionCancelModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedReason, setSelectedReason] = useState<string>("");
  const [feedbackText, setFeedbackText] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state on open/close
  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setSelectedReason("");
      setFeedbackText("");
      setError(null);
      setIsLoading(false);

      // Lock body scroll
      const originalBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalBodyOverflow;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formattedExpiry = subscription.expires_at
    ? new Date(subscription.expires_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      })
    : "end of your current billing period";

  const handleConfirmCancellation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error("You must be signed in to manage your subscription.");
      }

      const token = await currentUser.getIdToken();
      const res = await fetch("/api/subscription/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          reason: selectedReason || "User requested cancellation",
          feedback: feedbackText.trim()
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || "Failed to cancel subscription.");
      }

      setStep(5);
    } catch (err: any) {
      console.error("Cancellation error:", err);
      setError(err.message || "An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      <div
        className={styles.overlay}
        onClick={(e) => {
          if (e.target === e.currentTarget && !isLoading) onClose();
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className={styles.modal}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            disabled={isLoading}
            className={styles.closeButton}
            aria-label="Close"
          >
            <X size={18} />
          </button>

          {/* Step Progress Dots */}
          {step < 5 && (
            <div className={styles.stepIndicator}>
              <div
                className={`${styles.stepDot} ${
                  step === 1 ? styles.stepDotActive : styles.stepDotCompleted
                }`}
              />
              <div
                className={`${styles.stepDot} ${
                  step === 2
                    ? styles.stepDotActive
                    : step > 2
                    ? styles.stepDotCompleted
                    : ""
                }`}
              />
              <div
                className={`${styles.stepDot} ${
                  step === 3
                    ? styles.stepDotActive
                    : step > 3
                    ? styles.stepDotCompleted
                    : ""
                }`}
              />
              <div
                className={`${styles.stepDot} ${
                  step === 4 ? styles.stepDotActive : ""
                }`}
              />
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 1: ACKNOWLEDGE THEIR SUBSCRIPTION
             ══════════════════════════════════════════════════════════════ */}
          {step === 1 && (
            <div>
              <div className={styles.stepHeader}>
                <span className={styles.stepTag}>Subscription Management</span>
                <h2 className={styles.title}>
                  Before you go, let&apos;s make sure you have the right plan.
                </h2>
                <p className={styles.subtitle}>
                  Your FinWise subscription gives you access to your selected
                  premium features. If something isn&apos;t working for you, we
                  may be able to help.
                </p>
              </div>

              {/* Current Subscription Card */}
              <div className={styles.summaryCard}>
                <div className={styles.summaryHeader}>
                  <div className={styles.planName}>{subscription.plan_name}</div>
                  <div className={styles.planPrice}>
                    ₹{subscription.amount} <span>/ {subscription.period}</span>
                  </div>
                </div>

                <div className={styles.featuresGrid}>
                  <div className={styles.featureItem}>
                    <Check size={14} color="#19533B" />
                    <span>Unlimited AI Financial Mentor Queries</span>
                  </div>
                  <div className={styles.featureItem}>
                    <Check size={14} color="#19533B" />
                    <span>Live Trading Labs & Candlestick Simulator</span>
                  </div>
                  <div className={styles.featureItem}>
                    <Check size={14} color="#19533B" />
                    <span>Real-time Scam Shield & Fraud Detector</span>
                  </div>
                  <div className={styles.featureItem}>
                    <Check size={14} color="#19533B" />
                    <span>Emotion AI Psychology Bias Tracking</span>
                  </div>
                </div>
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.keepBtn}
                  onClick={onClose}
                >
                  <Sparkles size={16} />
                  <span>Keep My Subscription</span>
                </button>

                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setStep(2)}
                >
                  <span>Review Cancellation Options</span>
                  <ArrowRight size={15} />
                </button>
              </div>

              {onDevReset && (
                <div style={{ marginTop: '16px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onDevReset();
                    }}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: '#9CA3AF',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#DC2626')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                  >
                    [Developer Shortcut] Immediately cancel &amp; clear history to test payments
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 2: ASK WHY THEY'RE LEAVING (OPTIONAL SINGLE SELECT)
             ══════════════════════════════════════════════════════════════ */}
          {step === 2 && (
            <div>
              <div className={styles.stepHeader}>
                <span className={styles.stepTag}>Your Feedback</span>
                <h2 className={styles.title}>
                  Help us understand why you&apos;re considering cancelling
                </h2>
                <p className={styles.subtitle}>
                  Your honest feedback helps us improve FinWise for everyone. This
                  step is optional.
                </p>
              </div>

              <div className={styles.reasonsList}>
                {CANCELLATION_REASONS.map((r) => {
                  const isSelected = selectedReason === r;
                  return (
                    <div
                      key={r}
                      className={`${styles.reasonOption} ${
                        isSelected ? styles.reasonOptionActive : ""
                      }`}
                      onClick={() => setSelectedReason(r)}
                    >
                      <div
                        className={`${styles.radioCircle} ${
                          isSelected ? styles.radioCircleActive : ""
                        }`}
                      >
                        {isSelected && <div className={styles.radioDot} />}
                      </div>
                      <span className={styles.reasonLabel}>{r}</span>
                    </div>
                  );
                })}
              </div>

              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Anything else you'd like to share? (Optional)"
                className={styles.feedbackInput}
              />

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft size={15} />
                  <span>Back</span>
                </button>

                <button
                  type="button"
                  className={styles.keepBtn}
                  onClick={() => {
                    // If they selected a specific reason with retention, go to Step 3. Otherwise go straight to Step 4.
                    if (selectedReason) {
                      setStep(3);
                    } else {
                      setStep(4);
                    }
                  }}
                >
                  <span>Continue</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 3: TRUTHFUL, RELEVANT RETENTION OFFERS
             ══════════════════════════════════════════════════════════════ */}
          {step === 3 && (
            <div>
              <div className={styles.stepHeader}>
                <span className={styles.stepTag}>Personalized Options</span>
                <h2 className={styles.title}>
                  {selectedReason === "Too expensive"
                    ? "Explore more affordable options"
                    : selectedReason === "I don't use FinWise enough"
                    ? "Make the most of your membership"
                    : selectedReason === "I'm experiencing a technical issue"
                    ? "We're here to help you resolve this"
                    : selectedReason === "I only needed FinWise temporarily"
                    ? "Your access continues uninterrupted"
                    : "Before you make your final decision"}
                </h2>
                <p className={styles.subtitle}>
                  We want you to have the right arrangement for your goals.
                </p>
              </div>

              <div className={styles.retentionCards}>
                {selectedReason === "Too expensive" && (
                  <>
                    <div className={`${styles.retentionCard} ${styles.retentionCardHighlight}`}>
                      <div className={styles.retentionTitle}>
                        <Sparkles size={16} color="#059669" />
                        <span>Switch to Student Pass (₹149 / month)</span>
                      </div>
                      <p className={styles.retentionDesc}>
                        Save 50% on your membership while keeping full access to
                        interactive trading labs, financial quizzes, and quests.
                      </p>
                    </div>

                    <div className={styles.retentionCard}>
                      <div className={styles.retentionTitle}>
                        <Shield size={16} color="#4B5563" />
                        <span>Free Foundation Plan</span>
                      </div>
                      <p className={styles.retentionDesc}>
                        When cancelled, your account automatically returns to our
                        Free Foundation plan with 5 free AI mentor questions/day, 5
                        scam scans/day, and progress tracking.
                      </p>
                    </div>
                  </>
                )}

                {selectedReason === "I don't use FinWise enough" && (
                  <>
                    <div className={`${styles.retentionCard} ${styles.retentionCardHighlight}`}>
                      <div className={styles.retentionTitle}>
                        <Sparkles size={16} color="#059669" />
                        <span>Interactive Live Trading Labs</span>
                      </div>
                      <p className={styles.retentionDesc}>
                        Did you know you can practice candlestick pattern
                        recognition and virtual order execution in real time
                        without risking real money?
                      </p>
                    </div>

                    <div className={styles.retentionCard}>
                      <div className={styles.retentionTitle}>
                        <Clock size={16} color="#4B5563" />
                        <span>Daily Financial Coach</span>
                      </div>
                      <p className={styles.retentionDesc}>
                        Ask your AI mentor 2-minute questions about inflation, taxes,
                        or investment options anytime throughout your day.
                      </p>
                    </div>
                  </>
                )}

                {selectedReason === "I'm experiencing a technical issue" && (
                  <div className={`${styles.retentionCard} ${styles.retentionCardHighlight}`}>
                    <div className={styles.retentionTitle}>
                      <HelpCircle size={16} color="#059669" />
                      <span>Dedicated Support Team</span>
                    </div>
                    <p className={styles.retentionDesc}>
                      We apologize for any inconvenience. Contact our engineering
                      and support team directly at <strong>support@finwise.ai</strong>.
                      We typically respond within a few hours to resolve any bug or
                      account issue.
                    </p>
                  </div>
                )}

                {selectedReason === "I only needed FinWise temporarily" && (
                  <div className={`${styles.retentionCard} ${styles.retentionCardHighlight}`}>
                    <div className={styles.retentionTitle}>
                      <Calendar size={16} color="#059669" />
                      <span>Access through {formattedExpiry}</span>
                    </div>
                    <p className={styles.retentionDesc}>
                      You have already paid for your current billing period. Cancelling
                      will simply turn off future renewal charges while preserving
                      your full access through {formattedExpiry}.
                    </p>
                  </div>
                )}

                {(selectedReason === "I couldn't find the features I needed" ||
                  selectedReason === "I prefer a different solution" ||
                  selectedReason === "Other") && (
                  <div className={styles.retentionCard}>
                    <div className={styles.retentionTitle}>
                      <Shield size={16} color="#4B5563" />
                      <span>Clear, Fair Cancellation</span>
                    </div>
                    <p className={styles.retentionDesc}>
                      If you still wish to cancel renewal, your paid access will
                      remain active until {formattedExpiry}. You will never be
                      charged unexpected fees.
                    </p>
                  </div>
                )}
              </div>

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.keepBtn}
                  onClick={onClose}
                >
                  <Sparkles size={16} />
                  <span>Keep My Subscription</span>
                </button>

                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setStep(4)}
                >
                  <span>Continue to Cancellation</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 4: FINAL CONFIRMATION SCREEN
             ══════════════════════════════════════════════════════════════ */}
          {step === 4 && (
            <div>
              <div className={styles.stepHeader}>
                <span
                  className={styles.stepTag}
                  style={{
                    color: "#991B1B",
                    backgroundColor: "#FEF2F2",
                    borderColor: "#FECACA"
                  }}
                >
                  Final Confirmation
                </span>
                <h2 className={styles.title}>Confirm Subscription Cancellation</h2>
                <p className={styles.subtitle}>
                  Please review what happens when you cancel your subscription
                  renewal:
                </p>
              </div>

              <div className={styles.confirmInfoList}>
                <div className={styles.confirmInfoItem}>
                  <div className={styles.confirmInfoIconWrap}>
                    <Calendar size={16} color="#19533B" />
                  </div>
                  <div>
                    <h4 className={styles.confirmInfoTitle}>
                      Access Active Until {formattedExpiry}
                    </h4>
                    <p className={styles.confirmInfoDesc}>
                      You have already paid for your current billing period. You
                      will continue to enjoy all your premium features until{" "}
                      <strong>{formattedExpiry}</strong>.
                    </p>
                  </div>
                </div>

                <div className={styles.confirmInfoItem}>
                  <div className={styles.confirmInfoIconWrap}>
                    <Shield size={16} color="#059669" />
                  </div>
                  <div>
                    <h4 className={styles.confirmInfoTitle}>
                      Future Charges Stopped
                    </h4>
                    <p className={styles.confirmInfoDesc}>
                      No renewal charges will be initiated for this subscription.
                      You will not be billed again.
                    </p>
                  </div>
                </div>

                <div className={styles.confirmInfoItem}>
                  <div className={styles.confirmInfoIconWrap}>
                    <CheckCircle2 size={16} color="#4B5563" />
                  </div>
                  <div>
                    <h4 className={styles.confirmInfoTitle}>
                      Your Learning Progress Is Saved
                    </h4>
                    <p className={styles.confirmInfoDesc}>
                      All completed courses, exam attempts, certifications, virtual
                      portfolios, and goals remain safely saved to your account.
                    </p>
                  </div>
                </div>
              </div>

              {/* Error banner if request fails */}
              {error && (
                <div className={styles.errorBanner}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <div className={styles.modalActions}>
                <button
                  type="button"
                  className={styles.keepBtn}
                  disabled={isLoading}
                  onClick={onClose}
                >
                  <Sparkles size={16} />
                  <span>Keep My Subscription</span>
                </button>

                <button
                  type="button"
                  className={styles.cancelConfirmBtn}
                  disabled={isLoading}
                  onClick={handleConfirmCancellation}
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Cancelling renewal...</span>
                    </>
                  ) : (
                    <span>Confirm Cancellation</span>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════════════
              STEP 5: CANCELLATION COMPLETED SCREEN
             ══════════════════════════════════════════════════════════════ */}
          {step === 5 && (
            <div className={styles.successWrapper}>
              <div className={styles.successIconRing}>
                <CheckCircle2 size={36} />
              </div>

              <h2 className={styles.title}>Subscription Cancellation Confirmed</h2>
              <p
                className={styles.subtitle}
                style={{ maxWidth: 440, marginBottom: 24 }}
              >
                Your subscription will not renew. You retain full premium access
                until <strong>{formattedExpiry}</strong>. No future charges will be
                made.
              </p>

              <div
                className={styles.summaryCard}
                style={{ width: "100%", textAlign: "left", marginBottom: 24 }}
              >
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 13, color: "#6B7280" }}>
                    Cancelled Plan
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>
                    {subscription.plan_name}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    paddingTop: 10,
                    borderTop: "1px solid #E5E7EB"
                  }}
                >
                  <span style={{ fontSize: 13, color: "#6B7280" }}>
                    Access Paid Through
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#059669" }}>
                    {formattedExpiry}
                  </span>
                </div>
              </div>

              <button
                type="button"
                className={styles.keepBtn}
                onClick={() => {
                  onSuccess();
                  onClose();
                }}
              >
                <span>Return to Billing & Plans</span>
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
