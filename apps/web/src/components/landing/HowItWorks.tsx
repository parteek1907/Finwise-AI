"use client";
import React from 'react';
import styles from './Landing.module.css';
import { ScrollReveal } from './ScrollAnimations';
import { FeaturesSectionWithHoverEffects } from '@/components/ui/feature-section-with-hover-effects';

export function HowItWorks() {
  return (
    <section className={styles.howItWorksSection} id="how-it-works">
      <div className={styles.howItWorksSectionInner}>
        <ScrollReveal>
          <h2 className={styles.howItWorksTitle}>
            Effortlessly Build Your Financial Confidence
          </h2>
          <p className={styles.howItWorksDesc}>
            Financial mastery may seem daunting, but building confidence is easier than you think.
            Explore our features designed to map your risk tolerance and build lasting financial confidence.
          </p>
        </ScrollReveal>

        <ScrollReveal delay={150}>
          <FeaturesSectionWithHoverEffects />
        </ScrollReveal>
      </div>
    </section>
  );
}
