"use client";
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import styles from './Landing.module.css';
import { ScrollReveal } from './ScrollAnimations';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { question: "Is Finwise AI meant to replace my financial advisor?", answer: "No. Finwise AI is strictly an educational platform. We do not provide personalized financial advice or manage your money. Our goal is to build your financial literacy and confidence so you can make better decisions, whether independently or alongside an advisor." },
    { question: "Does the AI Mentor actually understand my unique situation?", answer: "Yes! When you onboard, we assess your 'Money Personality' archetype. The AI Mentor uses this context to tailor its explanations. For example, if you are a risk-averse 'Guardian', it will focus heavily on security and downside protection when explaining concepts." },
    { question: "Are the story-based simulations based on real market data?", answer: "Absolutely. Our simulations use historical market data to recreate famous crashes, bull runs, and periods of high inflation. You'll experience the emotional rollercoaster of these events in a completely risk-free environment." },
    { question: "How does the Scam Detector work?", answer: "You simply paste a suspicious email, text, or crypto offer into the detector. Our AI analyzes the linguistics, urgency markers, and known scam patterns, giving you a risk score and breaking down exactly how the scammer is trying to manipulate you." },
    { question: "Can I cancel my Premium subscription at any time?", answer: "Yes, you can cancel your subscription at any time directly from your dashboard settings. You will retain access to Premium features until the end of your current billing cycle." }
  ];

  return (
    <section className={`${styles.editorialSection} ${styles.faqSection}`} style={{borderRadius: '48px 48px 0 0', marginTop: '-48px', zIndex: 11}}>
      <div className={styles.editorialContainer}>
        <ScrollReveal>
          <div style={{textAlign: 'center', marginBottom: '16px'}}><span className="section-label">Common Questions</span></div>
          <h2 className={`headline-heading ${styles.sectionHeading}`} style={{textAlign: 'center'}}>Frequently Asked Questions</h2>
          <div className="accent-line" style={{marginTop: '24px'}}></div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <div key={index} className={`${styles.faqItem} ${openIndex === index ? styles.open : ''}`}>
                <button className={styles.faqQuestion} onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                  {faq.question}
                  <Plus size={24} className={styles.faqIcon} />
                </button>
                <div className={styles.faqAnswer}><p>{faq.answer}</p></div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
