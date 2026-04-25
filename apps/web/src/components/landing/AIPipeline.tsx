"use client";

import { motion } from "framer-motion";
import { User, Activity, BrainCircuit, Lightbulb, Trophy, ArrowRight } from "lucide-react";

const steps = [
  { icon: User, label: "You", desc: "Your unique profile" },
  { icon: Activity, label: "Behavior", desc: "How you react" },
  { icon: BrainCircuit, label: "Finwise AI", desc: "Contextual analysis" },
  { icon: Lightbulb, label: "Guidance", desc: "Personalized lesson" },
  { icon: Trophy, label: "Confidence", desc: "Financial growth" },
];

export function AIPipeline() {
  return (
    <section className="py-24 bg-surface relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-heading font-medium text-foreground">
            How Finwise Thinks
          </h2>
          <p className="mt-4 text-secondary">A personalized engine designed for your financial mind.</p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between relative">
          {/* Animated Connecting Line (Hidden on mobile for simplicity) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-[1px] bg-border -z-10 transform -translate-y-1/2" />
          <motion.div 
            className="hidden md:block absolute top-1/2 left-0 h-[2px] bg-gold -z-10 transform -translate-y-1/2"
            initial={{ width: 0 }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 2, ease: "easeInOut" }}
          />

          {steps.map((step, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.2 }}
              className="flex flex-col items-center mb-12 md:mb-0 bg-surface md:bg-transparent px-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-surface-elevated border border-border flex items-center justify-center shadow-sm mb-4 relative overflow-hidden group hover:border-gold/50 transition-colors">
                <step.icon className="w-6 h-6 text-foreground group-hover:text-gold transition-colors" />
              </div>
              <h4 className="font-heading font-medium text-foreground text-lg">{step.label}</h4>
              <p className="text-sm text-secondary text-center mt-1 max-w-[120px]">{step.desc}</p>
              
              {/* Mobile Arrow */}
              {idx < steps.length - 1 && (
                <ArrowRight className="w-5 h-5 text-border mt-8 md:hidden" />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
