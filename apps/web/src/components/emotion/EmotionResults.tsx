import React from 'react';
import { EmotionHistory } from '../../types/emotion';
import styles from './EmotionComponents.module.css';
import { motion } from 'framer-motion';
import { ShieldAlert, AlertTriangle, Info, CheckCircle2, RefreshCcw, MessageSquare, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '../../store/useAppStore';

interface EmotionResultsProps {
  analysis: EmotionHistory;
  onClear: () => void;
}

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'Low': return '#10b981';
    case 'Medium': return '#f59e0b';
    case 'High': return '#f97316';
    case 'Very High': return '#ef4444';
    default: return '#6b7280';
  }
};

const getRiskPercentage = (risk: string) => {
  switch (risk) {
    case 'Low': return 25;
    case 'Medium': return 50;
    case 'High': return 75;
    case 'Very High': return 100;
    default: return 0;
  }
};

export const EmotionResults: React.FC<EmotionResultsProps> = ({ analysis, onClear }) => {
  const router = useRouter();
  const createNewChat = useAppStore(state => state.createNewChat);
  const addMessage = useAppStore(state => state.addMessage);

  const handleDiscussWithMentor = () => {
    const contextStr = `I just analyzed this investment thought: "${analysis.query}". 
The AI detected a primary emotion of ${analysis.emotion} with a ${analysis.risk} risk level. 
It identified biases like ${analysis.biases.join(', ')}. 
Can you give me further advice on this?`;

    sessionStorage.setItem('mentorDraft', contextStr);
    router.push('/mentor');
  };
  const riskColor = getRiskColor(analysis.risk);
  const riskPercent = getRiskPercentage(analysis.risk);
  const circleCircumference = 2 * Math.PI * 36; // r=36
  const strokeDashoffset = circleCircumference - (analysis.confidence / 100) * circleCircumference;

  return (
    <motion.div 
      className={styles.resultsCard}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ staggerChildren: 0.1 }}
    >
      <div className={styles.resultsHeader}>
        <h3>Analysis Complete</h3>
      </div>

      <div className={styles.metricsGrid}>
        <motion.div className={styles.metricCard} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className={styles.metricTitle}>Primary Emotion</div>
          <div className={styles.emotionHighlight}>{analysis.emotion}</div>
        </motion.div>

        {analysis.risk !== 'None' && (
          <>
            <motion.div className={styles.metricCard} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className={styles.metricTitle}>Confidence</div>
              <div className={styles.confidenceRingWrapper}>
                <svg className={styles.confidenceRing} viewBox="0 0 80 80">
                  <circle className={styles.ringBg} cx="40" cy="40" r="36" />
                  <motion.circle 
                    className={styles.ringFill} 
                    cx="40" cy="40" r="36"
                    initial={{ strokeDashoffset: circleCircumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    style={{ strokeDasharray: circleCircumference }}
                  />
                </svg>
                <div className={styles.confidenceValue}>{analysis.confidence}%</div>
              </div>
            </motion.div>

            <motion.div className={`${styles.metricCard} ${styles.riskMetric}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className={styles.metricTitle}>Risk Level</div>
              <div className={styles.riskHeader}>
                <span style={{ color: riskColor, fontWeight: 700 }}>{analysis.risk}</span>
              </div>
              <div className={styles.riskMeterBg}>
                <motion.div 
                  className={styles.riskMeterFill}
                  style={{ backgroundColor: riskColor }}
                  initial={{ width: 0 }}
                  animate={{ width: `${riskPercent}%` }}
                  transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                />
              </div>
            </motion.div>
          </>
        )}
      </div>

      {analysis.risk !== 'None' && (
        <motion.div className={styles.section} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className={styles.sectionHeader}>
            <AlertTriangle size={18} className={styles.sectionIcon} />
            <h4>Detected Biases</h4>
          </div>
          <div className={styles.tags}>
            {analysis.biases.map((bias, i) => (
              <span key={i} className={styles.tag}>{bias}</span>
            ))}
          </div>
        </motion.div>
      )}

      <motion.div className={styles.section} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className={styles.sectionHeader}>
          <Info size={18} className={styles.sectionIcon} />
          <h4>AI Explanation</h4>
        </div>
        <p className={styles.explanationText}>{analysis.summary}</p>
      </motion.div>

      {analysis.risk !== 'None' && (
        <motion.div className={styles.section} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className={styles.sectionHeader}>
            <ShieldAlert size={18} className={styles.sectionIcon} style={{ color: '#10b981' }}/>
            <h4>Recommendations</h4>
          </div>
          <ul className={styles.recList}>
            {analysis.recommendations.map((rec, i) => (
              <li key={i}>
                <CheckCircle2 size={16} className={styles.checkIcon} />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      {/* AI Mentor CTA */}
      <motion.div className={styles.mentorCtaContainer} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <div className={styles.mentorCtaContent}>
          <MessageSquare size={20} className={styles.mentorCtaIcon} />
          <div>
            <h4 className={styles.mentorCtaTitle}>Have questions or doubts?</h4>
            <p className={styles.mentorCtaDesc}>Discuss this analysis deeply with your AI Financial Mentor to formulate a safe plan.</p>
          </div>
        </div>
        <button className={styles.mentorCtaBtn} onClick={handleDiscussWithMentor}>
          Discuss with AI Mentor <ArrowRight size={16} />
        </button>
      </motion.div>

    </motion.div>
  );
};
