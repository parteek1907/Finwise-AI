"use client";
import React from 'react';
import { Header } from '@/components/ui/header-final';
import { MarketTicker } from '@/components/landing/MarketTicker';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Resources } from '@/components/landing/Resources';
import { Community } from '@/components/landing/Community';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQ } from '@/components/landing/FAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { FooterFinal } from '@/components/landing/FooterFinal';
import { SmoothScrollProvider } from '@/components/landing/ScrollAnimations';
import styles from '@/components/landing/Landing.module.css';

export default function LandingPage() {
  return (
    <SmoothScrollProvider>
      <div className={styles.pageWrapper}>
        <Header />
        <MarketTicker />
        <Hero />
        <HowItWorks />
        <Resources />
        <Community />
        <PricingSection />
        <FAQ />
        <FinalCTA />
        <FooterFinal />
      </div>
    </SmoothScrollProvider>
  );
}
