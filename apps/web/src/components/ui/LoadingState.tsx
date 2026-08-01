import React, { useState, useEffect } from 'react';
import styles from './LoadingState.module.css';

const FINANCIAL_FACTS = [
  "Did you know? The S&P 500 has historically returned about 10% annually.",
  "Rule of 72: Divide 72 by your interest rate to see how many years it takes to double your money.",
  "An emergency fund should ideally cover 3-6 months of essential living expenses.",
  "Diversification helps reduce risk by spreading investments across different asset classes.",
  "Paying yourself first means saving a portion of your income before spending anything else."
];

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message }: LoadingStateProps) {
  const [factIndex, setFactIndex] = useState(0);

  useEffect(() => {
    // Rotate fact every 4 seconds
    const interval = setInterval(() => {
      setFactIndex((current) => (current + 1) % FINANCIAL_FACTS.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.loader}>
        <div className={styles.loaderBar}></div>
      </div>
      <h3 className={styles.title}>{message || "Loading..."}</h3>
      <div className={styles.factContainer}>
        <p key={factIndex} className={styles.fact}>
          {FINANCIAL_FACTS[factIndex]}
        </p>
      </div>
    </div>
  );
}
