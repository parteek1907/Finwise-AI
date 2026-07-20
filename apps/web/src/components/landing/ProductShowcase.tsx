"use client";
import React from 'react';
import { ArrowRight } from 'lucide-react';
import styles from './Landing.module.css';
import { Button } from '@/components/ui/Button';
import { ScrollReveal, ScrollScale } from './ScrollAnimations';

export function ProductShowcase() {
  const features = [
    {
      title: "Financial Health Score",
      description: "A single, clear metric that gives you an honest look at your financial resilience. We analyze your habits, debts, and savings to give you a baseline to grow from.",
      mockupLabel: "[ Health Score Dashboard Mockup ]",
      dark: false
    },
    {
      title: "AI Mentor",
      description: "Your 24/7 financial guide. Ask complex questions, get tailored advice, and simulate big financial decisions before making them with real money.",
      mockupLabel: "[ AI Mentor Chat Interface ]",
      dark: true
    },
    {
      title: "Scam Detector",
      description: "Paste any suspicious email, text message, or investment opportunity. Our AI instantly analyzes it against known fraud patterns and behavioral red flags.",
      mockupLabel: "[ Scam Analysis Tool ]",
      dark: false
    },
    {
      title: "Dynamic Goals",
      description: "Stop setting vague goals. We help you map out exact timelines, required monthly savings, and the psychological hurdles you'll face along the way.",
      mockupLabel: "[ Goal Tracking View ]",
      dark: true
    }
  ];

  return (
    <section className={styles.showcaseSection} style={{borderRadius: '48px 48px 0 0', marginTop: '-48px', zIndex: 4}}>
      {features.map((feature, index) => (
        <div key={index} className={`${styles.showcaseRow} ${feature.dark ? 'dark-section' : ''}`}>
          
          <ScrollReveal direction={index % 2 === 0 ? "left" : "right"} distance={80}>
            <div className={styles.showcaseContent}>
              <h2 className={styles.showcaseTitle}>{feature.title}</h2>
              <p className={styles.showcaseDesc}>{feature.description}</p>
              <div style={{marginTop: '16px'}}>
                <Button variant={feature.dark ? "primary" : "secondary"} icon={<ArrowRight size={16}/>}>
                  Explore Feature
                </Button>
              </div>
            </div>
          </ScrollReveal>

          <ScrollScale scaleFrom={0.88}>
            <div className={styles.showcaseMockup}>
              <div className={styles.browserMockup}>
                <div className={styles.browserHeader}>
                  <div className={styles.browserDot}></div>
                  <div className={styles.browserDot}></div>
                  <div className={styles.browserDot}></div>
                </div>
                <div className={styles.browserBody}>
                  {feature.mockupLabel}
                </div>
              </div>
            </div>
          </ScrollScale>

        </div>
      ))}
    </section>
  );
}
