"use client";
import React from 'react';
import Link from 'next/link';
import { Globe, Mail, Share2 } from 'lucide-react';
import styles from './Landing.module.css';

export function Navbar() {
  return (
    <nav className={styles.navbar}>
      <Link href="/">
        <span className={styles.navLogo}>FinWise.AI</span>
      </Link>

      <div className={styles.navLinks}>
        <Link href="#how-it-works" className={styles.navLink}>Features</Link>
        <Link href="#resources" className={styles.navLink}>Resources</Link>
        <Link href="#pricing" className={styles.navLink}>Pricing</Link>
        <Link href="#faq" className={styles.navLink}>FAQ</Link>
        <Link href="#community" className={styles.navLink}>Community</Link>
      </div>

      <div className={styles.navRight}>
        <div className={styles.navSocials}>
          <span className={styles.navSocialIcon}><Globe size={14} /></span>
          <span className={styles.navSocialIcon}><Mail size={14} /></span>
          <span className={styles.navSocialIcon}><Share2 size={14} /></span>
        </div>
        <Link href="/auth">
          <button className={styles.navCTA}>Get Started</button>
        </Link>
      </div>
    </nav>
  );
}
