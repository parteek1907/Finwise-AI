"use client";

import { motion } from "framer-motion";
import { Zap, Flame, User as UserIcon } from "lucide-react";

type QuickStatsProps = {
  score: number;
  streak: number;
  xp: number;
};

export function QuickStats({ score, streak, xp }: QuickStatsProps) {
  return (
    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
      {/* Left side: Profile & XP */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="flex space-x-4 pointer-events-auto"
      >
        <div className="w-12 h-12 rounded-full bg-surface-elevated border border-border flex items-center justify-center shadow-sm">
          <UserIcon className="w-5 h-5 text-secondary" />
        </div>
        <div className="flex flex-col">
          <span className="text-foreground font-heading font-medium tracking-wide">Level 4 Explorer</span>
          <div className="flex items-center space-x-1 mt-1 text-xs font-mono text-muted uppercase">
            <Zap className="w-3 h-3 text-info" />
            <span>{xp.toLocaleString()} XP</span>
          </div>
        </div>
      </motion.div>

      {/* Right side: Streak & Score Info */}
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex space-x-3 pointer-events-auto"
      >
        <div className="flex items-center space-x-2 bg-surface/50 backdrop-blur-md border border-white/5 rounded-full px-4 py-2">
          <Flame className="w-4 h-4 text-danger" />
          <span className="text-sm font-medium text-foreground">{streak} Day Streak</span>
        </div>
        <div className="flex items-center space-x-2 bg-surface/50 backdrop-blur-md border border-white/5 rounded-full px-4 py-2">
          <span className="text-sm font-medium text-foreground">Health: {score}/100</span>
        </div>
      </motion.div>
    </div>
  );
}
