"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
import styles from './TopRightProfile.module.css';
import { useAppStore } from '@/store/useAppStore';

export function TopRightProfile() {
  const pathname = usePathname();
  const user = useAppStore(state => state.user);
  const [showProfile, setShowProfile] = useState(false);

  if (pathname !== '/dashboard') {
    return null;
  }

  return (
    <div className={styles.profileContainer}>
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
  );
}
