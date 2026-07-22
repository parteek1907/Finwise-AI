"use client";
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './Landing.module.css';
import { HeroBackground } from './HeroBackground';

export function Hero() {
  return (
    <section className={styles.hero}>
      <HeroBackground />
      <div className={styles.heroContent}>
        <h1 className={styles.heroHeadline}>
          <span className={styles.heroLine}>BUILD CONFIDENCE</span>
          <span className={styles.heroLine}>AND THEN MASTER</span>
          <span className={styles.heroLastLine}>
            <span className={styles.heroOutlineText}>YOUR MONEY</span>
            <Link href="/auth">
              <button className={styles.heroCTAButton}>
                <span className={styles.heroCTAArrow}>
                  <ArrowRight size={18} />
                </span>
                <span>START LEARNING</span>
              </button>
            </Link>
          </span>
        </h1>
      </div>
    </section>
  );
}
