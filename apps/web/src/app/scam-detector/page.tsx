"use client";

import React, { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ShieldCheck, Upload, Search, AlertTriangle, ShieldAlert, CheckCircle2, Save, Sparkles } from 'lucide-react';
import styles from './Scam.module.css';
import { motion, AnimatePresence } from 'framer-motion';

export default function ScamDetectorPage() {
  const [inputText, setInputText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<null | 'scam'>(null);

  const handleScan = () => {
    if (!inputText.trim()) return;
    setIsScanning(true);
    setResult(null);
    
    // Simulate API call / scan time
    setTimeout(() => {
      setIsScanning(false);
      setResult('scam');
    }, 2000);
  };

  return (
    <AppLayout>
      <div className={styles.workspace}>
        <header className={styles.header}>
          <div className={styles.titleWrap}>
            <div className={styles.iconBox}><ShieldCheck size={28} color="#22c55e" /></div>
            <div>
              <h1 className={styles.title}>AI Scam Detector</h1>
              <p className={styles.subtitle}>Paste a suspicious message, email, or investment offer to check its safety.</p>
            </div>
          </div>
        </header>

        <div className={styles.layout}>
          {/* Left: Input Area */}
          <div className={styles.inputCol}>
            <div className={styles.card}>
              <div className={styles.tabs}>
                <button className={styles.activeTab}>Text Message / Email</button>
                <button>Upload Image</button>
              </div>

              <textarea
                className={styles.textarea}
                placeholder="Paste the suspicious message here...&#10;&#10;Example: 'URGENT: Your account will be locked. Click here to verify your identity -> http://secure-verify-123.com'"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isScanning}
              ></textarea>

              <div className={styles.uploadZone}>
                <Upload size={20} className={styles.uploadIcon} />
                <span>Or drag and drop a screenshot here</span>
              </div>

              <button 
                className={styles.scanBtn} 
                onClick={handleScan}
                disabled={!inputText.trim() || isScanning}
              >
                {isScanning ? (
                  <><span className={styles.spinner}></span> Analyzing footprint...</>
                ) : (
                  <><Search size={18} /> Analyze Message</>
                )}
              </button>
            </div>
          </div>

          {/* Right: Results Area */}
          <div className={styles.resultCol}>
            <AnimatePresence mode="wait">
              {!result && !isScanning && (
                <motion.div 
                  key="empty"
                  initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                  className={styles.emptyState}
                >
                  <ShieldCheck size={64} opacity={0.1} />
                  <h3>Awaiting Input</h3>
                  <p>Our AI model checks against known phishing patterns, urgency tactics, and malicious domains.</p>
                </motion.div>
              )}

              {isScanning && (
                <motion.div 
                  key="scanning"
                  initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                  className={styles.scanningState}
                >
                  <div className={styles.radar}></div>
                  <h3>Scanning...</h3>
                  <p>Cross-referencing global scam databases...</p>
                </motion.div>
              )}

              {result === 'scam' && (
                <motion.div 
                  key="result"
                  initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}}
                  className={styles.resultCard}
                >
                  <div className={styles.dangerHeader}>
                    <ShieldAlert size={32} />
                    <div>
                      <h2>High Risk Detected</h2>
                      <span>98% probability of being a scam</span>
                    </div>
                  </div>

                  <div className={styles.analysisSection}>
                    <h3>Identified Red Flags</h3>
                    <ul className={styles.redFlagList}>
                      <li>
                        <AlertTriangle size={16} />
                        <strong>False Urgency:</strong> Threatens account closure to force immediate action.
                      </li>
                      <li>
                        <AlertTriangle size={16} />
                        <strong>Malicious Link:</strong> "http://secure-verify-123.com" is not an official domain.
                      </li>
                    </ul>
                  </div>

                  <div className={styles.lessonSection}>
                    <div className={styles.lessonHeader}>
                      <Sparkles size={16} />
                      <h4>Financial Lesson</h4>
                    </div>
                    <p>Legitimate institutions will <strong>never</strong> text you a link and ask you to log in. Always navigate to the official website yourself or call the number on the back of your card.</p>
                  </div>

                  <div className={styles.actionSection}>
                    <button className={styles.saveBtn}><Save size={16} /> Save Report</button>
                    <button className={styles.safeBtn}><CheckCircle2 size={16} /> Mark as Safe (False Positive)</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
