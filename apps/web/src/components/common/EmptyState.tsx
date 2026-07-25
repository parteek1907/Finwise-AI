import React from 'react';
import { Search, AlertTriangle, Briefcase, FileText } from 'lucide-react';
import styles from './Common.module.css';

interface EmptyStateProps {
  type: 'search' | 'portfolio' | 'watchlist' | 'trades';
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, title, description, actionText, onAction }) => {
  const getIcon = () => {
    switch (type) {
      case 'search': return <Search size={32} />;
      case 'portfolio': return <Briefcase size={32} />;
      case 'trades': return <FileText size={32} />;
      case 'watchlist': return <AlertTriangle size={32} />;
      default: return <AlertTriangle size={32} />;
    }
  };

  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>
        {getIcon()}
      </div>
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyDescription}>{description}</p>
      {actionText && onAction && (
        <button className={styles.emptyAction} onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );
};
