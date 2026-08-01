import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, Brain, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import { Quote } from '../../types/market';
import { analyzeTradeEmotion, EmotionCheckResponses, EmotionAnalysisResult } from '../../services/emotionEngine';
import styles from './EmotionCheckModal.module.css';

interface EmotionCheckModalProps {
  quote: Quote;
  side: 'BUY' | 'SELL';
  quantity: number;
  totalValue: number;
  onClose: () => void;
  onSubmit: (emotionData: any) => void;
  onDiscussWithAI: (contextMsg: string) => void;
}

export const EmotionCheckModal: React.FC<EmotionCheckModalProps> = ({
  quote,
  side,
  quantity,
  totalValue,
  onClose,
  onSubmit,
  onDiscussWithAI
}) => {
  const [step, setStep] = useState(1);
  
  // Responses
  const [emotion, setEmotion] = useState('');
  const [influence, setInfluence] = useState('');
  const [horizon, setHorizon] = useState('');
  const [confidence, setConfidence] = useState(50);
  
  const [whyBuying, setWhyBuying] = useState('');
  const [biggestConcern, setBiggestConcern] = useState('');
  const [sellCriteria, setSellCriteria] = useState('');
  
  const [analysisResult, setAnalysisResult] = useState<EmotionAnalysisResult | null>(null);

  const emotions = ['Calm', 'Confident', 'Excited', 'Nervous', 'Fearful', 'Frustrated'];
  const influences = ['My own research', 'Company fundamentals', 'Technical analysis', 'AI Mentor', 'Social media', 'Friend recommendation', 'News', 'Price movement'];
  const horizons = ['Intraday', 'Swing', 'Weeks', 'Months', 'Years'];

  const handleAnalyze = () => {
    const responses: EmotionCheckResponses = {
      emotion,
      influence,
      horizon,
      confidence
    };
    
    // In a real app, we'd check recent losses here. Passing false for now.
    const result = analyzeTradeEmotion(responses, quote.changePercent, side, false);
    setAnalysisResult(result);
    setStep(4);
  };

  const handleDiscuss = () => {
    if (!analysisResult) return;
    
    const contextMsg = `[SYSTEM: HIDDEN CONTEXT]
The user is attempting to ${side} ${quantity} shares of ${quote.symbol} at $${quote.price}.
User Emotion: ${emotion}
Influence: ${influence}
Horizon: ${horizon}
Confidence: ${confidence}%
Detected Bias: ${analysisResult.detectedBiases.length > 0 ? analysisResult.detectedBiases.join(', ') : 'None'}
Reflection:
- Thesis: ${whyBuying}
- Concern: ${biggestConcern}
- Sell Criteria: ${sellCriteria}

Provide Socratic guidance. Ask probing questions about their thesis and risks. DO NOT give direct buy/sell advice.`;
    
    onDiscussWithAI(contextMsg);
  };

  const handleFinalSubmit = () => {
    onSubmit({
      emotion,
      biases: analysisResult?.detectedBiases || [],
      readinessScore: analysisResult?.readinessScore || 100,
      intendedHorizon: horizon,
      reflection: {
        whyBuying,
        biggestConcern,
        sellCriteria
      }
    });
  };

  return (
    <div className={styles.overlay}>
      <motion.div 
        className={styles.modal}
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      >
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <Brain size={20} className={styles.headerIcon} />
            <div>
              <h3>Emotional Readiness Check</h3>
              <p>Great investing starts with understanding your mindset.</p>
            </div>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className={styles.body}>
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.stepContent}
              >
                <div className={styles.questionGroup}>
                  <label>How are you feeling about this trade?</label>
                  <div className={styles.pillGrid}>
                    {emotions.map(e => (
                      <button 
                        key={e} 
                        className={emotion === e ? styles.pillActive : styles.pill}
                        onClick={() => setEmotion(e)}
                      >
                        {e}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.questionGroup}>
                  <label>What influenced this decision?</label>
                  <div className={styles.pillGrid}>
                    {influences.map(i => (
                      <button 
                        key={i} 
                        className={influence === i ? styles.pillActive : styles.pill}
                        onClick={() => setInfluence(i)}
                      >
                        {i}
                      </button>
                    ))}
                  </div>
                </div>

                <button 
                  className={styles.nextBtn} 
                  disabled={!emotion || !influence}
                  onClick={() => setStep(2)}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.stepContent}
              >
                <div className={styles.questionGroup}>
                  <label>How long do you plan to hold?</label>
                  <div className={styles.pillGrid}>
                    {horizons.map(h => (
                      <button 
                        key={h} 
                        className={horizon === h ? styles.pillActive : styles.pill}
                        onClick={() => setHorizon(h)}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.questionGroup}>
                  <label>How confident are you? ({confidence}%)</label>
                  <input 
                    type="range" 
                    min="0" max="100" 
                    value={confidence} 
                    onChange={(e) => setConfidence(parseInt(e.target.value))}
                    className={styles.slider}
                  />
                </div>

                <button 
                  className={styles.nextBtn} 
                  disabled={!horizon}
                  onClick={() => setStep(3)}
                >
                  Continue <ArrowRight size={16} />
                </button>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className={styles.stepContent}
              >
                <div className={styles.questionGroup}>
                  <label>Why are you {side.toLowerCase()}ing this?</label>
                  <textarea 
                    value={whyBuying} 
                    onChange={e => setWhyBuying(e.target.value)} 
                    placeholder="E.g., Strong earnings growth..."
                  />
                </div>

                <div className={styles.questionGroup}>
                  <label>What is your biggest concern?</label>
                  <textarea 
                    value={biggestConcern} 
                    onChange={e => setBiggestConcern(e.target.value)} 
                    placeholder="E.g., High valuation..."
                  />
                </div>
                
                <div className={styles.questionGroup}>
                  <label>What would make you {side === 'BUY' ? 'sell' : 'buy back in'}?</label>
                  <textarea 
                    value={sellCriteria} 
                    onChange={e => setSellCriteria(e.target.value)} 
                    placeholder={side === 'BUY' ? "E.g., Drops below 200MA..." : "E.g., Dips 10%..."}
                  />
                </div>

                <button 
                  className={styles.nextBtn} 
                  disabled={!whyBuying || !biggestConcern || !sellCriteria}
                  onClick={handleAnalyze}
                >
                  Analyze Readiness <Brain size={16} />
                </button>
              </motion.div>
            )}

            {step === 4 && analysisResult && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={styles.analysisContent}
              >
                <div className={styles.scoreCard}>
                  <div className={styles.scoreRing}>
                    <svg viewBox="0 0 36 36" className={styles.circularChart}>
                      <path
                        className={styles.circleBg}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className={styles.circle}
                        strokeDasharray={`${analysisResult.readinessScore}, 100`}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className={styles.scoreText}>
                      <span className={styles.scoreNumber}>{analysisResult.readinessScore}</span>
                      <span className={styles.scoreLabel}>Score</span>
                    </div>
                  </div>
                  
                  <div className={styles.analysisDetails}>
                    <div className={styles.checkItem}>
                      <CheckCircle size={16} className={styles.checkIcon} />
                      <span>Reflection completed</span>
                    </div>
                    {analysisResult.detectedBiases.map(bias => (
                      <div key={bias} className={styles.warningItem}>
                        <AlertTriangle size={16} className={styles.warnIcon} />
                        <span>Possible {bias} detected</span>
                      </div>
                    ))}
                    {analysisResult.detectedBiases.length === 0 && (
                      <div className={styles.checkItem}>
                        <CheckCircle size={16} className={styles.checkIcon} />
                        <span>No strong emotional bias detected</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.recommendationBox}>
                  <strong>Recommendation:</strong> {analysisResult.recommendation}
                </div>

                <div className={styles.actionButtons}>
                  <button className={styles.discussBtn} onClick={handleDiscuss}>
                    <MessageSquare size={16} /> Discuss with AI
                  </button>
                  <button className={styles.finalSubmitBtn} onClick={handleFinalSubmit}>
                    Confirm {side} Order
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
