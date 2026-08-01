import React from 'react';
import { Trade } from '../../types/trade';
import { Brain, TrendingUp, AlertTriangle } from 'lucide-react';
import styles from './WeeklyEmotionReport.module.css';

interface WeeklyEmotionReportProps {
  trades: Trade[];
}

export const WeeklyEmotionReport: React.FC<WeeklyEmotionReportProps> = ({ trades }) => {
  // Compute analytics
  const tradesWithEmotion = trades.filter(t => t.emotion && t.readinessScore !== undefined);
  const totalAnalyzed = tradesWithEmotion.length;
  
  if (totalAnalyzed === 0) {
    return (
      <div className={styles.emptyState}>
        <Brain size={48} className={styles.emptyIcon} />
        <h4>No Emotional Data Yet</h4>
        <p>Complete your first trade to generate your behavioral analytics.</p>
      </div>
    );
  }

  const avgScore = Math.round(
    tradesWithEmotion.reduce((acc, t) => acc + (t.readinessScore || 0), 0) / totalAnalyzed
  );

  const biasCounts: Record<string, number> = {};
  let totalBiases = 0;
  tradesWithEmotion.forEach(t => {
    t.biases?.forEach(b => {
      biasCounts[b] = (biasCounts[b] || 0) + 1;
      totalBiases++;
    });
  });

  const topBiases = Object.entries(biasCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Behavioral Insights</h3>
        <p>Your recent trading psychology and emotional readiness.</p>
      </div>

      <div className={styles.grid}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <TrendingUp size={20} className={styles.iconPositive} />
            <h4>Average Readiness Score</h4>
          </div>
          <div className={styles.scoreContainer}>
            <div className={styles.scoreValue}>{avgScore}</div>
            <div className={styles.scoreScale}>/ 100</div>
          </div>
          <p className={styles.scoreSubtext}>
            {avgScore > 80 ? 'You are trading with strong emotional discipline.' : avgScore > 50 ? 'You are showing moderate emotional control.' : 'High emotional influence detected in your recent trades.'}
          </p>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <AlertTriangle size={20} className={styles.iconWarning} />
            <h4>Detected Biases</h4>
          </div>
          {topBiases.length > 0 ? (
            <ul className={styles.biasList}>
              {topBiases.map(([bias, count]) => (
                <li key={bias} className={styles.biasItem}>
                  <span>{bias}</span>
                  <span className={styles.biasCount}>{count} occurences</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className={styles.noBias}>
              Great job! No significant cognitive biases detected in your recent trades.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
