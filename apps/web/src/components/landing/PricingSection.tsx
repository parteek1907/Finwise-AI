"use client";
import React from 'react';
import { Pricing } from "@/components/blocks/pricing";
import styles from './Landing.module.css';

const demoPlans = [
  {
    name: "FOUNDATION",
    price: "0",
    yearlyPrice: "0",
    period: "forever",
    features: [
      "Money Personality Test",
      "Basic Financial Health Score",
      "5 AI Mentor Questions per day",
      "5 Scam Scans per day",
      "3 Introductory Learning Modules",
      "Basic Goal Tracking",
      "Community Support",
    ],
    description: "Perfect for exploring Finwise before upgrading.",
    buttonText: "Start Free",
    href: "/auth",
    isPopular: false,
  },
  {
    name: "PREMIUM",
    price: "299",
    yearlyPrice: "2799",
    period: "month",
    features: [
      "Unlimited AI Mentor",
      "Unlimited Scam Detection",
      "Emotion Analysis",
      "Advanced Financial Health Score",
      "Unlimited Learning Modules",
      "Story-Based Financial Simulations",
      "Unlimited Virtual Stock Market",
      "AI Goal Planning",
      "Personalized Learning Paths",
      "Premium Reports & Insights",
      "Priority Support",
      "Early Access to New Features",
    ],
    description: "The complete ecosystem to build lasting financial confidence.",
    buttonText: "Get Premium",
    href: "/auth",
    isPopular: true,
  },
  {
    name: "STUDENT",
    price: "149",
    yearlyPrice: "1399",
    period: "month",
    features: [
      "Everything in Free",
      "Unlimited Learning Modules",
      "Story-Based Simulations",
      "Student Community Access",
      "Discounted Premium Features",
      "Campus Challenges",
      "Learning Certificates",
      "Student Progress Dashboard",
    ],
    description: "Built specifically for university students learning personal finance.",
    buttonText: "Verify Student Status",
    href: "/auth",
    isPopular: false,
  },
];

export function PricingSection() {
  return (
    <section className={`${styles.editorialSection} dark-section`} style={{ borderRadius: '48px 48px 0 0', marginTop: '-48px', zIndex: 10 }}>
      <Pricing
        plans={demoPlans}
        title="Simple, Transparent Pricing"
        description="Choose the plan that works for you. All plans include access to our AI Mentor and basic scam detection."
      />
    </section>
  );
}
