import React from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  title?: string;
  message?: string;
}

const DEFAULT_FACTS = [
  "Every financial expert once started exactly where you are.",
  "Compound interest works best when given time to grow.",
  "Tracking your expenses is the first step to financial freedom.",
  "The best time to start investing was yesterday. The second best time is today."
];

export function EmptyState({ 
  title = "Nothing to see here yet", 
  message 
}: EmptyStateProps) {
  // Use a stable random fact based on today's date so it doesn't flicker on re-render unnecessarily,
  // or just pick a random one on mount.
  const [fact, setFact] = React.useState(DEFAULT_FACTS[0]);

  React.useEffect(() => {
    setFact(DEFAULT_FACTS[Math.floor(Math.random() * DEFAULT_FACTS.length)]);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.iconContainer}>
        {/* Simple geometric icon */}
        <div className={styles.circle}></div>
        <div className={styles.square}></div>
      </div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>
        {message || fact}
      </p>
    </div>
  );
}
