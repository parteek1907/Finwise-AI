"use client";

import React from "react";
import { PricingSection } from "@/components/landing/PricingSection";
import { Navbar } from "@/components/landing/Navbar";
import { FooterFinal } from "@/components/landing/FooterFinal";

export default function PricingPage() {
  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#303A3C", color: "#DDD7C9" }}>
      <Navbar />
      <main style={{ paddingTop: "80px", paddingBottom: "60px" }}>
        <PricingSection />
      </main>
      <FooterFinal />
    </div>
  );
}
