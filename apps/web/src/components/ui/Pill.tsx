import React from 'react';
import styles from './Pill.module.css';

interface PillProps {
  icon?: React.ReactNode;
  label: string;
}

export function Pill({ icon, label }: PillProps) {
  return (
    <div className={styles.pill}>
      {icon && <span className={styles.icon}>{icon}</span>}
      <span className={styles.label}>{label}</span>
    </div>
  );
}
