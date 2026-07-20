"use client";
import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Brain, LineChart, AlertTriangle, Fingerprint } from 'lucide-react';
import styles from './Landing.module.css';
import { Button } from '@/components/ui/Button';
import { ScrollReveal, ParallaxSection } from './ScrollAnimations';

export function Hero() {
  return (
    <section className={`${styles.editorialSection} ${styles.hero}`}>
      <div className={styles.editorialContainer}>
        <div className={styles.heroGrid}>
          
          <div className={styles.heroLeft}>
            <ScrollReveal delay={100} distance={40}>
              <span className="section-label">Financial Education, Reimagined</span>
            </ScrollReveal>
            <ScrollReveal delay={200} distance={50}>
              <h1 className="headline-display">
                Master wealth with a mind, not just math.
              </h1>
            </ScrollReveal>
            <ScrollReveal delay={350} distance={40}>
              <p className="body-large" style={{ color: 'var(--color-text-secondary)' }}>
                Finwise AI is the premium financial education platform that combines behavioral psychology with institutional-grade AI to build your lasting financial confidence.
              </p>
            </ScrollReveal>
            
            <ScrollReveal delay={500} distance={30}>
              <div className={styles.heroActions}>
                <Link href="/auth">
                  <Button variant="primary">Start Your Journey</Button>
                </Link>
                <Link href="#how-it-works">
                  <Button variant="secondary">See How It Works</Button>
                </Link>
              </div>
            </ScrollReveal>
            
            <ScrollReveal delay={650} distance={20}>
              <div className={styles.trustBadges}>
                <div className={styles.badge}><Brain size={16} /> AI Powered</div>
                <div className={styles.badge}><ShieldCheck size={16} /> 100% Educational</div>
                <div className={styles.badge}><AlertTriangle size={16} /> No Financial Advice</div>
              </div>
            </ScrollReveal>
          </div>
          
          <ScrollReveal direction="right" delay={400} distance={100}>
            <ParallaxSection speed={0.05}>
              <div className={styles.heroRight}>
                <div className={styles.heroMockupPlaceholder}>
                  [ Dashboard Mockup ]
                </div>
                <div className={`${styles.floatingCallout} ${styles.callout1}`}>
                  <LineChart size={18} color="var(--color-accent-primary)" />
                  Financial Health Score
                </div>
                <div className={`${styles.floatingCallout} ${styles.callout2}`}>
                  <Brain size={18} color="var(--color-accent-primary)" />
                  AI Mentor
                </div>
                <div className={`${styles.floatingCallout} ${styles.callout3}`}>
                  <ShieldCheck size={18} color="var(--color-error)" />
                  Scam Detector
                </div>
                <div className={`${styles.floatingCallout} ${styles.callout4}`}>
                  <Fingerprint size={18} color="var(--color-accent-secondary)" />
                  Personality Report
                </div>
              </div>
            </ParallaxSection>
          </ScrollReveal>
          
        </div>
      </div>
    </section>
  );
}
