"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, 
  Sparkles, 
  AlertCircle, 
  Loader2, 
  ArrowRight, 
  Lock, 
  Shield,
  CheckCircle2,
  Check,
  UserCheck
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser, updateProfile as updateFirebaseProfile } from "firebase/auth";
import { INDIAN_STATES_AND_UTS, isValidIndianState } from "@/constants/indianStates";
import { StateSelect } from "./StateSelect";
import styles from "./PayUCheckoutModal.module.css";

export interface CheckoutPlan {
  id: string;
  name: string;
  amount: number;
  period: string;
  currency?: string;
  features: string[];
  description?: string;
  badge?: string;
}

interface PayUCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: CheckoutPlan;
}

export function PayUCheckoutModal({ isOpen, onClose, plan }: PayUCheckoutModalProps) {
  const router = useRouter();
  const user = useAppStore((state) => state.user);
  const profile = useSettingsStore((state) => state.profile);
  const updateProfile = useSettingsStore((state) => state.updateProfile);

  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [activePlan, setActivePlan] = useState<CheckoutPlan>(plan);

  // Form Fields - Strictly dynamic from authenticated user / profile. No hardcoded mock values.
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [stateName, setStateName] = useState("");
  const [pincode, setPincode] = useState("");
  const [syncProfileConsent, setSyncProfileConsent] = useState(false);

  // Validation & UI State
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Keep activePlan in sync when incoming plan prop changes
  useEffect(() => {
    if (plan) {
      setActivePlan(plan);
    }
  }, [plan]);

  // Track Firebase Auth state & populate profile dynamically
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (fbUser) => {
      setCurrentUser(fbUser);
      if (fbUser) {
        setName(fbUser.displayName || profile.name || user.name || "");
        setEmail(fbUser.email || profile.email || user.email || "");
        const rawPhone = fbUser.phoneNumber || profile.phone || "";
        const cleanPhone = rawPhone.replace(/\+91/, "").replace(/\s+/g, "");
        setPhone(cleanPhone);

        // Preload city & state from profile only if valid
        if (profile.location) {
          const parts = profile.location.split(",");
          const locCity = parts[0]?.trim() || "";
          setCity(locCity);
          if (parts.length > 1) {
            const locState = parts[1]?.trim() || "";
            if (isValidIndianState(locState)) {
              setStateName(locState);
            }
          }
        }
      } else {
        // Clear all fields for unauthenticated users. Never prefill demo data.
        setName("");
        setEmail("");
        setPhone("");
        setAddress("");
        setCity("");
        setStateName("");
        setPincode("");
      }
    });

    return () => unsubscribe();
  }, [profile, user]);

  // Lock background scroll (both document.body and Lenis smooth scroll on landing page)
  useEffect(() => {
    if (isOpen) {
      const originalBodyOverflow = document.body.style.overflow;
      const originalHtmlOverflow = document.documentElement.style.overflow;

      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";

      // Pause Lenis smooth scrolling if running on the landing page
      if (typeof window !== "undefined" && (window as any).__lenis) {
        (window as any).__lenis.stop();
      }

      return () => {
        document.body.style.overflow = originalBodyOverflow;
        document.documentElement.style.overflow = originalHtmlOverflow;
        if (typeof window !== "undefined" && (window as any).__lenis) {
          (window as any).__lenis.start();
        }
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Plan options definitions
  const premiumMonthlyPlanOption: CheckoutPlan = {
    id: "PREMIUM_MONTHLY",
    name: "FinWise Premium (Monthly)",
    amount: 299,
    period: "month",
    description: "Flexible monthly subscription & cancel anytime.",
    features: [
      "All AI Mentors, unlocked with no query limits",
      "Real-time Scam Shield & Fraud detection",
      "Live Trading Labs & Candlestick simulator",
      "Emotion AI behavioral bias tracking"
    ]
  };

  const premiumYearlyPlanOption: CheckoutPlan = {
    id: "PREMIUM_YEARLY",
    name: "FinWise Premium (Yearly)",
    amount: 2799,
    period: "year",
    description: "Commit for a year with 22% annual savings.",
    features: [
      "Everything in Premium Monthly",
      "All 10 Courses & Final Exam Master Access",
      "Verified FinWise Completion Certificate",
      "Priority AI mentor speed & deep analysis"
    ]
  };

  const studentMonthlyPlanOption: CheckoutPlan = {
    id: "STUDENT_MONTHLY",
    name: "FinWise Student Pass (Monthly)",
    amount: 149,
    period: "month",
    description: "Flexible academic monthly subscription.",
    features: [
      "Full Financial Academy courses & quizzes",
      "Interactive Trading Simulations",
      "Story simulations & gamified quests",
      "Leaderboards & community challenges"
    ]
  };

  const studentYearlyPlanOption: CheckoutPlan = {
    id: "STUDENT_YEARLY",
    name: "FinWise Student Pass (Yearly)",
    amount: 1399,
    period: "year",
    description: "Commit for a year with 22% academic savings.",
    features: [
      "Everything in Student Monthly",
      "All Academic Certifications & Exams",
      "Interactive Trading Simulations",
      "Save 22% compared to monthly renewal"
    ]
  };

  const labsPlanOption: CheckoutPlan = {
    id: "TRADING_LABS_PASS",
    name: "Trading Labs Pass (Lifetime)",
    amount: 199,
    period: "one-time",
    description: "One-time standalone lab pass for practical trading.",
    features: [
      "Stock Market Basics Simulator",
      "Interactive Candlestick pattern recognition",
      "Virtual portfolio order execution",
      "Real-time simulated price feeds"
    ]
  };

  // Determine which category of plan the user is exploring
  const isPremiumFlow = activePlan.id.startsWith("PREMIUM");
  const isStudentFlow = activePlan.id.startsWith("STUDENT");
  const isLabsFlow = activePlan.id === "TRADING_LABS_PASS";

  // Check if user already holds this plan or a higher tier
  const userTier = user?.tier || "FOUNDATION";
  const userPlan = user?.subscriptionPlan || "";

  const isAlreadyOnPlan = (() => {
    if (!currentUser) return false;
    if (!userTier || userTier === "FOUNDATION") return false;

    if (userTier === "PREMIUM") {
      if (userPlan === "PREMIUM_YEARLY") return true;
      if (
        activePlan.id === "PREMIUM_MONTHLY" ||
        activePlan.id === "STUDENT_MONTHLY" ||
        activePlan.id === "STUDENT_YEARLY" ||
        activePlan.id === "TRADING_LABS_PASS"
      ) {
        return true;
      }
      return false;
    }

    if (userTier === "STUDENT") {
      if (activePlan.id === "STUDENT_MONTHLY" && (userPlan === "STUDENT_MONTHLY" || !userPlan)) return true;
      if (activePlan.id === "STUDENT_YEARLY" && userPlan === "STUDENT_YEARLY") return true;
      if (activePlan.id === "TRADING_LABS_PASS") return true;
      return false;
    }

    return false;
  })();

  // ══════════════════════════════════════════════════════════════
  // STRICT FIELD VALIDATION RULES
  // ══════════════════════════════════════════════════════════════
  const validateSingleField = (field: string, value: string): string | null => {
    const trimmed = (value || "").trim();
    switch (field) {
      case "name":
        if (!trimmed || trimmed.length < 2) return "Full name must be at least 2 characters.";
        if (trimmed.length > 70) return "Full name cannot exceed 70 characters.";
        if (!/^[a-zA-Z\s.'-]+$/.test(trimmed)) return "Full name contains invalid characters.";
        return null;

      case "email":
        if (!trimmed || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
          return "Please enter a valid email address.";
        }
        return null;

      case "phone": {
        const cleanPhone = trimmed.replace(/[\s-]/g, "").replace(/^\+91/, "");
        if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
          return "Please enter a valid 10-digit Indian mobile number (e.g. 9876543210).";
        }
        return null;
      }

      case "address":
        if (!trimmed || trimmed.length < 5) {
          return "Street address must be at least 5 characters.";
        }
        if (trimmed.length > 120) {
          return "Street address cannot exceed 120 characters.";
        }
        if (!/^[a-zA-Z0-9\s,./#'\-&()]+$/.test(trimmed)) {
          return "Street address contains invalid characters.";
        }
        return null;

      case "city":
        if (!trimmed || trimmed.length < 2) {
          return "City must be at least 2 characters.";
        }
        if (trimmed.length > 60) {
          return "City cannot exceed 60 characters.";
        }
        if (!/^[a-zA-Z\s.-]+$/.test(trimmed)) {
          return "City contains invalid characters.";
        }
        return null;

      case "stateName":
        if (!trimmed || !isValidIndianState(trimmed)) {
          return "Please select an approved Indian State or Union Territory.";
        }
        return null;

      case "pincode":
        if (!trimmed || !/^[1-9][0-9]{5}$/.test(trimmed)) {
          return "PIN code must be exactly 6 digits (cannot start with 0).";
        }
        return null;

      default:
        return null;
    }
  };

  const validateAllFields = (): Record<string, string> => {
    const errors: Record<string, string> = {};
    const nameErr = validateSingleField("name", name);
    if (nameErr) errors.name = nameErr;

    const phoneErr = validateSingleField("phone", phone);
    if (phoneErr) errors.phone = phoneErr;

    const emailErr = validateSingleField("email", email);
    if (emailErr) errors.email = emailErr;

    const addrErr = validateSingleField("address", address);
    if (addrErr) errors.address = addrErr;

    const cityErr = validateSingleField("city", city);
    if (cityErr) errors.city = cityErr;

    const stateErr = validateSingleField("stateName", stateName);
    if (stateErr) errors.stateName = stateErr;

    const pinErr = validateSingleField("pincode", pincode);
    if (pinErr) errors.pincode = pinErr;

    return errors;
  };

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check authentication first
    if (!currentUser) {
      setError("Please sign in or create an account before subscribing.");
      return;
    }

    // Run complete validation
    const errors = validateAllFields();
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Focus first invalid field
      const fieldOrder = ["name", "phone", "email", "address", "city", "stateName", "pincode"];
      const firstInvalidKey = fieldOrder.find((k) => errors[k]);
      if (firstInvalidKey) {
        const inputElem = document.getElementById(`checkout-${firstInvalidKey}`);
        if (inputElem) {
          inputElem.focus();
        }
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const idToken = await currentUser.getIdToken();

      // Only update profile if the user explicitly provided consent
      if (syncProfileConsent) {
        if (updateProfile) {
          updateProfile({ name: name.trim(), phone: phone.trim() });
        }
        if (currentUser.displayName !== name.trim()) {
          updateFirebaseProfile(currentUser, { displayName: name.trim() }).catch((err) =>
            console.error("Firebase profile update error:", err)
          );
        }
      }

      const payload = {
        plan_id: activePlan.id,
        user_name: name.trim(),
        user_email: email.trim(),
        user_phone: phone.trim().replace(/[\s-]/g, "").replace(/^\+91/, ""),
        billing_address: address.trim(),
        billing_city: city.trim(),
        billing_state: stateName.trim(),
        billing_pincode: pincode.trim(),
        billing_country: "India",
        return_url: window.location.origin + "/settings",
      };

      // Create order on backend with secure Bearer auth token
      const res = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${idToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to initiate payment. Please try again.");
      }

      const orderData = await res.json();

      // Submit hidden POST form to official PayU checkout gateway
      const form = document.createElement("form");
      form.method = "POST";
      form.action = orderData.action_url;
      form.style.display = "none";

      const formParams: Record<string, string> = {
        key: orderData.key,
        txnid: orderData.txnid,
        amount: orderData.amount,
        productinfo: orderData.productinfo,
        firstname: orderData.firstname,
        email: orderData.email,
        phone: orderData.phone,
        surl: orderData.surl,
        furl: orderData.furl,
        hash: orderData.hash,
        udf1: orderData.udf1 || "",
        udf2: orderData.udf2 || "",
        udf3: orderData.udf3 || "",
        udf4: orderData.udf4 || "",
        udf5: orderData.udf5 || "",
      };

      Object.entries(formParams).forEach(([k, val]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = k;
        input.value = val;
        form.appendChild(input);
      });

      document.body.appendChild(form);
      form.submit();
    } catch (err: any) {
      console.error("Checkout error:", err);
      setError(err.message || "An unexpected error occurred during checkout.");
      setIsLoading(false);
    }
  };

  const handleSimulateDevSuccess = async () => {
    if (!currentUser) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan_id: activePlan.id,
          user_id: currentUser.uid,
          amount: activePlan.amount.toFixed(2),
          productinfo: activePlan.name,
          firstname: (name || currentUser.displayName || "Customer").split(" ")[0],
          email: email || currentUser.email || "test@finwise.ai",
          status: "success"
        })
      });
      const data = await res.json();
      if (res.ok) {
        onClose();
        window.location.href = `/payment/status?txnid=${encodeURIComponent(data.payment?.txnid || `FW_TEST_${Date.now()}`)}&status=success&plan_id=${encodeURIComponent(activePlan.id)}`;
      } else {
        throw new Error(data.detail || "Simulation failed.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to simulate payment.");
      setIsLoading(false);
    }
  };

  // Features display calculation
  const displayFeatures = (activePlan.features && activePlan.features.length > 0 
    ? activePlan.features 
    : [
        "All AI Mentors, unlocked with no query limits",
        "Real-time Scam Shield & Fraud detection",
        "Live Trading Labs & Candlestick simulator",
        "Emotion AI behavioral bias tracking"
      ]
  ).slice(0, 4);

  const totalFeaturesCount = activePlan.features ? activePlan.features.length : 4;
  const extraFeaturesCount = Math.max(0, totalFeaturesCount - 4);

  return (
    <AnimatePresence>
      <div
        className={styles.overlay}
        onWheel={(e) => e.stopPropagation()}
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
            aria-label="Close Checkout"
          >
            <X size={18} />
          </button>

          {/* ══════════════════════════════════════════════════════════════
              CASE 1: USER NOT SIGNED IN -> REQUIRE LOGIN BEFORE CHECKOUT
             ══════════════════════════════════════════════════════════════ */}
          {!currentUser ? (
            <div className={styles.authRequiredWrapper}>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                className={styles.authIconRing}
              >
                <Lock size={32} />
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.3 }}
                className={styles.authRequiredTitle}
              >
                Sign in to continue
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12, duration: 0.3 }}
                className={styles.authRequiredDesc}
              >
                Please sign in or create your FinWise account before subscribing. Your plan and payment will be linked securely to your account.
              </motion.p>

              {/* Selected Plan Snapshot */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.3 }}
                className={styles.authSelectedPlanCard}
              >
                <div className={styles.authPlanLeft}>
                  <span className={styles.authPlanBadge}>Selected Plan</span>
                  <div className={styles.authPlanName}>{activePlan.name}</div>
                </div>
                <div className={styles.authPlanPrice}>
                  ₹{activePlan.amount} <span>/ {activePlan.period}</span>
                </div>
              </motion.div>

              {/* Action Buttons: Sign In & Create Account */}
              <div className={styles.authActionButtons}>
                <button
                  type="button"
                  className={styles.signInBtn}
                  onClick={() => {
                    const currentPath = typeof window !== "undefined" ? window.location.pathname : "/pricing";
                    const returnUrl = `${currentPath}?openPlan=${encodeURIComponent(activePlan.id)}`;
                    router.push(`/signin?redirect=${encodeURIComponent(returnUrl)}`);
                  }}
                >
                  Sign In
                </button>

                <button
                  type="button"
                  className={styles.createAccountBtn}
                  onClick={() => {
                    const currentPath = typeof window !== "undefined" ? window.location.pathname : "/pricing";
                    const returnUrl = `${currentPath}?openPlan=${encodeURIComponent(activePlan.id)}`;
                    router.push(`/auth?redirect=${encodeURIComponent(returnUrl)}`);
                  }}
                >
                  Create Account
                </button>
              </div>
            </div>
          ) : isAlreadyOnPlan ? (
            /* ══════════════════════════════════════════════════════════════
               CASE 2: USER IS ALREADY ON THIS PLAN (LIGHT THEME ANIMATION)
               ══════════════════════════════════════════════════════════════ */
            <div className={styles.alreadyActiveWrapper}>
              <motion.div
                initial={{ scale: 0.7, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={styles.activeGlowRing}
              >
                <Sparkles size={38} color="#059669" />
              </motion.div>

              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className={styles.alreadyActiveTitle}
              >
                {userTier === "PREMIUM"
                  ? "You're Already on FinWise Premium!"
                  : "You're Already on Student Pass!"}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15, duration: 0.3 }}
                className={styles.alreadyActiveDesc}
              >
                Your membership is active and in good standing. You currently have full access to all AI Mentors, Scam Detector, Emotion AI, and Live Trading Labs.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className={styles.currentEntitlementCard}
              >
                <div className={styles.entitlementHeader}>
                  <div className={styles.entitlementPlanName}>
                    {userTier === "PREMIUM" 
                      ? (userPlan === "PREMIUM_YEARLY" ? "FinWise Premium (Annual VIP)" : "FinWise Premium (Monthly)")
                      : "FinWise Student Academic Pass"}
                  </div>
                  <span className={styles.entitlementBadge}>
                    <CheckCircle2 size={13} />
                    Active Plan
                  </span>
                </div>

                <div className={styles.entitlementFeatures}>
                  <div className={styles.entitlementFeatureItem}>
                    <Check size={13} color="#19533B" />
                    <span>Unlimited AI Financial Queries</span>
                  </div>
                  <div className={styles.entitlementFeatureItem}>
                    <Check size={13} color="#19533B" />
                    <span>Full Live Trading Labs Access</span>
                  </div>
                  <div className={styles.entitlementFeatureItem}>
                    <Check size={13} color="#19533B" />
                    <span>Scam & Fraud Shield Active</span>
                  </div>
                  <div className={styles.entitlementFeatureItem}>
                    <Check size={13} color="#19533B" />
                    <span>Certified Financial Progress</span>
                  </div>
                </div>
              </motion.div>

              <div className={styles.alreadyActiveActions}>
                <button
                  type="button"
                  className={styles.exploreBtn}
                  onClick={() => {
                    onClose();
                    router.push("/learn");
                  }}
                >
                  <span>Explore Pro Features</span>
                  <ArrowRight size={16} />
                </button>

                <button
                  type="button"
                  className={styles.billingBtn}
                  onClick={() => {
                    onClose();
                    router.push("/settings");
                  }}
                >
                  View Billing & Plans
                </button>
              </div>

              {userTier === "PREMIUM" && userPlan === "PREMIUM_MONTHLY" && (
                <div className={styles.switchOptionText}>
                  Looking to switch to Annual?
                  <button
                    type="button"
                    className={styles.switchOptionLink}
                    onClick={() => setActivePlan(premiumYearlyPlanOption)}
                  >
                    Switch to Annual Plan (Save 22%)
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* ══════════════════════════════════════════════════════════════
               CASE 3: AUTHENTICATED CHECKOUT FLOW (2-COLUMN LIGHT THEME DESIGN)
               ══════════════════════════════════════════════════════════════ */
            <div className={styles.gridLayout}>
              {/* ═══ LEFT COLUMN: Plan & Features ═══ */}
              <div className={styles.leftCol}>
                <div className={styles.brandRow}>
                  <span className={styles.brandName}>FinWise</span>
                </div>

                <h2 className={styles.title}>
                  {isStudentFlow 
                    ? "Activate Your Student Pass" 
                    : isLabsFlow 
                    ? "Unlock Trading Labs Simulator" 
                    : "Activate Your FinWise Pro"}
                </h2>
                <p className={styles.subtitle}>
                  Get unlimited access to AI financial mentors, scam detector, and real-time trading labs.
                </p>

                {/* Select Plan Section */}
                <div className={styles.sectionHeading}>Choose Plan</div>
                <div className={styles.planList}>
                  {/* Premium Flow */}
                  {isPremiumFlow && (
                    <>
                      {/* Monthly Option */}
                      <div
                        className={`${styles.planCard} ${activePlan.id === "PREMIUM_MONTHLY" ? styles.planCardActive : ""}`}
                        onClick={() => setActivePlan(premiumMonthlyPlanOption)}
                      >
                        <div className={styles.planCardLeft}>
                          <div className={`${styles.radioCircle} ${activePlan.id === "PREMIUM_MONTHLY" ? styles.radioCircleActive : ""}`}>
                            {activePlan.id === "PREMIUM_MONTHLY" && <div className={styles.radioDot} />}
                          </div>
                          <div className={styles.planInfo}>
                            <div className={styles.planTitle}>Monthly Plan</div>
                            <div className={styles.planDesc}>Flexible monthly subscription.</div>
                          </div>
                        </div>
                        <div className={styles.planPrice}>
                          ₹299 <span>/ Month</span>
                        </div>
                      </div>

                      {/* Annual Option */}
                      <div
                        className={`${styles.planCard} ${activePlan.id === "PREMIUM_YEARLY" ? styles.planCardActive : ""}`}
                        onClick={() => setActivePlan(premiumYearlyPlanOption)}
                      >
                        <div className={styles.planCardLeft}>
                          <div className={`${styles.radioCircle} ${activePlan.id === "PREMIUM_YEARLY" ? styles.radioCircleActive : ""}`}>
                            {activePlan.id === "PREMIUM_YEARLY" && <div className={styles.radioDot} />}
                          </div>
                          <div className={styles.planInfo}>
                            <div className={styles.planTitle}>Annual Plan</div>
                            <div className={styles.planDesc}>
                              Commit for a year with <span className={styles.savingsTag}>22% savings</span>.
                            </div>
                          </div>
                        </div>
                        <div className={styles.planPrice}>
                          ₹2,799 <span>/ Year</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Student Flow (Both Monthly & Annual) */}
                  {isStudentFlow && (
                    <>
                      <div
                        className={`${styles.planCard} ${activePlan.id === "STUDENT_MONTHLY" ? styles.planCardActive : ""}`}
                        onClick={() => setActivePlan(studentMonthlyPlanOption)}
                      >
                        <div className={styles.planCardLeft}>
                          <div className={`${styles.radioCircle} ${activePlan.id === "STUDENT_MONTHLY" ? styles.radioCircleActive : ""}`}>
                            {activePlan.id === "STUDENT_MONTHLY" && <div className={styles.radioDot} />}
                          </div>
                          <div className={styles.planInfo}>
                            <div className={styles.planTitle}>Student Monthly</div>
                            <div className={styles.planDesc}>Flexible academic monthly access.</div>
                          </div>
                        </div>
                        <div className={styles.planPrice}>
                          ₹149 <span>/ Month</span>
                        </div>
                      </div>

                      <div
                        className={`${styles.planCard} ${activePlan.id === "STUDENT_YEARLY" ? styles.planCardActive : ""}`}
                        onClick={() => setActivePlan(studentYearlyPlanOption)}
                      >
                        <div className={styles.planCardLeft}>
                          <div className={`${styles.radioCircle} ${activePlan.id === "STUDENT_YEARLY" ? styles.radioCircleActive : ""}`}>
                            {activePlan.id === "STUDENT_YEARLY" && <div className={styles.radioDot} />}
                          </div>
                          <div className={styles.planInfo}>
                            <div className={styles.planTitle}>Student Annual Plan</div>
                            <div className={styles.planDesc}>
                              Commit for a year with <span className={styles.savingsTag}>22% savings</span>.
                            </div>
                          </div>
                        </div>
                        <div className={styles.planPrice}>
                          ₹1,399 <span>/ Year</span>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Labs Standalone Flow */}
                  {isLabsFlow && (
                    <>
                      <div
                        className={`${styles.planCard} ${activePlan.id === "TRADING_LABS_PASS" ? styles.planCardActive : ""}`}
                        onClick={() => setActivePlan(labsPlanOption)}
                      >
                        <div className={styles.planCardLeft}>
                          <div className={`${styles.radioCircle} ${activePlan.id === "TRADING_LABS_PASS" ? styles.radioCircleActive : ""}`}>
                            {activePlan.id === "TRADING_LABS_PASS" && <div className={styles.radioDot} />}
                          </div>
                          <div className={styles.planInfo}>
                            <div className={styles.planTitle}>Trading Labs Pass</div>
                            <div className={styles.planDesc}>One-time standalone lab & simulator unlock.</div>
                          </div>
                        </div>
                        <div className={styles.planPrice}>
                          ₹199 <span>/ Lifetime</span>
                        </div>
                      </div>

                      <div
                        className={`${styles.planCard} ${activePlan.id === "PREMIUM_MONTHLY" ? styles.planCardActive : ""}`}
                        onClick={() => setActivePlan(premiumMonthlyPlanOption)}
                      >
                        <div className={styles.planCardLeft}>
                          <div className={`${styles.radioCircle} ${activePlan.id === "PREMIUM_MONTHLY" ? styles.radioCircleActive : ""}`}>
                            {activePlan.id === "PREMIUM_MONTHLY" && <div className={styles.radioDot} />}
                          </div>
                          <div className={styles.planInfo}>
                            <div className={styles.planTitle}>Full Premium Access</div>
                            <div className={styles.planDesc}>Includes all Trading Labs + Unlimited AI Mentor.</div>
                          </div>
                        </div>
                        <div className={styles.planPrice}>
                          ₹299 <span>/ Month</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* What you'll unlock list */}
                <div className={styles.unlockHeading}>
                  <span>What you&apos;ll unlock</span>
                  <ArrowRight size={14} />
                </div>
                <div className={styles.featureList}>
                  {displayFeatures.map((f, i) => (
                    <div key={i} className={styles.featureItem}>
                      <span className={styles.featureDot} />
                      <span>{f}</span>
                    </div>
                  ))}
                  {extraFeaturesCount > 0 && (
                    <div className={styles.moreBenefitsText}>
                      + {extraFeaturesCount} more benefits included
                    </div>
                  )}
                </div>

                <p className={styles.guaranteeNote}>
                  Everything unlocked, verified, and built for your growth. Cancel or switch plans anytime.
                </p>
              </div>

              {/* ═══ RIGHT COLUMN: Account Details, Billing Address & Total ═══ */}
              <div className={styles.rightCol}>
                <form onSubmit={handlePay} noValidate>
                  {/* Account Profile Details */}
                  <div className={styles.fieldGroup}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                      <label className={styles.fieldLabel} style={{ margin: 0 }}>Account Details</label>
                      <span style={{ fontSize: "11px", color: "#059669", fontWeight: 600 }}>Linked to FinWise Account</span>
                    </div>

                    <div className={styles.splitInputs}>
                      <div>
                        <input
                          id="checkout-name"
                          type="text"
                          required
                          placeholder="Full Name"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value);
                            if (fieldErrors.name) {
                              const err = validateSingleField("name", e.target.value);
                              setFieldErrors((prev) => {
                                const next = { ...prev };
                                if (err) next.name = err; else delete next.name;
                                return next;
                              });
                            }
                          }}
                          onBlur={() => {
                            const err = validateSingleField("name", name);
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              if (err) next.name = err; else delete next.name;
                              return next;
                            });
                          }}
                          className={`${styles.inputField} ${fieldErrors.name ? styles.inputFieldError : ""}`}
                        />
                        {fieldErrors.name && <span className={styles.fieldErrorText}>{fieldErrors.name}</span>}
                      </div>

                      <div>
                        <input
                          id="checkout-phone"
                          type="tel"
                          required
                          placeholder="10-digit Mobile"
                          value={phone}
                          onChange={(e) => {
                            setPhone(e.target.value);
                            if (fieldErrors.phone) {
                              const err = validateSingleField("phone", e.target.value);
                              setFieldErrors((prev) => {
                                const next = { ...prev };
                                if (err) next.phone = err; else delete next.phone;
                                return next;
                              });
                            }
                          }}
                          onBlur={() => {
                            const err = validateSingleField("phone", phone);
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              if (err) next.phone = err; else delete next.phone;
                              return next;
                            });
                          }}
                          className={`${styles.inputField} ${fieldErrors.phone ? styles.inputFieldError : ""}`}
                        />
                        {fieldErrors.phone && <span className={styles.fieldErrorText}>{fieldErrors.phone}</span>}
                      </div>
                    </div>
                  </div>

                  <div className={styles.fieldGroup} style={{ marginBottom: "8px" }}>
                    <label className={styles.fieldLabel} htmlFor="checkout-email">Email Address</label>
                    <input
                      id="checkout-email"
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) {
                          const err = validateSingleField("email", e.target.value);
                          setFieldErrors((prev) => {
                            const next = { ...prev };
                            if (err) next.email = err; else delete next.email;
                            return next;
                          });
                        }
                      }}
                      onBlur={() => {
                        const err = validateSingleField("email", email);
                        setFieldErrors((prev) => {
                          const next = { ...prev };
                          if (err) next.email = err; else delete next.email;
                          return next;
                        });
                      }}
                      className={`${styles.inputField} ${fieldErrors.email ? styles.inputFieldError : ""}`}
                    />
                    {fieldErrors.email && <span className={styles.fieldErrorText}>{fieldErrors.email}</span>}
                  </div>

                  {/* Profile Update Consent Checkbox */}
                  <label className={styles.consentRow}>
                    <input
                      type="checkbox"
                      checked={syncProfileConsent}
                      onChange={(e) => setSyncProfileConsent(e.target.checked)}
                      className={styles.consentCheckbox}
                    />
                    <span>Save updated contact details to my FinWise account profile</span>
                  </label>

                  {/* Indian Billing Address Section */}
                  <div className={styles.fieldGroup} style={{ marginTop: "12px", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "6px" }}>
                      <label className={styles.fieldLabel} style={{ margin: 0 }}>Indian Billing Address</label>
                      <span style={{ fontSize: "11px", color: "#6B7280" }}>Required for invoice & receipt</span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      <div>
                        <input
                          id="checkout-address"
                          type="text"
                          required
                          placeholder="Street Address / Flat / Building No."
                          value={address}
                          onChange={(e) => {
                            setAddress(e.target.value);
                            if (fieldErrors.address) {
                              const err = validateSingleField("address", e.target.value);
                              setFieldErrors((prev) => {
                                const next = { ...prev };
                                if (err) next.address = err; else delete next.address;
                                return next;
                              });
                            }
                          }}
                          onBlur={() => {
                            const err = validateSingleField("address", address);
                            setFieldErrors((prev) => {
                              const next = { ...prev };
                              if (err) next.address = err; else delete next.address;
                              return next;
                            });
                          }}
                          className={`${styles.inputField} ${fieldErrors.address ? styles.inputFieldError : ""}`}
                        />
                        {fieldErrors.address && <span className={styles.fieldErrorText}>{fieldErrors.address}</span>}
                      </div>

                      <div className={styles.splitInputs}>
                        <div>
                          <input
                            id="checkout-city"
                            type="text"
                            required
                            placeholder="City"
                            value={city}
                            onChange={(e) => {
                              setCity(e.target.value);
                              if (fieldErrors.city) {
                                const err = validateSingleField("city", e.target.value);
                                setFieldErrors((prev) => {
                                  const next = { ...prev };
                                  if (err) next.city = err; else delete next.city;
                                  return next;
                                });
                              }
                            }}
                            onBlur={() => {
                              const err = validateSingleField("city", city);
                              setFieldErrors((prev) => {
                                const next = { ...prev };
                                if (err) next.city = err; else delete next.city;
                                return next;
                              });
                            }}
                            className={`${styles.inputField} ${fieldErrors.city ? styles.inputFieldError : ""}`}
                          />
                          {fieldErrors.city && <span className={styles.fieldErrorText}>{fieldErrors.city}</span>}
                        </div>

                        <div>
                          <StateSelect
                            id="checkout-stateName"
                            value={stateName}
                            onChange={(val) => {
                              setStateName(val);
                              if (fieldErrors.stateName) {
                                const err = validateSingleField("stateName", val);
                                setFieldErrors((prev) => {
                                  const next = { ...prev };
                                  if (err) next.stateName = err; else delete next.stateName;
                                  return next;
                                });
                              }
                            }}
                            onBlur={() => {
                              const err = validateSingleField("stateName", stateName);
                              setFieldErrors((prev) => {
                                const next = { ...prev };
                                if (err) next.stateName = err; else delete next.stateName;
                                return next;
                              });
                            }}
                            error={fieldErrors.stateName}
                          />
                          {fieldErrors.stateName && <span className={styles.fieldErrorText}>{fieldErrors.stateName}</span>}
                        </div>
                      </div>

                      <div className={styles.splitInputs}>
                        <div>
                          <input
                            id="checkout-pincode"
                            type="text"
                            required
                            maxLength={6}
                            placeholder="PIN Code (6 digits)"
                            value={pincode}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                              setPincode(val);
                              if (fieldErrors.pincode) {
                                const err = validateSingleField("pincode", val);
                                setFieldErrors((prev) => {
                                  const next = { ...prev };
                                  if (err) next.pincode = err; else delete next.pincode;
                                  return next;
                                });
                              }
                            }}
                            onBlur={() => {
                              const err = validateSingleField("pincode", pincode);
                              setFieldErrors((prev) => {
                                const next = { ...prev };
                                if (err) next.pincode = err; else delete next.pincode;
                                return next;
                              });
                            }}
                            className={`${styles.inputField} ${fieldErrors.pincode ? styles.inputFieldError : ""}`}
                          />
                          {fieldErrors.pincode && <span className={styles.fieldErrorText}>{fieldErrors.pincode}</span>}
                        </div>

                        <div>
                          <input
                            type="text"
                            readOnly
                            value="India"
                            className={styles.inputField}
                            style={{ backgroundColor: "#F9FAFB", color: "#6B7280", cursor: "default" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error Banner */}
                  {error && (
                    <div className={styles.errorBox}>
                      <AlertCircle size={15} />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Total Row */}
                  <div className={styles.totalRow}>
                    <div className={styles.totalLabel}>Total</div>
                    <div className={styles.totalAmount}>
                      ₹{activePlan.amount} <span>/ {activePlan.period}</span>
                    </div>
                  </div>

                  {/* Submit Action Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className={styles.submitBtn}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 size={17} className="animate-spin" />
                        <span>Processing securely...</span>
                      </>
                    ) : (
                      <>
                        <Lock size={16} />
                        <span>Subscribe Now • ₹{activePlan.amount}</span>
                      </>
                    )}
                  </button>
                </form>

                {/* Security Footnote */}
                <div className={styles.securityNote}>
                  <Shield size={13} color="#059669" style={{ flexShrink: 0 }} />
                  <span>Your payment data is fully encrypted with 256-bit SSL encryption.</span>
                </div>

                {/* Developer Fast-Track Test Option */}
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <button
                    type="button"
                    onClick={handleSimulateDevSuccess}
                    disabled={isLoading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#9CA3AF',
                      fontSize: '11px',
                      cursor: 'pointer',
                      textDecoration: 'underline',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#059669')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#9CA3AF')}
                  >
                    ⚡ [Dev Sandbox] Instant Test Checkout (Bypass PayU portal)
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

