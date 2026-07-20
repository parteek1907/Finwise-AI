"use client";
import React from 'react';
import { Gamepad2, Award, Zap } from 'lucide-react';
import styles from './Landing.module.css';
import { ScrollReveal, StaggerReveal } from './ScrollAnimations';

export function InteractiveLearning() {
  return (
    <section className={`${styles.editorialSection} dark-section ${styles.learningSection}`} style={{borderRadius: '48px 48px 0 0', marginTop: '-48px', zIndex: 8}}>
      <div className={styles.editorialContainer}>
        <ScrollReveal>
          <div style={{textAlign: 'center', marginBottom: '16px'}}><span className="section-label">Learn by Doing</span></div>
          <h2 className={`headline-heading ${styles.sectionHeading}`} style={{textAlign: 'center'}}>Stop Watching. Start Playing.</h2>
          <p className="body-large" style={{ color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>Passive videos don't teach you how to handle a 20% market drop. We use story-based simulations and XP progression to build real financial muscle memory.</p>
          <div className="accent-line-gold" style={{marginTop: '32px'}}></div>
        </ScrollReveal>

        <StaggerReveal className={styles.learningGrid} staggerDelay={150}>
          <div className={styles.learningCard}>
            <Gamepad2 size={32} className={styles.learningIcon} />
            <h3 className={styles.learningTitle}>Story-Based Simulations</h3>
            <p className={styles.learningDesc}>Experience simulated market crashes, unexpected medical bills, and sudden windfalls. Learn to navigate the emotional whiplash of wealth building without risking a dime.</p>
            <div className={styles.learningProgress}><div className={styles.learningProgressBar} style={{width: '65%'}}></div></div>
            <div style={{marginTop: '12px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Module Progress: 65%</div>
          </div>
          <div className={styles.learningCard}>
            <Zap size={32} className={styles.learningIcon} style={{color: 'var(--color-accent-secondary)'}} />
            <h3 className={styles.learningTitle}>Interactive Quizzes</h3>
            <p className={styles.learningDesc}>Test your knowledge on complex topics like tax-loss harvesting or compounding interest through rapid-fire interactive scenarios tailored to your archetype.</p>
            <div className={styles.learningProgress}><div className={styles.learningProgressBar} style={{width: '40%', backgroundColor: 'var(--color-accent-secondary)'}}></div></div>
            <div style={{marginTop: '12px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Accuracy Rate: 92%</div>
          </div>
          <div className={styles.learningCard}>
            <Award size={32} className={styles.learningIcon} style={{color: 'var(--color-accent-blue)'}} />
            <h3 className={styles.learningTitle}>Earn XP & Rewards</h3>
            <p className={styles.learningDesc}>Every lesson completed, every simulation passed, and every scam correctly identified earns you XP that unlocks advanced modules and exclusive AI Mentor features.</p>
            <div className={styles.learningProgress}><div className={styles.learningProgressBar} style={{width: '85%', backgroundColor: 'var(--color-accent-blue)'}}></div></div>
            <div style={{marginTop: '12px', fontSize: '12px', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.1em'}}>Level 14 — Strategist</div>
          </div>
        </StaggerReveal>
      </div>
    </section>
  );
}
