"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Check, Star } from "lucide-react";
import Link from "next/link";
import { useState, useRef } from "react";
import confetti from "canvas-confetti";
import NumberFlow from "@number-flow/react";
import { useToast } from "@/components/ui/toast";

interface PricingPlan {
  name: string;
  price: string;
  yearlyPrice: string;
  period: string;
  features: string[];
  description: string;
  buttonText: string;
  href: string;
  isPopular: boolean;
}

interface PricingProps {
  plans: PricingPlan[];
  title?: string;
  description?: string;
}

export function Pricing({
  plans,
  title = "Simple, Transparent Pricing",
  description = "Choose the plan that works for you. All plans include access to our platform, lead generation tools, and dedicated support.",
}: PricingProps) {
  const [isMonthly, setIsMonthly] = useState(true);
  const switchRef = useRef<HTMLButtonElement>(null);
  const { toast } = useToast();

  const handleToggle = (checked: boolean) => {
    setIsMonthly(!checked);
    if (checked && switchRef.current) {
      const rect = switchRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { x: x / window.innerWidth, y: y / window.innerHeight },
        colors: ["#DDD7C9", "#C4B896", "#6B7560"],
        ticks: 200,
        gravity: 1.2,
        decay: 0.94,
        startVelocity: 30,
        shapes: ["circle"],
      });
    }
  };

  return (
    <div style={{
      width: "100%",
      maxWidth: "1200px",
      margin: "0 auto",
      padding: "80px 24px",
      color: "#DDD7C9",
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "32px" }}>
        <h2 style={{
          fontSize: "clamp(36px, 5vw, 52px)",
          fontWeight: 400,
          fontFamily: "var(--font-heading)",
          letterSpacing: "-0.01em",
          marginBottom: "16px",
          color: "#DDD7C9",
          textTransform: "uppercase",
        }}>
          {title}
        </h2>
        <p style={{
          fontSize: "18px",
          color: "#A8AD9E",
          maxWidth: "600px",
          margin: "0 auto",
          lineHeight: 1.6,
        }}>
          {description}
        </p>
      </div>

      {/* Toggle */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px",
        marginBottom: "64px",
      }}>
        <Label>
          <Switch
            ref={switchRef as any}
            checked={!isMonthly}
            onCheckedChange={handleToggle}
          />
        </Label>
        <span style={{ fontWeight: 600, fontSize: "16px" }}>
          Yearly{" "}
          <span style={{ color: "#C4B896" }}>(Save 22%)</span>
        </span>
      </div>

      {/* Cards Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.15fr 1fr",
        gap: "0px",
        alignItems: "center",
        maxWidth: "1000px",
        margin: "0 auto",
      }}>
        {plans.map((plan, index) => {
          const isCenter = plan.isPopular;
          return (
            <div
              key={index}
              style={{
                position: "relative",
                backgroundColor: isCenter ? "#3A4648" : "#3A4648",
                border: isCenter ? "2px solid #C4B896" : "1px solid rgba(221,213,192,0.15)",
                borderRadius: "20px",
                padding: isCenter ? "48px 32px" : "40px 28px",
                display: "flex",
                flexDirection: "column",
                zIndex: isCenter ? 20 : 10,
                transform: isCenter ? "scale(1.05)" : "scale(1)",
                boxShadow: isCenter
                  ? "0 25px 60px rgba(0,0,0,0.3)"
                  : "0 8px 30px rgba(0,0,0,0.15)",
                minHeight: isCenter ? "620px" : "560px",
              }}
            >
              {/* Popular Badge */}
              {isCenter && (
                <div style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  backgroundColor: "#C4B896",
                  color: "#303A3C",
                  padding: "4px 14px",
                  borderBottomLeftRadius: "12px",
                  borderTopRightRadius: "18px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  fontSize: "13px",
                  fontWeight: 700,
                }}>
                  <Star size={14} fill="currentColor" />
                  Popular
                </div>
              )}

              {/* Plan Name */}
              <p style={{
                fontSize: "14px",
                fontWeight: 600,
                color: "#A8AD9E",
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                textAlign: "center",
                marginBottom: "16px",
              }}>
                {plan.name}
              </p>

              {/* Price */}
              <div style={{
                textAlign: "center",
                marginBottom: "8px",
              }}>
                <span style={{
                  fontSize: "52px",
                  fontWeight: 700,
                  color: "#DDD7C9",
                  letterSpacing: "-0.02em",
                }}>
                  <NumberFlow
                    value={isMonthly ? Number(plan.price) : Number(plan.yearlyPrice)}
                    format={{
                      style: "currency",
                      currency: "INR",
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    }}
                    transformTiming={{ duration: 500, easing: "ease-out" }}
                    willChange
                  />
                </span>
                {plan.period !== "forever" && (
                  <span style={{
                    fontSize: "16px",
                    color: "#A8AD9E",
                    marginLeft: "4px",
                  }}>
                    / {isMonthly ? plan.period : "year"}
                  </span>
                )}
              </div>

              {/* Billing Note */}
              <p style={{
                textAlign: "center",
                fontSize: "13px",
                color: "#A8AD9E",
                marginBottom: "28px",
                visibility: plan.period === "forever" ? "hidden" : "visible",
              }}>
                {isMonthly ? "billed monthly" : "billed annually"}
              </p>

              {/* Features */}
              <ul style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                flex: 1,
              }}>
                {plan.features.map((feature, idx) => (
                  <li key={idx} style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                  }}>
                    <Check size={16} style={{ color: "#C4B896", marginTop: "3px", flexShrink: 0 }} />
                    <span style={{ fontSize: "15px", color: "#C8C4B8", lineHeight: 1.5 }}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Divider */}
              <hr style={{
                border: "none",
                borderTop: "1px solid rgba(221,213,192,0.15)",
                margin: "24px 0",
              }} />

              {/* CTA Button */}
              {plan.name === "FOUNDATION" ? (
                <Link
                  href={plan.href}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    padding: "14px 0",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 200ms ease",
                    backgroundColor: isCenter ? "#DDD7C9" : "transparent",
                    color: isCenter ? "#303A3C" : "#DDD7C9",
                    border: isCenter ? "none" : "1px solid rgba(221,213,192,0.25)",
                    textDecoration: "none",
                  }}
                >
                  {plan.buttonText}
                </Link>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    toast({
                      title: "Early Access Beta",
                      description: `Our ${plan.name} plan is currently in closed beta. We've noted your interest and will notify you when spots open up!`,
                    });
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    padding: "14px 0",
                    borderRadius: "12px",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 200ms ease",
                    backgroundColor: isCenter ? "#DDD7C9" : "transparent",
                    color: isCenter ? "#303A3C" : "#DDD7C9",
                    border: isCenter ? "none" : "1px solid rgba(221,213,192,0.25)",
                  }}
                >
                  {plan.buttonText}
                </button>
              )}

              {/* Description */}
              <p style={{
                textAlign: "center",
                fontSize: "12px",
                color: "#8A8E7F",
                marginTop: "16px",
                lineHeight: 1.5,
              }}>
                {plan.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
