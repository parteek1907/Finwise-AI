import React, { useState } from 'react';
import { Sparkles, ArrowRight, RefreshCw, Brain } from 'lucide-react';
import styles from './EmotionComponents.module.css';
import { motion, AnimatePresence } from 'framer-motion';

interface EmotionInputProps {
  onAnalyze: (query: string) => void;
  loading: boolean;
}

const PROMPT_POOLS = [
  { category: 'FOMO', text: 'Bitcoin has doubled in 2 weeks. Should I buy in now before it goes higher?', tag: 'FOMO' },
  { category: 'Herd Mentality', text: 'Everyone at work is buying tech stocks and getting rich. Am I missing out?', tag: 'Herd Mentality' },
  { category: 'Panic Selling', text: 'My portfolio dropped 12% today during market dip. Should I sell everything?', tag: 'Panic' },
  { category: 'Overconfidence', text: 'I made 50% returns last month. Should I double my position with margin leverage?', tag: 'Overconfidence' },
  { category: 'Loss Aversion', text: 'My stock is down 30%, but I refuse to sell until I break even.', tag: 'Loss Aversion' },
  { category: 'Revenge Trading', text: 'I just lost $1,000 on options. Should I make a quick trade to win it back?', tag: 'Revenge Trading' },
  { category: 'Greed', text: 'A meme coin is trending on social media. Should I invest my savings in it?', tag: 'Greed' },
  { category: 'Fear', text: 'The stock market is at an all-time high. Should I keep all my money in 100% cash?', tag: 'Fear' },
  { category: 'Confirmation Bias', text: 'I only read bullish articles about this stock because bad news is just noise, right?', tag: 'Bias' },
];

export const EmotionInput: React.FC<EmotionInputProps> = ({ onAnalyze, loading }) => {
  const [query, setQuery] = useState('');
  const [currentSuggestions, setCurrentSuggestions] = useState(() => {
    return [...PROMPT_POOLS].sort(() => 0.5 - Math.random()).slice(0, 3);
  });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefreshSuggestions = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      const shuffled = [...PROMPT_POOLS].sort(() => 0.5 - Math.random()).slice(0, 3);
      setCurrentSuggestions(shuffled);
      setIsRefreshing(false);
    }, 250);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onAnalyze(query);
    }
  };

  return (
    <div className={styles.inputContainer}>
      {/* Combined Clean Section Header */}
      <div className={styles.inputHeader}>
        <div className={styles.brainIconBox}>
          <Brain size={24} color="#19533B" />
        </div>
        <div>
          <h2 className={styles.sectionTitle}>Understand Your Investing Psychology</h2>
          <p className={styles.inputDesc}>
            Paste a thought, market rumor, or financial impulse to detect emotional bias and receive rational AI coaching.
          </p>
        </div>
      </div>

      {/* Interactive Question Suggestions Header */}
      <div className={styles.suggestionsHeader}>
        <span className={styles.suggestionsTitle}>
          <Sparkles size={14} color="#19533B" /> Question Suggestions
        </span>
        <button 
          type="button"
          className={styles.refreshBtn} 
          onClick={handleRefreshSuggestions}
          disabled={loading || isRefreshing}
          title="Get new suggestions"
        >
          <RefreshCw size={13} className={isRefreshing ? styles.spinning : ''} />
          New Suggestions
        </button>
      </div>

      {/* Clickable Suggestion Cards with Hover Shadows */}
      <div className={styles.examplesGrid}>
        <AnimatePresence mode="wait">
          {currentSuggestions.map((item, idx) => (
            <motion.button
              key={`${item.tag}-${idx}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, delay: idx * 0.05 }}
              className={styles.suggestionCard}
              onClick={() => setQuery(item.text)}
              disabled={loading}
            >
              <div className={styles.suggestionTop}>
                <span className={styles.categoryTag}>{item.tag}</span>
              </div>
              <p className={styles.promptText}>"{item.text}"</p>
            </motion.button>
          ))}
        </AnimatePresence>
      </div>

      {/* Textarea Form & Bottom-Right Active High-Contrast CTA Button */}
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.textareaWrapper}>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Describe your investment thought (e.g. Everyone is buying NVIDIA, should I jump in now?)..."
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
          
          <div className={styles.formFooter}>
            <button 
              type="submit" 
              className={styles.analyzeBtn}
              disabled={!query.trim() || loading}
            >
              {loading ? 'Analyzing...' : 'Analyze Emotion'}
              {!loading && <ArrowRight size={18} />}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
