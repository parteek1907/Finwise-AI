"use client";
import React from 'react';
import { Hero } from '@/components/landing/Hero';
import { TheProblem } from '@/components/landing/TheProblem';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { ProductShowcase } from '@/components/landing/ProductShowcase';
import { MoneyPersonality } from '@/components/landing/MoneyPersonality';
import { AIMentor } from '@/components/landing/AIMentor';
import { ScamDetection } from '@/components/landing/ScamDetection';
import { HealthScore } from '@/components/landing/HealthScore';
import { InteractiveLearning } from '@/components/landing/InteractiveLearning';
import { Testimonials } from '@/components/landing/Testimonials';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQ } from '@/components/landing/FAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { SmoothScrollProvider } from '@/components/landing/ScrollAnimations';
import styles from '@/components/landing/Landing.module.css';

export default function LandingPage() {
  return (
    <SmoothScrollProvider>
      <div className={styles.pageWrapper}>
        <Hero />
        <TheProblem />
        <HowItWorks />
        <ProductShowcase />
        <MoneyPersonality />
        <AIMentor />
        <ScamDetection />
        <HealthScore />
        <InteractiveLearning />
        <Testimonials />
        <PricingSection />
        <FAQ />
        <FinalCTA />
      </div>
    </SmoothScrollProvider>
  );
}
