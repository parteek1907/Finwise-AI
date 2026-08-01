"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MythMentorPanel } from './MythMentorPanel';
import { Sparkles, Gauge, AlertCircle, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { MythCard, MythData } from './MythCard';
import styles from './MythVsFact.module.css';

function CommunitySubmission({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState('');

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text);
    setText('');
  };

  return (
    <div className={styles.communitySection}>
      <div className={styles.communityLeft}>
        <h2 className={styles.communityTitle}>Heard a financial myth?<br/>We'll separate fact from fiction.</h2>
        <p className={styles.communityCopy}>
          If you've heard an investing tip, viral finance advice, or something that sounds too good to be true, send it to us. We'll verify it and explain the reality using our AI Mentor.
        </p>
        <div className={styles.trustNotes}>
          <div className={styles.trustNote}>
            <ShieldCheck size={16} /> Instant AI review
          </div>
          <div className={styles.trustNote}>
            <ShieldCheck size={16} /> Interactive explanation
          </div>
        </div>
      </div>
      <div className={styles.communityRight}>
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
          Verify with AI Mentor &rarr;
        </button>
      </div>
    </div>
  );
}

export function MythVsFact() {
  const [mythsData, setMythsData] = useState<MythData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isMentorOpen, setIsMentorOpen] = useState(false);
  const [mentorMyth, setMentorMyth] = useState('');

  const fetchMyths = async () => {
    setIsLoading(true);
    setCurrentIndex(0);
    try {
      const response = await fetch('/api/myths/generate');
      if (response.ok) {
        const data = await response.json();
        setMythsData(data.myths);
      } else {
        console.error("Failed to fetch myths");
      }
    } catch (error) {
      console.error("Error fetching myths", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyths();
  }, []);

  const handleNext = () => {
    if (mythsData.length > 0 && currentIndex < mythsData.length - 1) {
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
  }, [currentIndex, mythsData.length]);

  const progressPercent = mythsData.length > 0 ? ((currentIndex + 1) / mythsData.length) * 100 : 0;

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
          >
            <Sparkles size={48} color="#29A367" />
          </motion.div>
          <h2>Generating Your Myths...</h2>
          <p>Our AI Mentor is curating a fresh batch of financial myths vs facts for you.</p>
        </div>
      </div>
    );
  }

  if (mythsData.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingState}>
          <AlertCircle size={48} color="#FF6B6B" />
          <h2>Oops!</h2>
          <p>Failed to generate myths. Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

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
          <button className={styles.generateMoreBtn} onClick={fetchMyths}>
            <Sparkles size={16} /> Generate More Myths
          </button>
        </div>

        <div className={styles.mainArea}>
          
          {/* Left Panel */}
          <div className={styles.sidePanel}>
            {/* Belief Percentage Highlight Card */}
            <div className={styles.highlightCard}>
              <span className={styles.percentBadge}>{mythsData[currentIndex].insightPercent}</span>
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
                    style={{ transform: `rotate(${(mythsData[currentIndex].confidence / 100) * 180 - 90}deg)` }} 
                  />
                </div>
                <div className={styles.glowEffect} />
                <span className={styles.confidenceValue}>{mythsData[currentIndex].confidence}%</span>
              </div>
              <p className={styles.confidenceSub}>Factual accuracy verified by AI & market data.</p>
            </div>
          </div>

          {/* Center Card Stack with Side Navigation */}
          <div className={styles.cardSection}>
            <button 
              className={`${styles.navSideButton} ${currentIndex === 0 ? styles.navSideDisabled : ''}`} 
              onClick={handlePrev}
              disabled={currentIndex === 0}
            >
              <ArrowLeft size={24} />
            </button>

            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '480px', margin: '0 24px' }}>
              <div className={styles.cardArea}>
                <AnimatePresence mode="wait" custom={direction}>
                  <MythCard 
                    key={mythsData[currentIndex].id}
                    data={mythsData[currentIndex]}
                    isActive={true}
                    index={0}
                    onNext={handleNext}
                    onPrev={handlePrev}
                    direction={direction}
                  />
                </AnimatePresence>
              </div>

              {/* Progress Indicator Below Card */}
              <div className={styles.editorialProgress}>
                <span>{String(currentIndex + 1).padStart(2, '0')}</span>
                <div className={styles.progressLineContainer}>
                  <div className={styles.progressLineFill} style={{ width: `${progressPercent}%` }} />
                </div>
                <span>{String(mythsData.length).padStart(2, '0')}</span>
              </div>
            </div>

            <button 
              className={`${styles.navSideButton} ${currentIndex === mythsData.length - 1 ? styles.navSideDisabled : ''}`} 
              onClick={handleNext}
              disabled={currentIndex === mythsData.length - 1}
            >
              <ArrowRight size={24} />
            </button>
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

        <CommunitySubmission onSubmit={(text) => {
          setMentorMyth(`Please verify this financial myth/fact: "${text}"`);
          setIsMentorOpen(true);
        }} />
      </div>

      <MythMentorPanel 
        isOpen={isMentorOpen}
        onClose={() => setIsMentorOpen(false)}
        initialMyth={mentorMyth}
      />
    </div>
  );
}
