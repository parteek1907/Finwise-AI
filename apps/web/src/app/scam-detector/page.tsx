"use client";

import React, { useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ShieldCheck, Upload, Search, AlertTriangle, ShieldAlert, CheckCircle2, Save, Sparkles, X } from 'lucide-react';
import styles from './Scam.module.css';
import { motion, AnimatePresence } from 'framer-motion';

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
          date: new Date().toLocaleDateString(), 
          result,
          inputText,
          imageBase64
        },
        ...prev
      ]);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setImageBase64(base64String);
        setActiveTab('image');
      };
      reader.readAsDataURL(file);
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
    if (!inputText.trim() && !imageBase64) return;
    setIsScanning(true);
    setResult(null);
    
    try {
      const res = await fetch('http://localhost:8000/api/scam-detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText.trim() || undefined,
          image_base64: imageBase64 || undefined
        })
      });
      
      if (!res.ok) throw new Error('API request failed');
      const data = await res.json();
      setResult(data);
    } catch (err) {
      console.error(err);
      // Fallback
      setResult({
        isScam: true,
        probability: 99,
        redFlags: [{title: "Error", description: "Failed to connect to AI engine."}],
        lesson: "Always ensure your connection is secure."
      });
    } finally {
      setIsScanning(false);
    }
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
                <button 
                  className={activeTab === 'text' ? styles.activeTab : ''}
                  onClick={() => setActiveTab('text')}
                >Text Message / Email</button>
                <button 
                  className={activeTab === 'image' ? styles.activeTab : ''}
                  onClick={() => setActiveTab('image')}
                >Upload Screenshot</button>
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
                disabled={(!inputText.trim() && !imageBase64) || isScanning}
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
                  <p>Cross-referencing global scam databases using Groq Vision...</p>
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
        </div>

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
