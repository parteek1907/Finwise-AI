"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  MessageSquare, 
  Target, 
  ShieldCheck, 
  LineChart,
  Award,
  User,
  Settings,
  HelpCircle,
  LogOut,
  Moon,
  Sun
} from 'lucide-react';
import styles from './Sidebar.module.css';

const NAV_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/learn', icon: BookOpen, label: 'Learning' },
  { href: '/mentor', icon: MessageSquare, label: 'AI Mentor' },
  { href: '/simulator', icon: LineChart, label: 'Virtual Market' },
  { href: '/scam-detector', icon: ShieldCheck, label: 'Scam Detector' },
  { href: '/goals', icon: Target, label: 'Goals' },
  { href: '/achievements', icon: Award, label: 'Achievements' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <Link href="/dashboard" className={styles.logoContainer} title="FinWise AI">
        <div className={styles.logoIcon}></div>
      </Link>

      <nav className={styles.navigation}>
        {NAV_ITEMS.map((item) => {
          // Highlight if the current path starts with the href (for nested routes like /learn/[id])
          const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/dashboard');
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              title={item.label} // Native tooltip on hover
            >
              {isActive && (
                <motion.div 
                  layoutId="activeNavBackground"
                  className={styles.activeBackground}
                  initial={false}
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <div className={styles.iconWrapper}>
                <item.icon size={22} strokeWidth={1.5} />
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
