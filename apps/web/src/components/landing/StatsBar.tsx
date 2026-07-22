"use client";
import React from 'react';
import styles from './Landing.module.css';
import { ScrollReveal } from './ScrollAnimations';

export function StatsBar() {
  const stats = [
    { label: "Learners", value: "10K+", desc: "Active financial learners building confidence daily." },
    { label: "Founded", value: "2024", desc: "Building the future of financial education." },
    { label: "Countries", value: "195+", desc: "Learners from every corner of the globe." },
    { label: "Features", value: "30+", desc: "AI-powered tools for complete financial mastery." },
  ];

  return (
    <section className={styles.statsBar}>
      <ScrollReveal direction="up" distance={40}>
        <div className={styles.statsBarInner}>
          <div className={styles.statsGrid}>
            {stats.map((stat, i) => (
              <div key={i} className={styles.statItem}>
                <div className={styles.statLabel}>
                  <span className={styles.statDot} />
                  {stat.label}
                </div>
                <div className={styles.statValue}>{stat.value}</div>
                <p className={styles.statDesc}>{stat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>
    </section>
  );
}
