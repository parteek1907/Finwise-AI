"use client";
import React from 'react';
import { Fingerprint, Brain, Target, ShieldCheck } from 'lucide-react';
import styles from './Landing.module.css';
import { ScrollReveal, StaggerReveal } from './ScrollAnimations';

export function HowItWorks() {
  return (
    <section className={`${styles.editorialSection} ${styles.howItWorksSection}`} id="how-it-works" style={{borderRadius: '48px 48px 0 0', marginTop: '-48px', zIndex: 3}}>
      <div className={styles.editorialContainer}>
        
        <ScrollReveal>
          <div style={{textAlign: 'center', marginBottom: '16px'}}>
            <span className="section-label">How It Works</span>
          </div>
          <h2 className={`headline-heading ${styles.sectionHeading}`} style={{textAlign: 'center'}}>
            Four steps to financial mastery.
          </h2>
          <div className="accent-line" style={{marginTop: '24px'}}></div>
        </ScrollReveal>

        <StaggerReveal className={styles.timelineGrid} staggerDelay={150}>
          <div className={styles.timelineCard}>
            <div className={styles.timelineIconWrapper} data-step="1"><Fingerprint size={28} /></div>
            <h3 className={styles.timelineTitle}>Take Personality Test</h3>
            <p className={styles.timelineDesc}>Discover your financial archetype. Are you a Guardian, Explorer, or Visionary? We map your risk tolerance and biases.</p>
          </div>
          <div className={styles.timelineCard}>
            <div className={styles.timelineIconWrapper} data-step="2"><Brain size={28} /></div>
            <h3 className={styles.timelineTitle}>Meet AI Mentor</h3>
            <p className={styles.timelineDesc}>Your dedicated AI mentor adapts its communication style and advice specifically to your psychological profile.</p>
          </div>
          <div className={styles.timelineCard}>
            <div className={styles.timelineIconWrapper} data-step="3"><Target size={28} /></div>
            <h3 className={styles.timelineTitle}>Learn Through Practice</h3>
            <p className={styles.timelineDesc}>Engage in scenario-based learning, interactive quizzes, and risk-free market simulations instead of boring videos.</p>
          </div>
          <div className={styles.timelineCard}>
            <div className={styles.timelineIconWrapper} data-step="4"><ShieldCheck size={28} /></div>
            <h3 className={styles.timelineTitle}>Build Confidence</h3>
            <p className={styles.timelineDesc}>Monitor your rising Financial Health Score and step into the real world with absolute clarity and control.</p>
          </div>
        </StaggerReveal>
      </div>
    </section>
  );
}
