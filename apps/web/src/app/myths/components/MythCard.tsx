"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, AlertCircle, ShieldAlert, LineChart, TrendingUp, Lightbulb, Hand } from 'lucide-react';
import styles from './MythVsFact.module.css';
import { triggerProgression } from '@/services/progressionEngine';
import { ScratchCard } from './ScratchCard';

export interface MythData {
  id: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  myth: string;
  fact: string;
  insight: string;
  insightPercent: string;
  confidence: number;
}

interface MythCardProps {
  data: MythData;
  isActive: boolean;
  onNext: () => void;
  onPrev: () => void;
  index: number;
  direction: number;
}

const cardVariants: any = {
  enter: (direction: number) => ({
    opacity: 0,
    scale: 1.02,
    rotate: direction > 0 ? 4 : -4,
    y: 30,
    filter: 'blur(8px)',
  }),
  center: (index: number) => ({
    opacity: index === 0 ? 1 : Math.max(1 - index * 0.15, 0),
    scale: index === 0 ? 1 : Math.max(1 - index * 0.04, 0.8),
    rotate: 0,
    y: index * 16,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 30,
      mass: 0.8,
    }
  }),
  exit: (direction: number) => ({
    opacity: 0,
    scale: 0.96,
    rotate: direction > 0 ? -4 : 4,
    y: -20,
    filter: 'blur(8px)',
    transition: {
      duration: 0.3,
      ease: [0.32, 0.72, 0, 1]
    }
  })
};

export function MythCard({ data, isActive, onNext, onPrev, index, direction }: MythCardProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [showXP, setShowXP] = useState(false);

  useEffect(() => {
    setIsRevealed(false);
  }, [data.id]);

  const handleReveal = () => {
    setIsRevealed(true);
    triggerProgression('MYTH_BUSTED', 'learning', true);
    setTimeout(() => {
      setShowXP(true);
    }, 400);
    setTimeout(() => {
      setShowXP(false);
    }, 2200);
  };

  const handleDragEnd = (event: any, info: any) => {
    const swipeThreshold = 50;
    if (info.offset.x < -swipeThreshold) {
      onNext();
    } else if (info.offset.x > swipeThreshold) {
      onPrev();
    }
  };

  return (
    <motion.div 
      className={styles.cardContainer}
      style={{
        zIndex: isActive ? 10 : 5 - index,
      }}
      custom={direction}
      variants={cardVariants}
      initial="enter"
      animate="center"
      exit="exit"
    >
      <motion.div
        className={styles.card}
        drag={isActive && isRevealed ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        onDragEnd={handleDragEnd}
        whileTap={{ scale: 0.99 }}
        style={{ background: 'transparent' }}
      >
        <ScratchCard 
          isComplete={isRevealed} 
          onComplete={handleReveal}
          myth={data.myth}
        >
          {/* Back of Card: FACT (Now always rendered, but hidden by canvas until scratched) */}
          <div className={`${styles.cardFace} ${styles.cardFactSide}`}>
            <div className={`${styles.badge} ${styles.badgeFact}`}>
              <span style={{ marginLeft: 6 }}>REALITY</span>
            </div>
            <h3 className={`${styles.statement} ${styles.factStatement}`}>{data.fact}</h3>
            <p className={styles.factExplanation}>{data.insight}</p>
          </div>
        </ScratchCard>
      </motion.div>

      {/* Floating XP Toast */}
      <AnimatePresence>
        {showXP && (
          <motion.div
            className={styles.xpToast}
            initial={{ opacity: 0, scale: 0.9, y: 0, x: '-50%' }}
            animate={{ opacity: 1, scale: 1, y: -20, x: '-50%' }}
            exit={{ opacity: 0, scale: 0.9, y: -40, x: '-50%' }}
            transition={{ duration: 0.4 }}
          >
            <Sparkles size={14} />
            +15 Knowledge XP
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

