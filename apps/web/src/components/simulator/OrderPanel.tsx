"use client";

import { useState } from "react";
import { BehavioralCheckModal } from "./BehavioralCheckModal";

type Props = {
  currentPrice: number;
  onTradeComplete: (action: "Buy" | "Sell", amount: number, emotion: string) => void;
};

export function OrderPanel({ currentPrice, onTradeComplete }: Props) {
  const [amount, setAmount] = useState<number>(1000);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<"Buy" | "Sell" | null>(null);

  const handleTradeClick = (action: "Buy" | "Sell") => {
    setPendingAction(action);
    setIsModalOpen(true);
  };

  const handleConfirmEmotion = (emotion: string) => {
    if (pendingAction) {
      onTradeComplete(pendingAction, amount, emotion);
    }
    setIsModalOpen(false);
    setPendingAction(null);
  };

  return (
    <div className="w-full bg-surface-elevated border border-border rounded-3xl p-6 flex flex-col h-full">
      <h3 className="text-lg font-heading font-medium text-foreground mb-6">Order Entry</h3>
      
      <div className="flex-1 flex flex-col justify-center space-y-8">
        
        {/* Amount Slider */}
        <div className="space-y-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted">Amount (USD)</span>
            <span className="text-foreground font-mono">${amount.toLocaleString()}</span>
          </div>
          <input 
            type="range" 
            min="100" 
            max="10000" 
            step="100" 
            value={amount} 
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full h-2 bg-surface rounded-full appearance-none cursor-pointer accent-gold"
          />
          <div className="flex justify-between text-xs text-muted font-mono">
            <span>$100</span>
            <span>$10,000</span>
          </div>
        </div>

        {/* Estimated Shares */}
        <div className="bg-surface p-4 rounded-xl border border-white/5 flex justify-between items-center">
          <span className="text-sm text-secondary">Est. Shares</span>
          <span className="text-foreground font-mono">{(amount / currentPrice).toFixed(4)}</span>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <button 
            onClick={() => handleTradeClick("Sell")}
            className="w-full py-4 rounded-xl bg-danger/10 text-danger font-medium hover:bg-danger/20 transition-colors border border-danger/20"
          >
            Sell
          </button>
          <button 
            onClick={() => handleTradeClick("Buy")}
            className="w-full py-4 rounded-xl bg-success/10 text-success font-medium hover:bg-success/20 transition-colors border border-success/20"
          >
            Buy
          </button>
        </div>
      </div>

      <BehavioralCheckModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onConfirm={handleConfirmEmotion}
        tradeAction={pendingAction || "Buy"}
      />
    </div>
  );
}
