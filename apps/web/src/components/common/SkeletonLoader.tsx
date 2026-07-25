import React from 'react';
import styles from './Common.module.css';

interface SkeletonProps {
  type?: 'card' | 'list' | 'chart' | 'table';
  count?: number;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({ type = 'card', count = 1 }) => {
  const items = Array.from({ length: count });

  if (type === 'list') {
    return (
      <div className={styles.skeletonList}>
        {items.map((_, i) => (
          <div key={i} className={styles.skeletonListItem}>
            <div className={`${styles.shimmer} ${styles.skeletonAvatar}`} />
            <div className={styles.skeletonTextCol}>
              <div className={`${styles.shimmer} ${styles.skeletonText}`} style={{ width: '60%' }} />
              <div className={`${styles.shimmer} ${styles.skeletonText}`} style={{ width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return (
      <div className={styles.skeletonChart}>
        <div className={`${styles.shimmer} ${styles.skeletonChartHeader}`} />
        <div className={`${styles.shimmer} ${styles.skeletonChartBody}`} />
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className={styles.skeletonTable}>
        <div className={`${styles.shimmer} ${styles.skeletonTableHeader}`} />
        {items.map((_, i) => (
          <div key={i} className={`${styles.shimmer} ${styles.skeletonTableRow}`} />
        ))}
      </div>
    );
  }

  return (
    <div className={styles.skeletonGrid}>
      {items.map((_, i) => (
        <div key={i} className={`${styles.shimmer} ${styles.skeletonCard}`} />
      ))}
    </div>
  );
};
