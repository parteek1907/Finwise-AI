'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface FloatingStatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon?: React.ReactNode;
  delay?: number;
}

export function FloatingStatCard({
  title,
  value,
  subtitle,
  icon,
  delay = 0,
}: FloatingStatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      className="w-[260px] h-[88px] p-[20px] rounded-[24px] bg-white/90 backdrop-blur-md shadow-[0_10px_30px_-5px_rgba(48,58,60,0.06)] border border-white/80 flex flex-col justify-between"
    >
      <div className="flex justify-between items-center">
        <span className="text-[13px] font-semibold text-[#303A3C]/60 tracking-tight">{title}</span>
        {icon && (
          <div className="text-[#8A9080]">
            {icon}
          </div>
        )}
      </div>
      
      <div className="flex items-baseline justify-between">
        <span className="text-xl font-bold text-[#303A3C] tracking-tight">{value}</span>
        {subtitle && (
          <span className="text-[12px] font-semibold text-[#8A9080]">{subtitle}</span>
        )}
      </div>
    </motion.div>
  );
}
