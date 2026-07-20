"use client";
import React from 'react';
import { Brain, Send, Search, Sparkles } from 'lucide-react';
import styles from './Landing.module.css';
import { ScrollReveal, ScrollScale } from './ScrollAnimations';

export function AIMentor() {
  return (
    <section className={`${styles.editorialSection} ${styles.mentorSection}`} style={{borderRadius: '48px 48px 0 0', marginTop: '-48px', zIndex: 5}}>
      <div className={styles.editorialContainer}>
        <ScrollReveal>
          <div style={{textAlign: 'center', marginBottom: '16px'}}><span className="section-label">Your Personal Guide</span></div>
          <h2 className={`headline-heading ${styles.sectionHeading}`} style={{textAlign: 'center'}}>Meet your personal financial guide.</h2>
          <p className="body-large" style={{ color: 'var(--color-text-secondary)', maxWidth: '700px', margin: '0 auto', textAlign: 'center' }}>Not a generic chatbot. An AI mentor that understands your financial health score, your money personality, and your specific goals.</p>
          <div className="accent-line" style={{marginTop: '32px'}}></div>
        </ScrollReveal>

        <ScrollScale scaleFrom={0.9}>
          <div className={styles.mentorMockup}>
            <div className={styles.mentorChatArea}>
              <div className={styles.mentorHeader}>
                <div className={styles.mentorAvatar}><Brain size={24} /></div>
                <div>
                  <div style={{fontWeight: 600, fontSize: '18px'}}>Finwise AI</div>
                  <div style={{fontSize: '14px', color: 'var(--color-text-secondary)'}}>Always online</div>
                </div>
              </div>
              <div className={styles.mentorMessages}>
                <div className={`${styles.chatBubble} ${styles.user}`}>I'm thinking about pulling $5k out of my index funds to buy that new crypto token my friend recommended. What do you think?</div>
                <div className={`${styles.chatBubble} ${styles.ai}`}>I can see why that's tempting, especially since we identified you as an "Explorer" archetype who loves new opportunities. However, pulling from your index funds triggers a capital gains tax event, and disrupts your compounding. Let's look at the risk profile of that token first.</div>
              </div>
              <div className={styles.mentorInputArea}>
                <div className={styles.mentorInputBox}><span style={{flex: 1}}>Type your message...</span><Send size={18} /></div>
              </div>
            </div>
            <div className={styles.mentorReasoningArea}>
              <h3 style={{fontSize: '20px', marginBottom: '8px'}}>AI Reasoning Panel</h3>
              <p style={{color: 'var(--color-text-secondary)', fontSize: '15px'}}>Transparency is key. Here is exactly why the mentor responded this way.</p>
              <div className={styles.reasoningPanel}>
                <div className={styles.reasoningTitle}><Search size={16} /> Context Analyzed</div>
                <p className={styles.reasoningText}>User Archetype: <strong>Explorer</strong><br/>Known Bias: <strong>FOMO</strong><br/>Current Goal: <strong>House Downpayment (18 mos)</strong></p>
              </div>
              <div className={styles.reasoningPanel}>
                <div className={styles.reasoningTitle}><Sparkles size={16} /> Response Strategy</div>
                <p className={styles.reasoningText}>Validate the user's excitement (Explorer trait), but immediately introduce the mathematical friction (taxes) to slow down impulsive decision making.</p>
              </div>
            </div>
          </div>
        </ScrollScale>
      </div>
    </section>
  );
}
