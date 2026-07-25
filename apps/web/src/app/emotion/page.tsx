"use client";

import React, { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { useEmotion } from '../../hooks/useEmotion';
import { EmotionInput } from '../../components/emotion/EmotionInput';
import { EmotionResults } from '../../components/emotion/EmotionResults';
import { EmotionHistoryList } from '../../components/emotion/EmotionHistoryList';
import { EmotionAnalytics } from '../../components/emotion/EmotionAnalytics';
import { Brain } from 'lucide-react';
import styles from './Emotion.module.css';
import { motion, AnimatePresence } from 'framer-motion';

export default function EmotionPage() {
  const { history, currentAnalysis, loading, error, stats, analyze, clearAnalysis } = useEmotion();
  
  const [activeTab, setActiveTab] = useState<'Analysis' | 'Analytics'>('Analysis');

  return (
    <AppLayout>
      <div className={styles.container}>
        <div className={styles.header}>
          <div className={styles.titleWrap}>
            <div className={styles.iconBox}>
              <Brain size={28} color="#19533B" />
            </div>
            <div>
              <h1 className={styles.title}>Emotion AI</h1>
              <p className={styles.subtitle}>Understand the psychology behind your investment decisions.</p>
            </div>
          </div>
          
          {history.length > 0 && (
            <div className={styles.tabs}>
              <button 
                className={`${styles.tab} ${activeTab === 'Analysis' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('Analysis')}
              >
                Analysis
              </button>
              <button 
                className={`${styles.tab} ${activeTab === 'Analytics' ? styles.activeTab : ''}`}
                onClick={() => setActiveTab('Analytics')}
              >
                Analytics
              </button>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'Analysis' ? (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={styles.mainGrid}
            >
              <div className={styles.leftColumn}>
                <EmotionInput onAnalyze={analyze} loading={loading} />
                {error && (
                  <div className={styles.errorCard}>
                    <p className={styles.errorText}>{error}</p>
                    <button className={styles.retryBtn} onClick={() => analyze('retry')}>Try Again</button>
                  </div>
                )}
                {currentAnalysis && (
                  <EmotionResults analysis={currentAnalysis} onClear={clearAnalysis} />
                )}
              </div>
              <div className={styles.rightColumn}>
                <EmotionHistoryList history={history} />
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={styles.analyticsWrapper}
            >
              {stats && <EmotionAnalytics stats={stats} />}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
