"use client";
import { cn } from "@/lib/utils";
import {
  BrainCircuit,
  BookOpen,
  Bot,
  Gamepad2,
  Target,
  TrendingUp,
  ShieldAlert,
  FileBarChart,
} from "lucide-react";
import React from "react";

export function FeaturesSectionWithHoverEffects() {
  const features = [
    {
      title: "Money Personality Quiz",
      description:
        "Discover your financial archetype — are you a Guardian, Explorer, or Visionary? We map your risk tolerance and biases.",
      icon: <BrainCircuit size={28} />,
    },
    {
      title: "Tailored Learning Paths",
      description:
        "Select AI-curated modules tailored to your goals — budgeting, investing, or retirement planning.",
      icon: <BookOpen size={28} />,
    },
    {
      title: "Your AI Mentor",
      description:
        "Your dedicated AI mentor adapts its communication style to your unique psychological profile.",
      icon: <Bot size={28} />,
    },
    {
      title: "Risk-Free Simulations",
      description:
        "Experience real market crashes and bull runs in completely risk-free story-based environments.",
      icon: <Gamepad2 size={28} />,
    },
    {
      title: "Goal Setting",
      description:
        "Define your targets — emergency fund, house downpayment, or early retirement — with AI guidance.",
      icon: <Target size={28} />,
    },
    {
      title: "Progress Tracking",
      description:
        "Monitor your rising Financial Health Score and build lasting confidence with real-time insights.",
      icon: <TrendingUp size={28} />,
    },
    {
      title: "Scam Detection",
      description:
        "Paste suspicious emails or offers. Our AI analyzes urgency markers and breaks down scam patterns instantly.",
      icon: <ShieldAlert size={28} />,
    },
    {
      title: "Premium Reports",
      description:
        "Get detailed breakdowns of your behavioral biases and how they affect your financial decisions.",
      icon: <FileBarChart size={28} />,
    },
  ];

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        position: "relative",
        zIndex: 10,
        maxWidth: "1200px",
        margin: "0 auto",
        width: "100%",
      }}
      className="feature-grid"
    >
      {features.map((feature, index) => (
        <Feature key={feature.title} {...feature} index={index} />
      ))}
    </div>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: "40px 28px",
        position: "relative",
        borderRight: index % 4 !== 3 ? "1px solid rgba(48,58,60,0.12)" : "none",
        borderBottom: index < 4 ? "1px solid rgba(48,58,60,0.12)" : "none",
        cursor: "default",
        transition: "background 250ms ease",
        textAlign: "left",
      }}
      className="feature-card group"
    >
      {/* hover gradient — top row fades up, bottom row fades down */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          transition: "opacity 200ms ease",
          background:
            index < 4
              ? "linear-gradient(to top, rgba(48,58,60,0.03) 0%, transparent 100%)"
              : "linear-gradient(to bottom, rgba(48,58,60,0.03) 0%, transparent 100%)",
          pointerEvents: "none",
        }}
        className="feature-hover-bg"
      />

      {/* Icon */}
      <div
        style={{
          marginBottom: "20px",
          position: "relative",
          zIndex: 10,
          color: "#303A3C",
          display: "flex",
        }}
      >
        {icon}
      </div>

      {/* Title with left accent bar */}
      <div
        style={{
          fontSize: "15px",
          fontWeight: 600,
          marginBottom: "12px",
          position: "relative",
          zIndex: 10,
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <div
          className="accent-bar"
          style={{
            width: "3px",
            height: "20px",
            borderRadius: "2px",
            background: "rgba(48,58,60,0.20)",
            flexShrink: 0,
            transition: "background 200ms ease, height 200ms ease",
          }}
        />
        <span
          style={{
            color: "#303A3C",
            transition: "transform 200ms ease",
            display: "inline-block",
            lineHeight: 1.3,
          }}
          className="feature-title"
        >
          {title}
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: "13px",
          color: "#5A6460",
          lineHeight: 1.65,
          position: "relative",
          zIndex: 10,
          margin: 0,
        }}
      >
        {description}
      </p>

      {/* Inline styles for hover via a style tag — we use CSS vars approach */}
      <style>{`
        .feature-card:hover .feature-hover-bg {
          opacity: 1 !important;
        }
        .feature-card:hover .accent-bar {
          background: #303A3C !important;
          height: 28px !important;
        }
        .feature-card:hover .feature-title {
          transform: translateX(4px);
        }
      `}</style>
    </div>
  );
};
