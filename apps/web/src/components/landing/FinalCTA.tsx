"use client";
import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import styles from './Landing.module.css';
import { ScrollReveal, ParallaxSection } from './ScrollAnimations';

export function FinalCTA() {
  return (
    <section className={`${styles.editorialSection} dark-section ${styles.finalCtaSection}`} style={{borderRadius: '48px 48px 0 0', marginTop: '-48px', zIndex: 12}}>
      
      <ParallaxSection speed={0.08}>
        <ScrollReveal distance={100}>
          <div className="accent-line-gold" style={{marginBottom: '48px'}}></div>
          <h2 className={styles.ctaHeadline}>
            Stop reacting to money.<br/>
            Start mastering it.
          </h2>
        </ScrollReveal>
      </ParallaxSection>
      
      <ScrollReveal delay={200} distance={40}>
        <div style={{marginTop: '24px'}}>
          <Link href="/auth">
            <Button variant="primary" size="lg" style={{padding: '24px 64px', fontSize: '20px', borderRadius: '100px'}}>
              Start Your Journey
            </Button>
          </Link>
        </div>
      </ScrollReveal>

    </section>
  );
}
