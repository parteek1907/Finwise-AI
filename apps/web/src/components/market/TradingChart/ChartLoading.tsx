import React from 'react';
import styles from './TradingChart.module.css';

export const ChartLoading: React.FC = () => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.shimmerHeader} />
      <div className={styles.shimmerBody} />
      <div className={styles.shimmerVolume} />
    </div>
  );
};
