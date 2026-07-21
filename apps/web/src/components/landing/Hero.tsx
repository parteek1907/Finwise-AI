"use client";
import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Brain, AlertTriangle, Sparkles, TrendingUp, Globe } from 'lucide-react';
import styles from './Landing.module.css';
import { EarthGlobe } from './EarthGlobe';

export function Hero() {
  return (
    <section className={`${styles.hero} ${styles.heroDark}`}>

      {/* ── Earth Globe (full-bleed background canvas) ── */}
      <div className={styles.earthWrapper}>
        <EarthGlobe />
      </div>

      {/* ── Radial vignette: darkens edges, focuses center ── */}
      <div className={styles.heroVignette} />

      {/* ── Vertical grid lines (like reference) ── */}
      <div className={styles.heroGridLines} />

      {/* ── Hero Content (centered, on top) ── */}
      <div className={styles.heroContent}>

        {/* Pill label */}
        <div className={styles.heroPillWrap}>
          <span className={styles.heroPillDark}>
            <Globe size={12} />
            Daily Finances
          </span>
        </div>

        {/* Headline */}
        <h1 className={styles.heroDarkHeadline}>
          Master Wealth with<br />
          <span className={styles.heroDarkAccent}>a Mind</span>, Not Just Math.
        </h1>

        {/* Subtitle */}
        <p className={styles.heroDarkSubtitle}>
          Finwise AI combines behavioral psychology with institutional-grade AI<br />
          to build your lasting financial confidence — with zero jargon.
        </p>

        {/* CTAs */}
        <div className={styles.heroDarkActions}>
          <Link href="/auth">
            <button className={styles.heroDarkCTAPrimary}>
              Start Your Journey
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                <path d="M2 7.5h11M9 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </Link>
          <Link href="#how-it-works">
            <button className={styles.heroDarkCTASecondary}>
              Explore Features
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M2 7h10M7 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </Link>
        </div>

        {/* Trust badges */}
        <div className={styles.heroDarkBadges}>
          <span className={styles.heroDarkBadge}><Brain size={14} /> AI Powered</span>
          <span className={styles.badgeDot} />
          <span className={styles.heroDarkBadge}><ShieldCheck size={14} /> 100% Educational</span>
          <span className={styles.badgeDot} />
          <span className={styles.heroDarkBadge}><AlertTriangle size={14} /> No Financial Advice</span>
        </div>

        {/* Live stats row */}
        <div className={styles.heroDarkStats}>
          <div className={styles.heroDarkStat}>
            <span className={styles.statBig}>10K+</span>
            <span className={styles.statSmall}>Active learners</span>
          </div>
          <div className={styles.heroDarkStatDivider} />
          <div className={styles.heroDarkStat}>
            <span className={styles.statBig}>₹2.4Cr</span>
            <span className={styles.statSmall}>Avg. wealth built</span>
          </div>
          <div className={styles.heroDarkStatDivider} />
          <div className={styles.heroDarkStat}>
            <span className={styles.statBig}>94%</span>
            <span className={styles.statSmall}>Scams detected</span>
          </div>
        </div>

      </div>



    </section>
  );
}
