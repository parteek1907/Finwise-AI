'use client';

import React from 'react';
import { motion } from 'framer-motion';

export function AuthBackground() {
  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-[0.02]">
      {/* Soft Blueprint Grid (2% opacity) */}
      <div 
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #303A3C 1px, transparent 1px),
            linear-gradient(to bottom, #303A3C 1px, transparent 1px)
          `,
          backgroundSize: '4rem 4rem',
        }}
      />
      
      {/* Abstract Market Curves & Candlesticks (2% opacity) */}
      <svg className="absolute w-full h-full" preserveAspectRatio="none">
        <motion.path
          d="M0,500 Q200,400 400,600 T800,300 T1200,500"
          fill="none"
          stroke="#303A3C"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
        <motion.path
          d="M0,600 Q200,500 500,700 T1000,400 T1400,600"
          fill="none"
          stroke="#303A3C"
          strokeWidth="1"
          strokeDasharray="4 4"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 5, ease: "easeInOut", delay: 0.5 }}
        />
      </svg>
      
      {/* Subtle Moving Nodes */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-[#303A3C]"
            style={{
              width: Math.random() * 4 + 2 + 'px',
              height: Math.random() * 4 + 2 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.3, 0.8, 0.3]
            }}
            transition={{
              duration: Math.random() * 6 + 6,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 2
            }}
          />
        ))}
      </div>
    </div>
  );
}
