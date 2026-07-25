"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight, CheckCircle2, ShieldCheck, Gauge, Sparkles, AlertCircle } from 'lucide-react';
import { MythCard, MythData } from './MythCard';
import styles from './MythVsFact.module.css';

const MYTHS_DATA: MythData[] = [
  {
    id: '1',
    category: 'Trading',
    difficulty: 'Beginner',
    myth: 'Trading is the fastest way to become rich.',
    fact: 'Consistent investing usually outperforms emotional short-term trading.',
    insight: 'Day trading requires intense focus and has high failure rates. Long-term investing relies on the power of compounding.',
    insightPercent: '82%',
    confidence: 98
  },
  {
    id: '2',
    category: 'Investing',
    difficulty: 'Beginner',
    myth: 'You need $1,000 to start investing.',
    fact: 'You can begin investing with as little as $10 through fractional shares.',
    insight: 'Small investments made consistently outperform waiting for the "perfect" amount to start.',
    insightPercent: '76%',
    confidence: 96
  },
  {
    id: '3',
    category: 'Investing',
    difficulty: 'Intermediate',
    myth: 'The stock market is essentially gambling.',
    fact: 'Investing is ownership of businesses. Speculation is gambling.',
    insight: 'When you buy a stock, you own a piece of a company. When you gamble, the odds are mathematically against you.',
    insightPercent: '65%',
    confidence: 94
  },
  {
    id: '4',
    category: 'Crypto',
    difficulty: 'Advanced',
    myth: 'Crypto is guaranteed to make you rich.',
    fact: 'Crypto is highly volatile and speculative.',
    insight: 'While some have made high returns, crypto should only be a small part of a highly diversified portfolio.',
    insightPercent: '88%',
    confidence: 99
  },
  {
    id: '5',
    category: 'Investing',
    difficulty: 'Intermediate',
    myth: 'Higher returns always mean better investments.',
    fact: 'Higher returns usually indicate higher underlying risk.',
    insight: 'Risk and reward are directly correlated. An unusually high return often means you could lose your principal.',
    insightPercent: '54%',
    confidence: 95
  }
];

function CommunitySubmission() {
  const [submitted, setSubmitted] = useState(false);
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className={styles.communitySection}>
      <div className={styles.communityLeft}>
        <h2 className={styles.communityTitle}>Heard a financial myth?<br/>We'll separate fact from fiction.</h2>
        <p className={styles.communityCopy}>
          If you've heard an investing tip, viral finance advice, or something that sounds too good to be true, send it to us. We'll verify it and explain the reality.
        </p>
        <div className={styles.trustNotes}>
          <div className={styles.trustNote}>
            <ShieldCheck size={16} /> AI reviewed
          </div>
          <div className={styles.trustNote}>
            <ShieldCheck size={16} /> Educational only
          </div>
          <div className={styles.trustNote}>
            <ShieldCheck size={16} /> No question is too basic
          </div>
        </div>
      </div>
      <div className={styles.communityRight}>
        <AnimatePresence mode="wait">
          {!submitted ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className={styles.textareaWrap}>
                <textarea 
                  className={styles.premiumTextarea}
                  placeholder="Example: 'My friend told me SIPs always guarantee profits' or 'Crypto is the fastest way to become rich.'"
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
              <button 
                className={styles.submitBtn} 
                onClick={handleSubmit}
                disabled={!text.trim()}
              >
                Submit Myth &rarr;
              </button>
            </motion.div>
          ) : (
            <motion.div 
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={styles.successState}
            >
              <CheckCircle2 size={48} className={styles.successIcon} />
              <h3>Myth Received</h3>
              <p>We'll review it and respond with an evidence-based explanation. Thank you for contributing.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function MythVsFact() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const handleNext = () => {
    if (currentIndex < MYTHS_DATA.length - 1) {
      setDirection(1);
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setDirection(-1);
      setCurrentIndex(prev => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex]);

  const progressPercent = ((currentIndex + 1) / MYTHS_DATA.length) * 100;

  return (
    <div className={styles.container}>
      <div className={styles.bgElements}>
        <div className={styles.bgGrid} />
        <div className={styles.bgGradient} />
      </div>

      <div className={styles.contentWrapper}>
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <div className={styles.iconBox}>
              <Gauge size={28} color="#19533B" />
            </div>
            <div>
              <h1 className={styles.title}>Myth vs Fact</h1>
              <p className={styles.subtitle}>Debunk common money misconceptions with evidence-based insights.</p>
            </div>
          </div>
        </div>

        <div className={styles.mainArea}>
          
          {/* Left Panel */}
          <div className={styles.sidePanel}>
            {/* Belief Percentage Highlight Card */}
            <div className={styles.highlightCard}>
              <span className={styles.percentBadge}>{MYTHS_DATA[currentIndex].insightPercent}</span>
              <p className={styles.highlightLabel}>of users believed this myth before learning the facts.</p>
            </div>

            {/* Truth Confidence Gauge Box */}
            <div className={styles.confidenceCard}>
              <div className={styles.confidenceHeader}>
                <Gauge size={16} color="#29A367" />
                <span>Truth Confidence</span>
              </div>
              <div className={styles.gaugeMeterWrap}>
                <div className={styles.gaugeArc}>
                  <div 
                    className={styles.gaugeNeedle} 
                    style={{ transform: `rotate(${(MYTHS_DATA[currentIndex].confidence / 100) * 180 - 90}deg)` }} 
                  />
                </div>
                <span className={styles.confidenceValue}>{MYTHS_DATA[currentIndex].confidence}%</span>
              </div>
              <p className={styles.confidenceSub}>Factual accuracy verified by AI & market data.</p>
            </div>
          </div>

          {/* Center Card Stack */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '480px' }}>
            <div className={styles.cardArea}>
              <AnimatePresence mode="wait" custom={direction}>
                <MythCard 
                  key={MYTHS_DATA[currentIndex].id}
                  data={MYTHS_DATA[currentIndex]}
                  isActive={true}
                  index={0}
                  onNext={handleNext}
                  onPrev={handlePrev}
                  direction={direction}
                />
              </AnimatePresence>
            </div>

            {/* Controls */}
            <div className={styles.controlsWrapper}>
              <button 
                className={styles.navButton} 
                onClick={handlePrev}
                disabled={currentIndex === 0}
              >
                <ArrowLeft size={18} />
              </button>

              <div className={styles.editorialProgress}>
                <span>{String(currentIndex + 1).padStart(2, '0')}</span>
                <div className={styles.progressLineContainer}>
                  <div className={styles.progressLineFill} style={{ width: `${progressPercent}%` }} />
                </div>
                <span>{String(MYTHS_DATA.length).padStart(2, '0')}</span>
              </div>

              <button 
                className={styles.navButton} 
                onClick={handleNext}
                disabled={currentIndex === MYTHS_DATA.length - 1}
              >
                <ArrowRight size={18} />
              </button>
            </div>
          </div>

          {/* Right Panel */}
          <div className={styles.sidePanel} style={{ alignItems: 'flex-end', textAlign: 'right' }}>
            <div className={styles.sidePanelItem} style={{ alignItems: 'flex-end' }}>
              <span className={styles.sidePanelLabel}>Knowledge Gained</span>
              <span style={{ fontSize: '18px', color: 'var(--color-text-primary)', letterSpacing: '2px' }}>
                ★★★★<span style={{ opacity: 0.3 }}>★</span>
              </span>
            </div>
          </div>

        </div>

        <div className={styles.divider} />

        <CommunitySubmission />
      </div>
    </div>
  );
}
