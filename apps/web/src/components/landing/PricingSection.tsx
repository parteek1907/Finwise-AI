"use client";
import React from 'react';
import { Pricing } from "@/components/blocks/pricing";
import styles from './Landing.module.css';

const demoPlans = [
  {
    name: "FREE",
    price: "0",
    yearlyPrice: "0",
    period: "forever",
    features: [
      "Access to AI Mentor",
      "Basic Financial Health Score",
      "Scam Detection (5/day)",
      "Explorer Archetype Profile",
    ],
    description: "Perfect for students beginning their journey.",
    buttonText: "Start Free",
    href: "/auth",
    isPopular: false,
  },
  {
    name: "PREMIUM",
    price: "29",
    yearlyPrice: "19",
    period: "per month",
    features: [
      "Unlimited AI Mentor Access",
      "Dynamic Health Score Tracking",
      "Unlimited Scam Detection",
      "Full Story-Based Simulations",
      "Advanced Goal Tracking",
      "Priority Support",
    ],
    description: "The complete ecosystem to build lasting wealth.",
    buttonText: "Get Premium",
    href: "/auth",
    isPopular: true,
  },
  {
    name: "STUDENT",
    price: "9",
    yearlyPrice: "5",
    period: "per month",
    features: [
      "Everything in Free",
      "Full Story-Based Simulations",
      "Discounted Premium Tools",
      "Student Community Access",
      ".edu email required",
    ],
    description: "Special pricing for verified university students.",
    buttonText: "Verify Student Status",
    href: "/auth",
    isPopular: false,
  },
];

export function PricingSection() {
  return (
    <section className={`${styles.editorialSection} dark-section`} style={{borderRadius: '48px 48px 0 0', marginTop: '-48px', zIndex: 10}}>
      <Pricing 
        plans={demoPlans}
        title="Simple, Transparent Pricing"
        description="Choose the plan that works for you. All plans include access to our AI Mentor and basic scam detection."
      />
    </section>
  );
}
