"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Bell, AlertCircle, ChevronDown, Zap } from 'lucide-react';
import styles from './Topbar.module.css';
import { useAppStore } from '@/store/useAppStore';

export function Topbar() {
  const pathname = usePathname();
  const user = useAppStore(state => state.user);
  
  const [showProfile, setShowProfile] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <header className={styles.topbar}>
      {/* Left: Logo */}
      <Link href="/dashboard" className={styles.logoContainer}>
        <div className={styles.logoIcon}></div>
        <span className={styles.logoText}>FinWise</span>
      </Link>

      {/* Center: Nav Pill */}
      <nav className={styles.navPill}>
        <Link href="/dashboard" className={pathname === '/dashboard' ? styles.active : ''}>Overview</Link>
        <Link href="/learn" className={pathname.startsWith('/learn') ? styles.active : ''}>Learning</Link>
        <Link href="/mentor" className={pathname === '/mentor' ? styles.active : ''}>AI Mentor</Link>
        <Link href="/goals" className={pathname.startsWith('/goals') ? styles.active : ''}>Goals</Link>
        <Link href="/simulator" className={pathname === '/simulator' ? styles.active : ''}>Market</Link>
      </nav>

      {/* Right: Actions */}
      <div className={styles.actions}>
        {showSearch && (
          <div className={styles.searchContainer}>
            <input type="text" placeholder="Search lessons, goals, or scams..." autoFocus />
          </div>
        )}
        <button className={styles.iconBtn} onClick={() => setShowSearch(!showSearch)}>
          <Search size={18} />
        </button>
        
        <Link href="/mentor" className={`${styles.iconBtn} ${styles.aiBtn}`} title="Quick AI">
          <Zap size={18} />
        </Link>
        
        <button className={styles.iconBtn} title="Notifications">
          <Bell size={18} />
          <span className={styles.badge}></span>
        </button>
        
        <div className={styles.profileWrapper}>
          <div className={styles.profileDropdown} onClick={() => setShowProfile(!showProfile)}>
            <div className={styles.avatar}>
              <img src={user.avatar} alt={user.name} />
            </div>
            <div className={styles.profileInfo}>
              <span className={styles.profileName}>{user.name}</span>
              <span className={styles.profileEmail}>{user.archetype}</span>
            </div>
            <ChevronDown size={14} className={styles.dropdownIcon} />
          </div>

          {/* Profile Popover */}
          {showProfile && (
            <div className={styles.popover}>
              <div className={styles.popoverHeader}>
                <div className={styles.popoverStat}>
                  <span>XP</span>
                  <strong>{user.xp}</strong>
                </div>
                <div className={styles.popoverStat}>
                  <span>Streak</span>
                  <strong>{user.streak}🔥</strong>
                </div>
              </div>
              <div className={styles.popoverLinks}>
                <Link href="/profile">My Profile</Link>
                <Link href="/achievements">Achievements</Link>
                <Link href="/settings">Settings</Link>
                <hr className={styles.divider} />
                <button className={styles.logoutBtn}>Sign Out</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
