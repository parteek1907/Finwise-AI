import React, { useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import styles from './EmotionComponents.module.css';
import { motion } from 'framer-motion';

interface EmotionInputProps {
  onAnalyze: (query: string) => void;
  loading: boolean;
}

const EXAMPLES = [
  "Bitcoin has doubled. Should I buy?",
  "Everyone is buying NVIDIA.",
  "I want to sell everything."
];

export const EmotionInput: React.FC<EmotionInputProps> = ({ onAnalyze, loading }) => {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onAnalyze(query);
    }
  };

  return (
    <div className={styles.inputContainer}>
      <div className={styles.inputHeader}>
        <Sparkles size={20} className={styles.iconAccent} />
        <h2>Understand your investing psychology</h2>
      </div>
      
      <p className={styles.inputDesc}>
        Paste a thought, news headline, or investment idea to receive an AI-powered behavioral analysis before making a financial decision.
      </p>

      <div className={styles.examples}>
        {EXAMPLES.map((example, idx) => (
          <button
            key={idx}
            className={styles.exampleBtn}
            onClick={() => setQuery(example)}
            disabled={loading}
          >
            {example}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.textareaWrapper}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your investment thought..."
            className={styles.textarea}
            rows={4}
            disabled={loading}
          />
          {loading && (
            <div className={styles.loadingOverlay}>
              <motion.div 
                className={styles.shimmer}
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
              <div className={styles.loadingContent}>
                <div className={styles.pulsingDot} />
                <span>Analyzing behavioral signals...</span>
              </div>
            </div>
          )}
        </div>
        
        <button 
          type="submit" 
          className={styles.analyzeBtn}
          disabled={!query.trim() || loading}
        >
          {loading ? 'Analyzing...' : 'Analyze Emotion'}
          {!loading && <ArrowRight size={18} />}
        </button>
      </form>
    </div>
  );
};
