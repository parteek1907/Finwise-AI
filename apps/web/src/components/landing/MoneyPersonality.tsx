"use client";
import React from 'react';
import { Compass, Shield, Target, Lightbulb, Hammer, Minimize } from 'lucide-react';
import styles from './Landing.module.css';
import { ScrollReveal, StaggerReveal } from './ScrollAnimations';

export function MoneyPersonality() {
  const archetypes = [
    { title: "The Explorer", icon: <Compass size={24} />, strengths: "Open to new opportunities, adaptable.", weaknesses: "Prone to FOMO, struggles with long-term focus.", growth: "Building automated safety nets." },
    { title: "The Guardian", icon: <Shield size={24} />, strengths: "Exceptional saver, highly risk-averse.", weaknesses: "Inflation erosion, fear of investing.", growth: "Gradual exposure to low-risk index funds." },
    { title: "The Strategist", icon: <Target size={24} />, strengths: "Analytical, loves spreadsheets.", weaknesses: "Analysis paralysis, over-optimizing.", growth: "Executing \"good enough\" plans today." },
    { title: "The Visionary", icon: <Lightbulb size={24} />, strengths: "Big picture thinking, entrepreneurial.", weaknesses: "Ignoring day-to-day cash flow.", growth: "Delegating or automating routine tracking." },
    { title: "The Builder", icon: <Hammer size={24} />, strengths: "Consistent, loves compounding progress.", weaknesses: "Can become too rigid or inflexible.", growth: "Allocating a \"fun\" budget guilt-free." },
    { title: "The Minimalist", icon: <Minimize size={24} />, strengths: "Low overhead, immune to lifestyle creep.", weaknesses: "Under-earning, avoiding financial systems.", growth: "Viewing money as a tool for freedom." }
  ];

  return (
    <section className={`${styles.editorialSection} dark-section ${styles.personalitySection}`}>
      <div className={styles.editorialContainer}>
        <ScrollReveal>
          <div style={{textAlign: 'center', marginBottom: '16px'}}><span className="section-label">Know Yourself</span></div>
          <h2 className={`headline-heading ${styles.sectionHeading}`} style={{textAlign: 'center'}}>Discover your Money Personality</h2>
          <p className="body-large" style={{ color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>Personal finance isn't just math. It's psychology. We identify your deep-rooted financial behaviors and tailor your entire education to work with your natural tendencies.</p>
          <div className="accent-line-gold" style={{marginTop: '32px'}}></div>
        </ScrollReveal>

        <StaggerReveal className={styles.archetypeGrid} staggerDelay={100}>
          {archetypes.map((arch, index) => (
            <div key={index} className={styles.archetypeCard}>
              <div className={styles.archetypeHeader}>
                <div className={styles.archetypeIcon}>{arch.icon}</div>
                <h3 className={styles.archetypeTitle}>{arch.title}</h3>
              </div>
              <ul className={styles.traitList}>
                <li className={styles.traitItem}><span className={styles.traitLabel} style={{color: 'var(--color-accent-primary)'}}>Core Strengths</span><span className={styles.traitValue}>{arch.strengths}</span></li>
                <li className={styles.traitItem}><span className={styles.traitLabel} style={{color: 'var(--color-error)'}}>Blind Spots</span><span className={styles.traitValue}>{arch.weaknesses}</span></li>
                <li className={styles.traitItem}><span className={styles.traitLabel} style={{color: 'var(--color-accent-secondary)'}}>Growth Path</span><span className={styles.traitValue}>{arch.growth}</span></li>
              </ul>
            </div>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
