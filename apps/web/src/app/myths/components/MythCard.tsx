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
}

interface MythCardProps {
  data: MythData;
  isActive: boolean;
  onNext: () => void;
  onPrev: () => void;
  index: number;
}

export function MythCard({ data, isActive, onNext, onPrev, index }: MythCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showXP, setShowXP] = useState(false);

  const handleFlip = () => {
    if (!isActive) return;
    if (!isFlipped) {
      setIsFlipped(true);
      setTimeout(() => {
        setShowXP(true);
      }, 600);
      setTimeout(() => {
        setShowXP(false);
      }, 2500);
    }
  };

  // Reset flip state when not active
  useEffect(() => {
    if (!isActive) {
      setIsFlipped(false);
      setShowXP(false);
    }
  }, [isActive]);

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
      initial={{ scale: 0.9, opacity: 0, y: 30 }}
      animate={{ 
        scale: isActive ? 1 : 1 - index * 0.04, 
        opacity: isActive ? 1 : 1 - index * 0.15, 
        y: isActive ? 0 : index * 16,
      }}
      transition={{ type: 'spring', stiffness: 400, damping: 40 }}
    >
      <motion.div
        className={styles.card}
        onClick={handleFlip}
        drag={isActive ? "x" : false}
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.6}
        onDragEnd={handleDragEnd}
        animate={{
          rotateY: isFlipped ? 180 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 80,
          damping: 20,
          mass: 1,
        }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Front of Card: MYTH */}
        <div className={`${styles.cardFace} ${styles.cardFront}`}>
          <div className={styles.badge}>
            {getCategoryIcon(data.category)}
            <span style={{ marginLeft: 6 }}>{data.category}</span>
          </div>
          <div className={styles.cardType}>MYTH</div>
          <h3 className={styles.statement}>"{data.myth}"</h3>
          
          <div className={styles.swipeIndicator}>
            <Hand size={14} />
            <span>Click to reveal · Swipe to skip</span>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <ArrowRight size={14} />
            </motion.div>
          </div>
        </div>

        {/* Back of Card: FACT */}
        <div className={`${styles.cardFace} ${styles.cardBack}`}>
          <div className={styles.badge}>
            <span style={{ marginLeft: 6, color: '#4ade80' }}>REALITY</span>
          </div>
          <h3 className={`${styles.statement} ${styles.factStatement}`}>{data.fact}</h3>
          <p className={styles.factExplanation}>{data.insight}</p>

          <AnimatePresence>
            {isFlipped && (
              <motion.div 
                className={styles.aiInsight}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 200, damping: 20 }}
              >
                <div className={styles.insightIcon}>
                  <Sparkles size={18} />
                </div>
                <div className={styles.insightContent}>
                  <h4>AI Mentor Insight</h4>
                  <p><strong>{data.insightPercent}</strong> of users believed this myth before starting.</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Floating XP Toast */}
      <AnimatePresence>
        {showXP && (
          <motion.div
            className={styles.xpToast}
            initial={{ opacity: 0, y: 0 }}
            animate={{ opacity: 1, y: -20 }}
            exit={{ opacity: 0, y: -40 }}
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
