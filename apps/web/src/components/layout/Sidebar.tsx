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
  Sparkles,
  Brain,
  Gauge,
  PanelLeftClose,
  PanelLeft,
  Settings as SettingsIcon
} from 'lucide-react';
import styles from './Sidebar.module.css';

const MENU_ITEMS = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/learn', icon: BookOpen, label: 'Learning' },
  { href: '/mentor', icon: MessageSquare, label: 'AI Mentor' },
  { href: '/simulator', icon: LineChart, label: 'Virtual Market' },
  { href: '/myths', icon: Gauge, label: 'Myth vs Fact' },
  { href: '/emotion', icon: Brain, label: 'Emotion AI' },
  { href: '/scam-detector', icon: ShieldCheck, label: 'Scam Detector' },
  { href: '/goals', icon: Target, label: 'Goals' },
  { href: '/achievements', icon: Award, label: 'Achievements' },
  { href: '/settings', icon: SettingsIcon, label: 'Settings' },
];

interface SidebarProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ isCollapsed = false, onToggleCollapse }: SidebarProps) {
  const pathname = usePathname();

  const renderNavItems = (items: any[]) => {
    return items.map((item) => {
      const isActive = pathname === item.href || (pathname?.startsWith(item.href) && item.href !== '/dashboard');
      
      return (
        <Link 
          key={item.href} 
          href={item.href}
          className={`${styles.navItem} ${isActive ? styles.active : ''}`}
          title={isCollapsed ? item.label : undefined}
        >
          {isActive && (
            <motion.div
              layoutId="sidebarActiveIndicator"
              className={styles.activeIndicator}
              initial={false}
              transition={{ type: "spring", stiffness: 400, damping: 30 }}
            />
          )}
          <div className={`${styles.iconWrapper} ${isActive ? styles.activeIcon : ''}`}>
            <item.icon size={20} strokeWidth={isActive ? 2.5 : 1.5} />
          </div>
          {!isCollapsed && <span>{item.label}</span>}
          {!isCollapsed && item.badge && <span className={styles.badge}>{item.badge}</span>}
        </Link>
      );
    });
  };

  return (
    <aside className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''}`}>
      {/* Header with Logo & Collapse Toggle */}
      <div className={styles.sidebarHeader}>
        <Link href="/dashboard" className={styles.logoContainer}>
          <div className={styles.logoIcon}></div>
          {!isCollapsed && <span className={styles.logoText}>FinWise</span>}
        </Link>
        {onToggleCollapse && (
          <button 
            className={styles.collapseBtn} 
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}
      </div>

      {/* Menu Section */}
      <div className={styles.navSection}>
        {!isCollapsed && <div className={styles.sectionTitle}>MENU</div>}
        <nav className={styles.navigation}>
          {renderNavItems(MENU_ITEMS)}
        </nav>
      </div>

    </aside>
  );
}
