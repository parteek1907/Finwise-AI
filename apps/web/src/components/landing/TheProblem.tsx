"use client";
import React from 'react';
import { X, Check, ArrowRight } from 'lucide-react';
import styles from './Landing.module.css';
import { ScrollReveal, StaggerReveal } from './ScrollAnimations';

export function TheProblem() {
  return (
    <section className={`${styles.editorialSection} dark-section ${styles.problemSection}`} style={{borderRadius: '48px 48px 0 0', marginTop: '-48px', zIndex: 2}}>
      <div className={styles.editorialContainer}>
        
        <ScrollReveal distance={60}>
          <div style={{textAlign: 'center', marginBottom: '16px'}}>
            <span className="section-label">The Problem</span>
          </div>
          <h2 className={`headline-heading ${styles.problemHeadline}`}>
            Most people don't lose money because they're unintelligent.<br/>
            They lose money because nobody taught them how to think financially.
          </h2>
        </ScrollReveal>

        <StaggerReveal className={styles.comparisonGrid} staggerDelay={200}>
          <div className={`${styles.comparisonCol} ${styles.colTraditional}`}>
            <h3 className={styles.colTitle} style={{color: 'var(--color-error)'}}>
              <X size={24} /> Traditional Learning
            </h3>
            <ul className={styles.colList}>
              <li><X size={18} className="shrink-0 mt-1" /> Passive videos and articles</li>
              <li><X size={18} className="shrink-0 mt-1" /> Generic, one-size-fits-all advice</li>
              <li><X size={18} className="shrink-0 mt-1" /> Zero emotional or behavioral context</li>
              <li><X size={18} className="shrink-0 mt-1" /> Real money at risk during the learning curve</li>
            </ul>
          </div>

          <div className={`${styles.comparisonCol} ${styles.colFinwise}`}>
            <h3 className={styles.colTitle} style={{color: 'var(--color-accent-primary)'}}>
              <Check size={24} /> Finwise AI
            </h3>
            <ul className={styles.colList}>
              <li><Check size={18} className="shrink-0 mt-1" /> Active, conversational AI mentor</li>
              <li><Check size={18} className="shrink-0 mt-1" /> Tailored to your specific money personality</li>
              <li><Check size={18} className="shrink-0 mt-1" /> Deep focus on behavioral psychology</li>
              <li><Check size={18} className="shrink-0 mt-1" /> Risk-free simulated environments</li>
            </ul>
          </div>

          <div className={`${styles.comparisonCol} ${styles.colResult}`}>
            <h3 className={styles.colTitle} style={{color: 'var(--color-accent-secondary)'}}>
              <ArrowRight size={24} /> The Result
            </h3>
            <ul className={styles.colList}>
              <li><Check size={18} className="shrink-0 mt-1" /> 3x faster concept retention</li>
              <li><Check size={18} className="shrink-0 mt-1" /> Significant reduction in FOMO investing</li>
              <li><Check size={18} className="shrink-0 mt-1" /> Higher confidence in long-term goals</li>
              <li><Check size={18} className="shrink-0 mt-1" /> A robust mental framework for wealth</li>
            </ul>
          </div>
        </StaggerReveal>
      </div>
    </section>
  );
}
