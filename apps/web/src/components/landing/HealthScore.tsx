"use client";
import React from 'react';
import { TrendingUp, Target, BookOpen } from 'lucide-react';
import styles from './Landing.module.css';
import { ScrollReveal, StaggerReveal, ParallaxSection } from './ScrollAnimations';

export function HealthScore() {
  return (
    <section className={`${styles.editorialSection} ${styles.healthSection}`} style={{borderRadius: '48px 48px 0 0', marginTop: '-48px', zIndex: 7}}>
      <div className={styles.editorialContainer}>
        <ScrollReveal>
          <div style={{textAlign: 'center', marginBottom: '16px'}}><span className="section-label">Track Your Progress</span></div>
          <h2 className={`headline-heading ${styles.sectionHeading}`} style={{textAlign: 'center'}}>Your Financial Health Score</h2>
          <p className="body-large" style={{ color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>Stop guessing if you're doing well. We aggregate your habits, learning progress, and financial resilience into a single, actionable score.</p>
          <div className="accent-line" style={{marginTop: '32px'}}></div>
        </ScrollReveal>

        <div className={styles.healthContainer}>
          <ParallaxSection speed={0.06}>
            <ScrollReveal direction="left" distance={80}>
              <div className={styles.healthVisual}>
                <div className={styles.circularScore}>
                  <div className={styles.circularScoreInner}>
                    <span className={styles.scoreValue}>78</span>
                    <span className={styles.scoreLabel}>Out of 100</span>
                    <div style={{marginTop: '16px', color: 'var(--color-accent-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600}}>
                      <TrendingUp size={16}/> +12 this month
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          </ParallaxSection>

          <StaggerReveal className={styles.healthStats} staggerDelay={150}>
            <div className={styles.healthStatCard}>
              <div className={styles.healthStatIcon} style={{color: 'var(--color-accent-primary)'}}><TrendingUp size={24} /></div>
              <div className={styles.healthStatText}><h4>Monthly Improvement</h4><p>Your emergency fund consistency boosted your score by 12 points.</p></div>
            </div>
            <div className={styles.healthStatCard}>
              <div className={styles.healthStatIcon} style={{color: 'var(--color-accent-secondary)'}}><Target size={24} /></div>
              <div className={styles.healthStatText}><h4>Goal Alignment</h4><p>You are currently on track to hit your "House Downpayment" goal in 14 months.</p></div>
            </div>
            <div className={styles.healthStatCard}>
              <div className={styles.healthStatIcon} style={{color: 'var(--color-accent-blue)'}}><BookOpen size={24} /></div>
              <div className={styles.healthStatText}><h4>Learning Progress</h4><p>Completed the "Behavioral Traps in Bull Markets" interactive simulation.</p></div>
            </div>
          </StaggerReveal>
        </div>
      </div>
    </section>
  );
}
