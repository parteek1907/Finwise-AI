import React from 'react';
import { AlertCircle } from 'lucide-react';
import styles from './Common.module.css';

interface ErrorCardProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorCard: React.FC<ErrorCardProps> = ({ title = 'Something went wrong', message, onRetry }) => {
  return (
    <div className={styles.errorCard}>
      <div className={styles.errorIcon}>
        <AlertCircle size={24} />
      </div>
      <div className={styles.errorContent}>
        <h4 className={styles.errorTitle}>{title}</h4>
        <p className={styles.errorMessage}>{message}</p>
        {onRetry && (
          <button className={styles.retryBtn} onClick={onRetry}>
            Retry
          </button>
        )}
      </div>
    </div>
  );
};
