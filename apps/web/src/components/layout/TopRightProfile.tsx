"use client";

import React from 'react';
import { Search, Mail, Bell, Command } from 'lucide-react';
import styles from './TopRightProfile.module.css';

export function TopRightProfile() {
  return (
    <div className={styles.topbar}>
      <div className={styles.searchContainer}>
        <Search size={18} className={styles.searchIcon} />
        <input type="text" placeholder="Search task" className={styles.searchInput} />
        <div className={styles.shortcut}>
          <Command size={12} />
          <span>F</span>
        </div>
      </div>
      
      <div className={styles.actions}>
        <button className={styles.iconButton}>
          <Mail size={20} />
        </button>
        <button className={styles.iconButton}>
          <Bell size={20} />
        </button>
        
        <div className={styles.profileSection}>
          <div className={styles.avatar}>
            <img src="https://i.pravatar.cc/150?img=11" alt="Profile" />
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>Totok Michael</span>
            <span className={styles.userEmail}>tmichael20@mail.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
