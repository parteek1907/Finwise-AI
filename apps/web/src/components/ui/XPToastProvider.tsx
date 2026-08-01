"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Award } from 'lucide-react';
import styles from './XPToastProvider.module.css';
import confetti from 'canvas-confetti';

interface XPEvent {
  id: string;
  xp: number;
  coins: number;
  label: string;
  levelUp?: {
    level: number;
    title: string;
  } | null;
}

export const XPToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<XPEvent[]>([]);
  const [levelUpData, setLevelUpData] = useState<XPEvent['levelUp'] | null>(null);

  useEffect(() => {
    const handleXpGained = (e: Event) => {
      const customEvent = e as CustomEvent;
      const newEvent: XPEvent = {
        id: `xp_${Date.now()}_${Math.random()}`,
        ...customEvent.detail
      };

      setToasts(prev => [...prev, newEvent]);

      if (newEvent.levelUp) {
        setLevelUpData(newEvent.levelUp);
        triggerConfetti();
      }

      // Auto remove toast
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== newEvent.id));
      }, 3000);
    };

    window.addEventListener('FINWISE_XP_GAINED', handleXpGained);
    return () => window.removeEventListener('FINWISE_XP_GAINED', handleXpGained);
  }, []);

  const triggerConfetti = () => {
    const duration = 3000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#c8a56e', '#0f172a', '#10b981']
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#c8a56e', '#0f172a', '#10b981']
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  };

  return (
    <>
      {children}
      
      {/* Floating XP Toasts */}
      <div className={styles.toastContainer}>
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className={styles.toast}
            >
              <div className={styles.toastIcon}>
                <Zap size={16} />
              </div>
              <div className={styles.toastContent}>
                <span className={styles.toastLabel}>{toast.label}</span>
                <span className={styles.toastValue}>+{toast.xp} XP</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Level Up Modal */}
      <AnimatePresence>
        {levelUpData && (
          <div className={styles.levelUpOverlay}>
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={styles.levelUpModal}
            >
              <div className={styles.levelUpBadge}>
                <Award size={48} color="#c8a56e" />
              </div>
              <h2>Level Up!</h2>
              <div className={styles.levelInfo}>
                <span className={styles.levelNum}>Level {levelUpData.level}</span>
                <span className={styles.levelTitle}>{levelUpData.title}</span>
              </div>
              <p>You've unlocked new prestige on your profile. Keep pushing forward!</p>
              <button 
                className={styles.continueBtn}
                onClick={() => setLevelUpData(null)}
              >
                Continue
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
