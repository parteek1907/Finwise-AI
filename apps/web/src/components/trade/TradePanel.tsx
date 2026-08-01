import React, { useState } from 'react';
import { BookOpen, CheckCircle, Loader2, Lightbulb } from 'lucide-react';
import { Quote } from '../../types/market';
import { useTradeExecution } from '../../hooks/usePortfolio';
import { formatCurrency } from '../../utils/formatters';
import styles from './Trade.module.css';

import { EmotionCheckModal } from './EmotionCheckModal';
import { useRouter } from 'next/navigation';

interface TradePanelProps {
  quote: Quote | null;
  buyingPower: number;
}

export const TradePanel: React.FC<TradePanelProps> = ({ quote, buyingPower }) => {
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [quantity, setQuantity] = useState<number>(1);
  const [showEmotionCheck, setShowEmotionCheck] = useState(false);
  const [success, setSuccess] = useState(false);
  const [lastTradeData, setLastTradeData] = useState<any>(null);
  const router = useRouter();
  
  const { submitOrder, isSubmitting, error } = useTradeExecution();

  if (!quote) return null;

  const total = quantity * quote.price;

  const handleInitiateSubmit = () => {
    if (quantity <= 0) return;
    setShowEmotionCheck(true);
  };

  const handleFinalSubmit = async (emotionData: any) => {
    setShowEmotionCheck(false);
    
    try {
      await submitOrder({
        id: `ord_${Date.now()}`,
        symbol: quote.symbol,
        side,
        type: 'MARKET',
        quantity,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        ...emotionData
      }, quote.price, quote.name);
      
      setLastTradeData(emotionData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setLastTradeData(null);
      }, 7000);
      setQuantity(1);
    } catch (err) {
      // Error is handled by hook and displayed below
    }
  };

  const handleDiscussWithAI = (contextMsg: string) => {
    // Navigate to mentor page with context in sessionStorage (or URL)
    sessionStorage.setItem('mentor_hidden_context', contextMsg);
    router.push('/mentor?action=discuss_trade');
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

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.actionButtons}>
        {!success ? (
          <button 
            className={styles.submitOrderBtn}
            onClick={handleInitiateSubmit}
            disabled={isSubmitting || quantity <= 0}
          >
            {isSubmitting ? (
              <><Loader2 size={16} className={styles.spinner} /> Processing...</>
            ) : (
              `Submit ${side} Order`
            )}
          </button>
        ) : (
          <div className={styles.tradeSuccessSummary}>
            <div className={styles.successHeader}>
              <CheckCircle size={24} className={styles.successIcon} />
              <h4>Trade Complete</h4>
            </div>
            
            {lastTradeData && (
              <div className={styles.summaryGrid}>
                <div className={styles.summaryItem}>
                  <span>Emotion State</span>
                  <strong>{lastTradeData.emotion}</strong>
                </div>
                <div className={styles.summaryItem}>
                  <span>Possible Bias</span>
                  <strong className={lastTradeData.biases?.length ? styles.warnText : styles.safeText}>
                    {lastTradeData.biases?.length > 0 ? lastTradeData.biases[0] : 'None'}
                  </strong>
                </div>
              </div>
            )}
            
            <p className={styles.reviewNote}>
              Reflection saved successfully. We'll remind you to review this decision in 7 days.
            </p>
          </div>
        )}
      </div>

      {showEmotionCheck && (
        <EmotionCheckModal 
          quote={quote}
          side={side}
          quantity={quantity}
          totalValue={total}
          onClose={() => setShowEmotionCheck(false)}
          onSubmit={handleFinalSubmit}
          onDiscussWithAI={handleDiscussWithAI}
        />
      )}
    </div>
  );
};
