"use client";

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { MythVsFact } from './components/MythVsFact';
import { motion } from 'framer-motion';

export default function MythsPage() {
  return (
    <AppLayout>
      <motion.div 
        style={{ width: '100%', minHeight: '100%', overflow: 'hidden' }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <MythVsFact />
      </motion.div>
    </AppLayout>
  );
}
