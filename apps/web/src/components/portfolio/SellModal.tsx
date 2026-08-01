import React, { useState } from 'react';
import { PortfolioHolding } from '../../types/portfolio';
import { useTradeExecution } from '../../hooks/usePortfolio';
import { formatCurrency } from '../../utils/formatters';
import { useSettingsStore } from '@/store/useSettingsStore';
import NumberFlow from '@/components/ui/ClientNumberFlow';
import { X, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import styles from './SellModal.module.css';

interface SellModalProps {
  holding: PortfolioHolding;
  onClose: () => void;
  onSuccess: () => void;
}

export const SellModal: React.FC<SellModalProps> = ({ holding, onClose, onSuccess }) => {
  const [quantity, setQuantity] = useState<number>(holding.shares);
  const [success, setSuccess] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [warningAcknowledged, setWarningAcknowledged] = useState(false);
  const { submitOrder, isSubmitting, error } = useTradeExecution();
  
  const preferredCurrency = useSettingsStore(state => state.financial?.preferredCurrency) || 'USD';


  const handleInitiateSell = () => {
    if (quantity <= 0 || quantity > holding.shares) return;
    
    // Check if selling early
    if (!warningAcknowledged && holding.intendedHorizon && ['Years', 'Months'].includes(holding.intendedHorizon)) {
      // In a real app we'd compare holding.createdAt with Date.now()
      // For now, if they said Years/Months and are selling, we warn them.
      setShowWarning(true);
      return;
    }
    
    executeSell();
  };

  const executeSell = async () => {
    try {
      await submitOrder({
        id: `ord_${Date.now()}`,
        symbol: holding.symbol,
        side: 'SELL',
        type: 'MARKET',
        quantity,
        status: 'PENDING',
        createdAt: new Date().toISOString()
      }, holding.currentPrice, holding.name);
      
      setSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (e) {
      // Error handled by hook
    }
  };

  const estimatedValue = quantity * holding.currentPrice;
  const estimatedProfit = (holding.currentPrice - holding.averagePrice) * quantity;
  const isProfit = estimatedProfit >= 0;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h3>Sell {holding.symbol}</h3>
          <button onClick={onClose} className={styles.closeBtn}><X size={20} /></button>
        </div>

        {success ? (
          <div className={styles.successState}>
            <CheckCircle size={48} color="#16a34a" />
            <h4>Order Filled Successfully</h4>
            <p>Sold {quantity} shares of {holding.symbol}</p>
          </div>
        ) : showWarning ? (
          <div className={styles.warningState}>
            <AlertTriangle size={48} color="#f59e0b" className={styles.warnIconLarge} />
            <h4>Early Sell Warning</h4>
            <p>You originally planned to hold this investment for <strong>{holding.intendedHorizon}</strong>.</p>
            <p>Are you sure you want to sell early?</p>
            
            {holding.reflection && (
              <div className={styles.thesisReview}>
                <h5>Your Original Thesis:</h5>
                <p>"{holding.reflection.whyBuying}"</p>
                <h5>Your Sell Criteria:</h5>
                <p>"{holding.reflection.sellCriteria}"</p>
              </div>
            )}
            
            <div className={styles.warningActions}>
              <button 
                className={styles.cancelBtn} 
                onClick={() => { setShowWarning(false); onClose(); }}
              >
                Keep Holding
              </button>
              <button 
                className={styles.continueBtn} 
                onClick={() => {
                  setWarningAcknowledged(true);
                  setShowWarning(false);
                  executeSell();
                }}
              >
                Continue Selling
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.content}>
            <div className={styles.holdingInfo}>
              <div className={styles.infoCol}>
                <span className={styles.label}>Owned</span>
                <span className={styles.value}>{holding.shares} Shares</span>
              </div>
              <div className={styles.infoCol}>
                <span className={styles.label}>Avg Price</span>
                <span className={styles.value}>{formatCurrency(holding.averagePrice)}</span>
              </div>
              <div className={styles.infoCol}>
                <span className={styles.label}>Current Price</span>
                <span className={styles.value}>{formatCurrency(holding.currentPrice)}</span>
              </div>
            </div>

            <div className={styles.sliderSection}>
              <div className={styles.sliderHeader}>
                <label>Quantity to Sell</label>
                <div className={styles.quickSelect}>
                  <button onClick={() => setQuantity(Math.max(1, Math.floor(holding.shares / 2)))}>Half</button>
                  <button onClick={() => setQuantity(holding.shares)}>Sell All</button>
                </div>
              </div>
              <input 
                type="range" 
                min="1" 
                max={holding.shares} 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))}
                className={styles.slider}
              />
              <div className={styles.quantityInputWrap}>
                <input 
                  type="number" 
                  min="1" 
                  max={holding.shares}
                  value={quantity}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    if (val <= holding.shares) setQuantity(val);
                  }}
                  className={styles.quantityInput}
                />
                <span>Shares</span>
              </div>
            </div>

            <div className={styles.summaryBox}>
              <div className={styles.summaryRow}>
                <span>Estimated Credit</span>
                <strong>
                  <NumberFlow value={estimatedValue} format={{ style: 'currency', currency: preferredCurrency }} />
                </strong>
              </div>
              <div className={styles.summaryRow}>
                <span>Estimated {isProfit ? 'Profit' : 'Loss'}</span>
                <strong className={isProfit ? styles.profit : styles.loss}>
                  {isProfit ? '+' : ''}
                  <NumberFlow value={estimatedProfit} format={{ style: 'currency', currency: preferredCurrency }} />
                </strong>
              </div>
            </div>

            {error && <div className={styles.error}><AlertTriangle size={16} /> {error}</div>}

            <button 
              className={styles.confirmBtn}
              onClick={handleInitiateSell}
              disabled={isSubmitting || quantity <= 0}
            >
              {isSubmitting ? <><Loader2 size={16} className={styles.spinner} /> Processing...</> : 'Confirm Sale'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
