import React from 'react';
import { EmotionHistory } from '../../types/emotion';
import styles from './EmotionHistory.module.css';
import { Clock } from 'lucide-react';
import { formatDate } from '@/utils/formatters';
import { motion } from 'framer-motion';

interface EmotionHistoryListProps {
  history: EmotionHistory[];
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

export const EmotionHistoryList: React.FC<EmotionHistoryListProps> = ({ history }) => {
  if (history.length === 0) return null;

  return (
    <div className={styles.historyContainer}>
      <div className={styles.header}>
        <Clock size={18} className={styles.icon} />
        <h3>Recent Analyses</h3>
      </div>
      
      <div className={styles.list}>
        {history.map((item, index) => (
          <motion.div 
            key={item.id} 
            className={styles.historyCard}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className={styles.cardHeader}>
              <span className={styles.emotionBadge}>{item.emotion}</span>
              <span className={styles.date}>
                {formatDate(item.timestamp)} {new Date(item.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <p className={styles.query}>"{item.query.length > 80 ? item.query.substring(0, 80) + '...' : item.query}"</p>
            
            <div className={styles.footerMetrics}>
              <span className={styles.metric}>
                <span className={styles.metricLabel}>Confidence</span>
                <span className={styles.metricValue}>{item.confidence}%</span>
              </span>
              <span className={styles.metric}>
                <span className={styles.metricLabel}>Risk</span>
                <span className={styles.metricValue} style={{ color: getRiskColor(item.risk) }}>{item.risk}</span>
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
