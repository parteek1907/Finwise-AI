"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import styles from './Landing.module.css';
import { ScrollReveal } from './ScrollAnimations';

export function FinalCTA() {
  return (
    <section className={styles.finalCtaSection}>
      <ScrollReveal>
        <div className={styles.finalCtaContainer}>
          <div>
            <h2 className={styles.ctaHeadline}>
              Start Now<br />
              And Build Your Future<br />
              Financial Confidence
            </h2>
            <Link href="/auth">
              <button className={styles.ctaButton}>
                Get Started Free
                <ArrowRight size={16} />
              </button>
            </Link>
          </div>
          <Image
            src="/cta.png"
            alt="Build your financial future with FinWise AI"
            width={600}
            height={450}
            className={styles.ctaImage}
          />
        </div>
      </ScrollReveal>
    </section>
  );
}
