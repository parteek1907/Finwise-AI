"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

type Archetype = {
  name: string;
  tagline: string;
  strengths: string[];
  weaknesses: string[];
  color: string;
};

type Props = {
  archetype: Archetype;
};

export function ArchetypeResult({ archetype }: Props) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Dynamic Background Glow based on Archetype Color */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[80vw] max-w-2xl max-h-2xl rounded-full blur-[120px] pointer-events-none opacity-20"
        style={{ backgroundColor: archetype.color }}
      />

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="z-10 text-center max-w-2xl w-full"
      >
        <div className="inline-flex items-center space-x-2 bg-surface border border-border rounded-full px-4 py-2 mb-8">
          <Sparkles className="w-4 h-4 text-gold" />
          <span className="text-xs uppercase tracking-wider text-muted font-medium">Your Financial Identity</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-heading font-medium text-foreground mb-4" style={{ color: archetype.color }}>
          {archetype.name}
        </h1>
        <p className="text-xl text-secondary mb-12 font-sans">
          "{archetype.tagline}"
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-16">
          <div className="bg-surface/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8">
            <h3 className="text-foreground font-medium mb-4 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-success"></span>
              <span>Strengths</span>
            </h3>
            <ul className="space-y-3">
              {archetype.strengths.map((s, i) => (
                <li key={i} className="text-secondary text-sm flex items-start space-x-2">
                  <span className="text-success mt-1">✓</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-surface/50 backdrop-blur-sm border border-white/5 rounded-3xl p-8">
            <h3 className="text-foreground font-medium mb-4 flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-danger"></span>
              <span>Growth Areas</span>
            </h3>
            <ul className="space-y-3">
              {archetype.weaknesses.map((w, i) => (
                <li key={i} className="text-secondary text-sm flex items-start space-x-2">
                  <span className="text-danger mt-1">△</span>
                  <span>{w}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <Link 
          href="/dashboard"
          className="inline-flex items-center justify-center space-x-2 bg-foreground text-background px-8 py-4 rounded-full font-medium hover:bg-foreground/90 transition-all hover:scale-105 shadow-[0_4px_14px_0_rgba(255,255,255,0.1)] group"
        >
          <span>Enter Mission Control</span>
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </motion.div>
    </div>
  );
}
