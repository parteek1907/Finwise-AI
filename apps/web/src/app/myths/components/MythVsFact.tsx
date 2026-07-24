"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
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
    insightPercent: '82%'
  },
  {
    id: '2',
    category: 'Investing',
    difficulty: 'Beginner',
    myth: 'You need ₹1 lakh to start investing.',
    fact: 'You can begin investing with as little as ₹100 through SIPs.',
    insight: 'Small investments made consistently outperform waiting for the "perfect" amount to start.',
    insightPercent: '76%'
  },
  {
    id: '3',
    category: 'Investing',
    difficulty: 'Intermediate',
    myth: 'The stock market is essentially gambling.',
    fact: 'Investing is ownership of businesses. Speculation is gambling.',
    insight: 'When you buy a stock, you own a piece of a company. When you gamble, the odds are mathematically against you.',
    insightPercent: '65%'
  },
  {
    id: '4',
    category: 'Crypto',
    difficulty: 'Advanced',
    myth: 'Crypto is guaranteed to make you rich.',
    fact: 'Crypto is highly volatile and speculative.',
    insight: 'While some have made high returns, crypto should only be a small part of a highly diversified portfolio.',
    insightPercent: '88%'
  },
  {
    id: '5',
    category: 'Investing',
    difficulty: 'Intermediate',
    myth: 'Higher returns always mean better investments.',
    fact: 'Higher returns usually indicate higher underlying risk.',
    insight: 'Risk and reward are directly correlated. An unusually high return often means you could lose your principal.',
    insightPercent: '54%'
  }
];

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

  // Listen for keyboard navigation
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
      <div className={styles.topBadge}>
        <div className={styles.badge}>FINWISE AI EXPERIENCES</div>
      </div>

      <div className={styles.progressIndicator}>
        <span>{currentIndex + 1} / {MYTHS_DATA.length} Myths</span>
        <div className={styles.progressBar}>
          <motion.div 
            className={styles.progressFill}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </div>
      </div>

      <div className={styles.header}>
        <h2 className={styles.title}>Not everything you hear about money is true.</h2>
        <p className={styles.subtitle}>Separate myths from reality before you invest.</p>
      </div>

      <div className={styles.cardArea}>
        <AnimatePresence mode="popLayout" custom={direction}>
          {MYTHS_DATA.map((myth, index) => {
            if (index < currentIndex) return null; // Passed cards
            if (index > currentIndex + 2) return null; // Only show up to 3 cards in stack

            return (
              <MythCard 
                key={myth.id}
                data={myth}
                isActive={index === currentIndex}
                index={index - currentIndex}
                onNext={handleNext}
                onPrev={handlePrev}
              />
            );
          })}
        </AnimatePresence>
      </div>

      <div className={styles.navigation}>
        <button 
          className={styles.navButton} 
          onClick={handlePrev}
          disabled={currentIndex === 0}
        >
          <ArrowLeft size={18} />
        </button>

        <div className={styles.progressDots}>
          {MYTHS_DATA.map((_, idx) => (
            <div 
              key={idx} 
              className={`${styles.dot} ${idx === currentIndex ? styles.dotActive : ''}`}
            />
          ))}
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
  );
}
