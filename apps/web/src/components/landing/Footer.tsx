"use client";
import React from 'react';
import Link from 'next/link';
import styles from './Landing.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerContent}>
        <span className={styles.footerLogo}>FinWise.AI</span>
        <div className={styles.footerLinks}>
          <Link href="#" className={styles.footerLink}>Privacy Policy</Link>
          <Link href="#" className={styles.footerLink}>Terms of Service</Link>
          <Link href="#" className={styles.footerLink}>Contact</Link>
          <Link href="#" className={styles.footerLink}>Support</Link>
        </div>
        <span className={styles.footerCopy}>© 2024 FinWise AI. All rights reserved.</span>
      </div>
    </footer>
  );
}
