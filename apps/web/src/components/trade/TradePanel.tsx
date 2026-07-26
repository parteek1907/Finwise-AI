import React, { useState } from 'react';
import { BookOpen, CheckCircle, Loader2, Lightbulb } from 'lucide-react';
import { Quote } from '../../types/market';
import { useTradeExecution } from '../../hooks/usePortfolio';
import { formatCurrency } from '../../utils/formatters';
import styles from './Trade.module.css';

interface TradePanelProps {
  quote: Quote | null;
  buyingPower: number;
}

export const TradePanel: React.FC<TradePanelProps> = ({ quote, buyingPower }) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(1);
  const [reflection, setReflection] = useState('');
  const [success, setSuccess] = useState(false);
  const [showMentor, setShowMentor] = useState(false);
  
  const { submitOrder, isSubmitting, error } = useTradeExecution();

  if (!quote) return null;

  const total = quantity * quote.price;

  const handleSubmit = async () => {
    if (quantity <= 0) return;
    
    try {
      await submitOrder({
        id: `ord_${Date.now()}`,
        symbol: quote.symbol,
        side,
        type: 'MARKET',
        quantity,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }, quote.price, quote.name);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setQuantity(1);
      setReflection('');
    } catch (err) {
      // Error is handled by hook and displayed below
    }
  };

  return (
    <div className={styles.orderEntry}>
      <div className={styles.orderType}>
        <button 
          className={side === 'BUY' ? styles.activeBuy : ''}
          onClick={() => setSide('BUY')}
        >
          Buy
        </button>
        <button 
          className={side === 'SELL' ? styles.activeSell : ''}
          onClick={() => setSide('SELL')}
        >
          Sell
        </button>
      </div>
      
      <div className={styles.orderInputs}>
        <div className={styles.inputGroup}>
          <label>Shares</label>
          <input 
            type="number" 
            min="1"
            max="999"
            value={quantity} 
            onChange={(e) => {
              const val = Number(e.target.value);
              if (val > 999) setQuantity(999);
              else setQuantity(val);
            }}
          />
        </div>
        <div className={styles.inputGroup}>
          <label>Market Price</label>
          <input type="text" value={formatCurrency(quote.price)} readOnly />
        </div>
        <div className={styles.inputGroup}>
          <label>Estimated Total</label>
          <input type="text" value={formatCurrency(total)} readOnly className={styles.totalInput} />
        </div>
      </div>
      
      <div className={styles.buyingPower}>
        <span>Available Buying Power</span>
        <strong>{formatCurrency(buyingPower)}</strong>
      </div>

      <div className={styles.reflectionCheck}>
        <div className={styles.reflectionHeader}>
          <BookOpen size={16} />
          <h4>Trade Reflection Required</h4>
        </div>
        <textarea 
          placeholder="Why are you making this trade? What is your thesis?" 
          rows={2}
          value={reflection}
          onChange={(e) => setReflection(e.target.value)}
        />
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.actionButtons}>
        <button 
          className={styles.mentorBtn}
          onClick={() => setShowMentor(true)}
        >
          <Lightbulb size={16} />
          AI Mentor
        </button>

        <button 
          className={success ? styles.successBtn : styles.submitOrderBtn}
          onClick={handleSubmit}
          disabled={isSubmitting || quantity <= 0 || success}
        >
          {isSubmitting ? (
            <><Loader2 size={16} className={styles.spinner} /> Processing...</>
          ) : success ? (
            <><CheckCircle size={16} /> Order Filled</>
          ) : (
            `Submit ${side} Order`
          )}
        </button>
      </div>

      {showMentor && (
        <div className={styles.mentorOverlay}>
          <div className={styles.mentorModal}>
            <div className={styles.mentorHeader}>
              <div className={styles.mentorTitle}>
                <Lightbulb size={20} className={styles.mentorIcon} />
                <h3>FinWise AI Mentor</h3>
              </div>
              <button onClick={() => setShowMentor(false)} className={styles.closeBtn}>×</button>
            </div>
            <div className={styles.mentorContent}>
              <p>Based on your current action (<strong>{side} {quantity} shares of {quote.symbol}</strong>):</p>
              <ul>
                <li>Is this aligned with your long-term goals?</li>
                <li>Consider the volatility of {quote.symbol} before sizing your position.</li>
                <li>Avoid trading based on FOMO (Fear Of Missing Out).</li>
              </ul>
              <div className={styles.mentorTip}>
                <strong>Pro Tip:</strong> Ensure you are properly diversified across different sectors to mitigate risk.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
