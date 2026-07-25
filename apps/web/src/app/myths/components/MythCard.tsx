"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ArrowRight, AlertCircle, ShieldAlert, LineChart, TrendingUp, Lightbulb, Hand } from 'lucide-react';
import styles from './MythVsFact.module.css';

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
  const [isFlipped, setIsFlipped] = useState(false);
  const [showXP, setShowXP] = useState(false);

  const handleCardClick = () => {
    if (!isActive) return;
    if (!isFlipped) {
      setIsFlipped(true);
      setTimeout(() => {
        setShowXP(true);
      }, 400);
      setTimeout(() => {
        setShowXP(false);
      }, 2200);
    } else {
      onNext();
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Investing': return <LineChart size={14} />;
      case 'Crypto': return <AlertCircle size={14} />;
      case 'Scams': return <ShieldAlert size={14} />;
      case 'Trading': return <TrendingUp size={14} />;
      default: return <Lightbulb size={14} />;
    }
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
        onClick={handleCardClick}
        drag={isActive ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        onDragEnd={handleDragEnd}
        animate={{
          rotateY: isFlipped ? 180 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 24,
          mass: 0.8,
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Front of Card: MYTH */}
        <div className={`${styles.cardFace} ${styles.cardFront}`} style={{ visibility: isFlipped ? 'hidden' : 'visible' }}>
          <div className={styles.badge}>
            {getCategoryIcon(data.category)}
            <span style={{ marginLeft: 6 }}>{data.category}</span>
          </div>
          <h3 className={styles.statement}>"{data.myth}"</h3>
          
          <div className={styles.swipeIndicator}>
            <Hand size={14} />
            <span>Click to reveal · Click again for next</span>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowRight size={14} />
            </motion.div>
          </div>
        </div>

        {/* Back of Card: FACT */}
        <div className={`${styles.cardFace} ${styles.cardBack}`} style={{ visibility: isFlipped ? 'visible' : 'hidden' }}>
          <div className={`${styles.badge} ${styles.badgeFact}`}>
            <span style={{ marginLeft: 6 }}>REALITY</span>
          </div>
          <h3 className={`${styles.statement} ${styles.factStatement}`}>{data.fact}</h3>
          <p className={styles.factExplanation}>{data.insight}</p>
        </div>
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
