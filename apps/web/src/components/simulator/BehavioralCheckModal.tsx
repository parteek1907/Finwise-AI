"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, AlertTriangle, X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (emotion: string) => void;
  tradeAction: "Buy" | "Sell";
};

export function BehavioralCheckModal({ isOpen, onClose, onConfirm, tradeAction }: Props) {
  const options = [
    { label: "Logic / Strategy", value: "logic", color: "text-success", bg: "hover:bg-success/10", border: "hover:border-success/50" },
    { label: "FOMO (Missing Out)", value: "fomo", color: "text-gold", bg: "hover:bg-gold/10", border: "hover:border-gold/50" },
    { label: "Panic / Fear", value: "panic", color: "text-danger", bg: "hover:bg-danger/10", border: "hover:border-danger/50" },
    { label: "Boredom", value: "boredom", color: "text-muted", bg: "hover:bg-white/10", border: "hover:border-white/20" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md bg-surface-elevated border border-border rounded-3xl p-8 shadow-2xl overflow-hidden"
          >
            {/* Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-info/10 blur-[80px] pointer-events-none" />

            <button onClick={onClose} className="absolute top-6 right-6 text-muted hover:text-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="p-2 rounded-xl bg-info/10 text-info">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-heading font-medium text-foreground">Behavioral Check</h2>
            </div>

            <p className="text-secondary text-sm mb-8 leading-relaxed">
              Before you {tradeAction.toLowerCase()}, pause. What emotion is primarily driving this decision right now? Be honest with yourself.
            </p>

            <div className="space-y-3">
              {options.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => onConfirm(opt.value)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl border border-border bg-surface transition-all duration-300 ${opt.bg} ${opt.border} group`}
                >
                  <span className={`font-medium text-foreground group-hover:${opt.color} transition-colors`}>{opt.label}</span>
                  {opt.value !== "logic" && <AlertTriangle className={`w-4 h-4 opacity-0 group-hover:opacity-100 ${opt.color} transition-all`} />}
                </button>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-muted uppercase tracking-wider">Your mentor is watching</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
