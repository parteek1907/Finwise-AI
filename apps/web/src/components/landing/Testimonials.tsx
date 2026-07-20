"use client";
import React from 'react';
import { User } from 'lucide-react';
import styles from './Landing.module.css';
import { ScrollReveal, StaggerReveal } from './ScrollAnimations';

export function Testimonials() {
  const testimonials = [
    { quote: "I always thought I was bad with money. It turns out I just needed advice tailored to my 'Explorer' personality. The AI Mentor actually stopped me from making a terrible crypto trade last week.", name: "Sarah Jenkins", role: "Young Professional", feature: "Referencing: AI Mentor" },
    { quote: "The interactive simulations are a game changer. Experiencing a fake market crash in the app taught me more about my own risk tolerance than 100 hours of YouTube videos ever did.", name: "David Chen", role: "First-Time Investor", feature: "Referencing: Story-Based Simulations" },
    { quote: "I almost fell for a sophisticated phishing text about my bank account. I pasted it into the Scam Detector and it instantly flagged the urgency tactics. This app is a lifesaver.", name: "Elena Rodriguez", role: "University Student", feature: "Referencing: Scam Detector" }
  ];

  return (
    <section className={`${styles.editorialSection} ${styles.testimonialsSection}`} style={{borderRadius: '48px 48px 0 0', marginTop: '-48px', zIndex: 9}}>
      <div className={styles.editorialContainer}>
        <ScrollReveal>
          <div style={{textAlign: 'center', marginBottom: '16px'}}><span className="section-label">What People Say</span></div>
          <h2 className={`headline-heading ${styles.sectionHeading}`} style={{textAlign: 'center'}}>Trusted by future wealth builders.</h2>
          <div className="accent-line" style={{marginTop: '24px'}}></div>
        </ScrollReveal>
        
        <StaggerReveal className={styles.testimonialGrid} staggerDelay={150}>
          {testimonials.map((t, index) => (
            <div key={index} className={styles.testimonialCard}>
              <p className={styles.testimonialQuote}>{t.quote}</p>
              <div className={styles.testimonialAuthor}>
                <div className={styles.authorAvatar}><User size={20} /></div>
                <div className={styles.authorInfo}><h4>{t.name}</h4><p>{t.role}</p></div>
              </div>
              <div className={styles.testimonialFeature}>{t.feature}</div>
            </div>
          ))}
        </StaggerReveal>
      </div>
    </section>
  );
}
