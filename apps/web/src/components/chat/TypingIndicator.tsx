"use client";

import { motion } from "framer-motion";

export function TypingIndicator() {
  const dotVariants = {
    initial: { y: 0 },
    animate: { y: -5 }
  };

  const transition = {
    duration: 0.5,
    repeat: Infinity,
    repeatType: "reverse" as const,
    ease: "easeInOut" as const
  };

  return (
    <div className="flex items-center space-x-1 p-2">
      <motion.div
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={{ ...transition, delay: 0 }}
        className="w-1.5 h-1.5 rounded-full bg-secondary"
      />
      <motion.div
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={{ ...transition, delay: 0.15 }}
        className="w-1.5 h-1.5 rounded-full bg-secondary"
      />
      <motion.div
        variants={dotVariants}
        initial="initial"
        animate="animate"
        transition={{ ...transition, delay: 0.3 }}
        className="w-1.5 h-1.5 rounded-full bg-secondary"
      />
    </div>
  );
}
