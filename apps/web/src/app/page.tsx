"use client";
import React from 'react';
import { Header } from '@/components/ui/header-2';
import { MarketTicker } from '@/components/landing/MarketTicker';
import { Hero } from '@/components/landing/Hero';
import { StatsBar } from '@/components/landing/StatsBar';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Resources } from '@/components/landing/Resources';
import { Community } from '@/components/landing/Community';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQ } from '@/components/landing/FAQ';
import { FinalCTA } from '@/components/landing/FinalCTA';
import { Footer } from '@/components/landing/Footer';
import { SmoothScrollProvider } from '@/components/landing/ScrollAnimations';
import styles from '@/components/landing/Landing.module.css';

export default function LandingPage() {
  return (
    <SmoothScrollProvider>
      <div className={styles.pageWrapper}>
        <Header />
        <MarketTicker />
        <Hero />
        <StatsBar />
        <HowItWorks />
        <Resources />
        <Community />
        <PricingSection />
        <FAQ />
        <FinalCTA />
        <Footer />
      </div>
    </SmoothScrollProvider>
  );
}
