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
  const { submitOrder, isSubmitting, error } = useTradeExecution();
  
  const preferredCurrency = useSettingsStore(state => state.financial?.preferredCurrency) || 'USD';


  const handleSell = async () => {
    if (quantity <= 0 || quantity > holding.shares) return;
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
              className={styles.sellBtn}
              onClick={handleSell}
              disabled={isSubmitting || quantity <= 0}
            >
              {isSubmitting ? <Loader2 className={styles.spinner} size={18} /> : `Confirm Sell`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
