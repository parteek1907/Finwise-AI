"use client";

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import styles from './ConfirmationModal.module.css';

interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDanger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export function ConfirmationModal({
  isOpen,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  isDanger = false,
  onConfirm,
  onClose,
}: ConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div 
        className={styles.modal} 
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <button className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
          <X size={18} />
        </button>

        <div className={styles.header}>
          <div className={`${styles.iconContainer} ${isDanger ? styles.dangerIcon : ''}`}>
            <AlertTriangle size={24} />
          </div>
          <h3>{title}</h3>
        </div>

        <p className={styles.description}>{description}</p>

        <div className={styles.actions}>
          <button 
            type="button" 
            className={styles.cancelBtn} 
            onClick={onClose}
          >
            {cancelLabel}
          </button>
          <button 
            type="button" 
            className={`${styles.confirmBtn} ${isDanger ? styles.dangerConfirmBtn : ''}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
