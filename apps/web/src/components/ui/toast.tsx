"use client";

import React, { createContext, useContext, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X } from 'lucide-react';

interface ToastOptions {
  title: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toast: (options: ToastOptions) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<(ToastOptions & { id: number })[]>([]);

  const toast = (options: ToastOptions) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...options, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, options.duration || 4000);
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        zIndex: 9999,
      }}>
        <AnimatePresence>
          {toasts.map(t => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
              style={{
                background: 'rgba(58, 70, 72, 0.9)',
                backdropFilter: 'blur(24px)',
                WebkitBackdropFilter: 'blur(24px)',
                border: '1px solid rgba(221, 215, 201, 0.15)',
                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                borderRadius: '12px',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                width: '320px',
                color: '#DDD7C9',
              }}
            >
              <div style={{ color: '#C4B896', marginTop: '2px' }}>
                <Sparkles size={18} />
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#DDD7C9' }}>{t.title}</h4>
                {t.description && (
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#A8AD9E', lineHeight: 1.4 }}>
                    {t.description}
                  </p>
                )}
              </div>
              <button 
                onClick={() => setToasts(prev => prev.filter(toast => toast.id !== t.id))}
                style={{ background: 'none', border: 'none', color: '#8A9080', cursor: 'pointer', padding: 0 }}
              >
                <X size={16} />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error("useToast must be used within ToastProvider");
  return context;
};
