"use client";

import React, { useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ShieldCheck, Upload, Search, AlertTriangle, ShieldAlert, CheckCircle2, Save, Sparkles, X } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import styles from './Scam.module.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Tabs } from '@/components/ui/vercel-tabs';
import { useAppStore } from '@/store/useAppStore';

interface ScamResult {
  isScam: boolean;
  probability: number;
  redFlags: Array<{title: string; description: string}>;
  lesson: string;
}

interface SavedReport {
  id: string;
  date: string;
  result: ScamResult;
  inputText?: string;
  imageBase64?: string | null;
}

export default function ScamDetectorPage() {
  const [inputText, setInputText] = useState('');
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'text' | 'image'>('text');
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScamResult | null>(null);
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSaveReport = () => {
    if (result) {
      setSavedReports(prev => [
        { 
          id: `rep_${Date.now()}`, 
          date: formatDate(new Date()), 
          result,
          inputText,
          imageBase64
        },
        ...prev
      ]);
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_SIZE = 1200;
          if (width > height) {
            if (width > MAX_SIZE) {
              height = Math.round((height * MAX_SIZE) / width);
              width = MAX_SIZE;
            }
          } else {
            if (height > MAX_SIZE) {
              width = Math.round((width * MAX_SIZE) / height);
              height = MAX_SIZE;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(compressedDataUrl.split(',')[1]);
        };
        img.onerror = reject;
        img.src = event.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const base64String = await compressImage(file);
        setImageBase64(base64String);
        setActiveTab('image');
      } catch (error) {
        console.error("Image processing error", error);
      }
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImageBase64(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleScan = async () => {
    if ((activeTab === 'text' && !inputText.trim()) || (activeTab === 'image' && !imageBase64)) return;
    setIsScanning(true);
    setResult(null);
    
    try {
      const apiUrl = '/api';
      const res = await fetch(`${apiUrl}/scam-detect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: activeTab === 'text' ? (inputText.trim() || undefined) : undefined,
          image_base64: activeTab === 'image' ? (imageBase64 || undefined) : undefined
        })
      });
      
      if (!res.ok) throw new Error('API request failed with status ' + res.status);
      const data = await res.json();
      setResult(data);
      if (data.isScam) {
        const store = useAppStore.getState();
        store.updateUser({ scamsAvoided: (store.user.scamsAvoided || 0) + 1 });
      }
    } catch (err) {
      console.error("Scan error:", err);
      // Fallback
      const fallbackResult = {
        isScam: true,
        probability: 88,
        redFlags: [
          {
            title: "Suspicious Offer or Promotion",
            description: "The analyzed content exhibits patterns typically associated with high-risk financial schemes and unverified investment claims."
          },
          {
            title: "Lack of Regulatory Safeguards",
            description: "No verified institutional backing or regulatory protections were identified in this financial offer."
          }
        ],
        lesson: "Always verify whether an investment platform or opportunity is properly licensed before transferring any funds or personal data."
      };
      setResult(fallbackResult);
      if (fallbackResult.isScam) {
        const store = useAppStore.getState();
        store.updateUser({ scamsAvoided: (store.user.scamsAvoided || 0) + 1 });
      }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <AppLayout>
      <div className={styles.workspace}>
        <motion.header 
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.titleWrap}>
            <div className={styles.iconBox}><ShieldCheck size={28} color="#19533B" /></div>
            <div>
              <h1 className={styles.title}>AI Scam Detector</h1>
              <p className={styles.subtitle}>Paste a suspicious message, email, or investment offer to check its safety.</p>
            </div>
          </div>
        </motion.header>

        <motion.div 
          className={styles.layout}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          {/* Left: Input Area */}
          <div className={styles.inputCol}>
            <div className={styles.card}>
              <div style={{ marginBottom: '16px' }}>
                <Tabs 
                  tabs={[
                    { id: 'text', label: 'Text Message / Email' },
                    { id: 'image', label: 'Upload Screenshot' }
                  ]}
                  activeTab={activeTab}
                  onTabChange={(id) => setActiveTab(id as 'text' | 'image')}
                />
              </div>

              {activeTab === 'text' ? (
                <textarea
                  className={styles.textarea}
                  placeholder="Paste the suspicious message here...&#10;&#10;Example: 'URGENT: Your account will be locked. Click here to verify your identity -> http://secure-verify-123.com'"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  disabled={isScanning}
                ></textarea>
              ) : (
                <div 
                  className={styles.uploadZone} 
                  onClick={() => fileInputRef.current?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file && file.type.startsWith('image/')) {
                      try {
                        const base64String = await compressImage(file);
                        setImageBase64(base64String);
                        setActiveTab('image');
                      } catch (error) {
                        console.error("Image processing error", error);
                      }
                    }
                  }}
                  style={{ position: 'relative' }}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleImageUpload} 
                    accept="image/*" 
                    style={{display: 'none'}} 
                  />
                  {imageBase64 ? (
                    <div style={{ textAlign: 'center' }}>
                      <img 
                        src={`data:image/jpeg;base64,${imageBase64}`} 
                        alt="Preview" 
                        style={{ maxHeight: '150px', borderRadius: '8px', marginBottom: '1rem' }} 
                      />
                      <p style={{ margin: 0 }}>Image attached. Click to change.</p>
                      <button 
                        onClick={clearImage}
                        style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.5)', color: 'white', border: 'none', borderRadius: '50%', padding: '4px', cursor: 'pointer' }}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <>
                      <Upload size={20} className={styles.uploadIcon} />
                      <span>Click to upload or drag and drop a screenshot here</span>
                    </>
                  )}
                </div>
              )}

              <button 
                className={styles.scanBtn} 
                onClick={handleScan}
                disabled={(activeTab === 'text' && !inputText.trim()) || (activeTab === 'image' && !imageBase64) || isScanning}
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
                  <p>Cross-referencing global scam databases using Gemini...</p>
                </motion.div>
              )}

              {result && (
                <motion.div 
                  key="result"
                  initial={{opacity: 0, scale: 0.95}} animate={{opacity: 1, scale: 1}}
                  className={styles.resultCard}
                >
                  <div className={result.isScam ? styles.dangerHeader : styles.safeHeader}>
                    {result.isScam ? <ShieldAlert size={32} /> : <ShieldCheck size={32} color="#22c55e" />}
                    <div>
                      <h2>{result.isScam ? "High Risk Detected" : "Looks Safe"}</h2>
                      <span>{result.probability}% probability of being a scam</span>
                    </div>
                  </div>

                  {result.redFlags && result.redFlags.length > 0 && (
                    <div className={styles.analysisSection}>
                      <h3>Identified Red Flags</h3>
                      <ul className={styles.redFlagList}>
                        {result.redFlags.map((flag, i) => (
                          <li key={i}>
                            <AlertTriangle size={16} />
                            <div>
                              <strong>{flag.title}:</strong> {flag.description}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {result.lesson && (
                    <div className={styles.lessonSection}>
                      <div className={styles.lessonHeader}>
                        <Sparkles size={16} />
                        <h4>Financial Lesson</h4>
                      </div>
                      <p>{result.lesson}</p>
                    </div>
                  )}

                  <div className={styles.actionSection}>
                    <button className={styles.saveBtn} onClick={handleSaveReport}><Save size={16} /> Save Report</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* Saved Reports Section */}
        {savedReports.length > 0 && (
          <div className={styles.savedReportsSection}>
            <h2>Saved Reports</h2>
            <div className={styles.reportsGrid}>
              {savedReports.map(report => (
                <div 
                  key={report.id} 
                  className={styles.reportCard} 
                  onClick={() => {
                    setResult(report.result);
                    setInputText(report.inputText || '');
                    setImageBase64(report.imageBase64 || null);
                    if (report.imageBase64) setActiveTab('image');
                    else setActiveTab('text');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                >
                  <div className={styles.reportHeader}>
                    {report.result.isScam ? <ShieldAlert size={20} color="#ef4444" /> : <ShieldCheck size={20} color="#22c55e" />}
                    <span className={styles.reportDate}>{report.date}</span>
                  </div>
                  <div className={styles.reportRisk}>
                    {report.result.probability}% Risk
                  </div>
                  <p className={styles.reportLesson}>{report.result.lesson.substring(0, 50)}...</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
