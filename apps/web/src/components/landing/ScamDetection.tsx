"use client";
import React from 'react';
import { ShieldAlert, Fingerprint } from 'lucide-react';
import styles from './Landing.module.css';
import { Button } from '@/components/ui/Button';
import { ScrollReveal, ScrollScale } from './ScrollAnimations';

export function ScamDetection() {
  return (
    <section className={`${styles.editorialSection} dark-section ${styles.scamSection}`} style={{borderRadius: '48px 48px 0 0', marginTop: '-48px', zIndex: 6}}>
      <div className={styles.editorialContainer}>
        <ScrollReveal>
          <div style={{textAlign: 'center', marginBottom: '16px'}}><span className="section-label">Real-Time Protection</span></div>
          <h2 className={`headline-heading ${styles.sectionHeading}`} style={{textAlign: 'center'}}>Scam Detection in Real-Time</h2>
          <p className="body-large" style={{ color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>Paste any suspicious message or email. We break down the exact psychological manipulation tactics scammers use.</p>
          <div className="accent-line-gold" style={{marginTop: '32px'}}></div>
        </ScrollReveal>

        <ScrollScale scaleFrom={0.9}>
          <div className={styles.scamDemoContainer}>
            <div className={styles.scamInputPanel}>
              <textarea className={styles.scamTextarea} readOnly value="URGENT: Your account has been suspended due to suspicious activity. Click here immediately to verify your identity and restore access, or your funds will be permanently frozen. Do not share this link with anyone." />
              <Button variant="primary" style={{width: '100%'}}>Analyze Message</Button>
            </div>
            <div className={styles.scamResultPanel}>
              <div className={styles.scamResultHeader}>
                <div className={styles.riskScore}>
                  <span className={styles.riskScoreLabel}>Risk Score</span>
                  <span className={styles.riskScoreValue}>98 / 100</span>
                </div>
                <ShieldAlert size={48} color="var(--color-error)" />
              </div>
              <p style={{fontSize: '16px', lineHeight: 1.6}}>
                <span className={styles.highlightedText}>URGENT:</span> Your account has been suspended... Click here <span className={styles.highlightedText}>immediately</span> to verify... or your funds will be <span className={styles.highlightedText}>permanently frozen</span>.
              </p>
              <div className={styles.scamExplanation}>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px', color: '#fff'}}>
                  <Fingerprint size={16} color="var(--color-error)"/> <strong>Tactic: Artificial Urgency</strong>
                </div>
                Scammers use extreme urgency to bypass your logical thinking. Legitimate financial institutions will never force you to click a link to prevent a permanent freeze.
              </div>
            </div>
          </div>
        </ScrollScale>
      </div>
    </section>
  );
}
