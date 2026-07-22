"use client";
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import styles from './Landing.module.css';
import { ScrollReveal } from './ScrollAnimations';

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    { question: "What is FinWise AI?", answer: "FinWise AI is the world's most premium financial learning platform. It combines behavioral psychology with institutional-grade AI to build your lasting financial confidence — with zero jargon. We don't manage your money; we teach you how to think about it." },
    { question: "How does the AI Mentor work?", answer: "When you onboard, we assess your 'Money Personality' archetype. The AI Mentor uses this context to tailor its explanations. For example, if you are a risk-averse 'Guardian', it will focus heavily on security and downside protection when explaining concepts." },
    { question: "What are the financial simulations?", answer: "Our simulations use historical market data to recreate famous crashes, bull runs, and periods of high inflation. You'll experience the emotional rollercoaster of these events in a completely risk-free environment, building real decision-making skills." },
    { question: "How does the Scam Detector work?", answer: "You simply paste a suspicious email, text, or investment offer into the detector. Our AI analyzes the linguistics, urgency markers, and known scam patterns, giving you a risk score and breaking down exactly how the scammer is trying to manipulate you." },
    { question: "Can I cancel my subscription at any time?", answer: "Yes, you can cancel your subscription at any time directly from your dashboard settings. You will retain access to Premium features until the end of your current billing cycle." },
  ];

  return (
    <section className={styles.faqSection} id="faq">
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <ScrollReveal>
          <div className={styles.faqHeader}>
            <h2 className={styles.faqHeaderTitle}>FAQs</h2>
            <p className={styles.faqHeaderDesc}>
              We love to get your questions about FinWise AI. If you don&apos;t find the answer you&apos;re looking
              for, you can contact support for help.
            </p>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={100}>
          <div className={styles.faqContainer}>
            {faqs.map((faq, index) => (
              <div key={index} className={`${styles.faqItem} ${openIndex === index ? styles.open : ''}`}>
                <button className={styles.faqQuestion} onClick={() => setOpenIndex(openIndex === index ? null : index)}>
                  {faq.question}
                  <Plus size={20} className={styles.faqIcon} />
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
