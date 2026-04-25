"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldAlert, TrendingDown, TrendingUp, HelpCircle } from "lucide-react";

export function InteractiveDemo() {
  const [selected, setSelected] = useState<number | null>(null);

  const scenarios = [
    {
      id: 1,
      text: "The market just dropped 5%. I should sell everything before I lose more.",
      emotion: "Fear",
      icon: TrendingDown,
      color: "text-danger",
      advice: "Selling during a dip turns temporary paper losses into permanent realized losses. Breathe, and review your long-term goals."
    },
    {
      id: 2,
      text: "My friend doubled his money on this new coin. I'm putting my savings in.",
      emotion: "FOMO",
      icon: TrendingUp,
      color: "text-gold",
      advice: "Never invest out of fear of missing out. If it sounds too good to be true, it usually is. Understand the asset first."
    },
    {
      id: 3,
      text: "Someone on WhatsApp said they guarantee 20% monthly returns.",
      emotion: "Scam Risk",
      icon: ShieldAlert,
      color: "text-danger",
      advice: "Guaranteed high returns are the #1 red flag for financial fraud. Block the number and do not share personal details."
    }
  ];

  return (
    <section className="py-24 md:py-32 bg-background relative border-y border-white/5">
      <div className="max-w-5xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-heading font-medium text-foreground">
            Try the Emotion Detector
          </h2>
          <p className="mt-4 text-secondary text-lg">
            See how Finwise AI helps you pause and reflect before making a costly mistake.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Scenarios */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium tracking-wider text-muted uppercase mb-6">Select a thought</h3>
            {scenarios.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => setSelected(scenario.id)}
                className={`w-full text-left p-6 rounded-2xl border transition-all duration-300 ${
                  selected === scenario.id 
                    ? "bg-surface-elevated border-gold shadow-[0_0_15px_rgba(200,169,106,0.1)]" 
                    : "bg-surface border-border hover:border-white/20"
                }`}
              >
                <p className="text-foreground">{scenario.text}</p>
              </button>
            ))}
          </div>

          {/* AI Response Area */}
          <div className="bg-surface-elevated border border-border rounded-2xl p-8 flex flex-col justify-center min-h-[300px] relative overflow-hidden">
            <AnimatePresence mode="wait">
              {selected ? (
                <motion.div
                  key={selected}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-6 relative z-10"
                >
                  {scenarios
                    .filter((s) => s.id === selected)
                    .map((s) => (
                      <div key={s.id}>
                        <div className="flex items-center space-x-3 mb-6">
                          <div className={`p-2 rounded-xl bg-surface border border-border ${s.color}`}>
                            <s.icon className="w-6 h-6" />
                          </div>
                          <div>
                            <p className="text-xs text-muted uppercase tracking-wider">Detected Emotion</p>
                            <p className={`font-medium ${s.color}`}>{s.emotion}</p>
                          </div>
                        </div>
                        <div className="p-6 bg-surface rounded-xl border border-border/50">
                          <p className="text-foreground leading-relaxed">"{s.advice}"</p>
                        </div>
                      </div>
                    ))}
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center text-center space-y-4 text-muted relative z-10"
                >
                  <HelpCircle className="w-12 h-12 opacity-50" />
                  <p>Select a scenario to see how the AI responds.</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Decorative background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-info/5 rounded-full blur-3xl pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
}
