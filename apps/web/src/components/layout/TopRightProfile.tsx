"use client";

import React, { useEffect, useState } from 'react';
import { Search, Mail, Bell, Command } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import styles from './TopRightProfile.module.css';

export function TopRightProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);
  const getAvatarUrl = () => {
    if (user?.photoURL && !imgError) return user.photoURL;
    const name = user?.displayName || user?.email || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=303A3C&color=fff`;
  };

  return (
    <div className={styles.topbar} style={{ justifyContent: 'flex-end' }}>
      <div className={styles.actions}>
        <div className={styles.profileSection}>
          <div className={styles.avatar}>
            <img 
              src={getAvatarUrl()} 
              alt="Profile" 
              onError={() => setImgError(true)}
            />
          </div>
          <div className={styles.userInfo}>
            <span className={styles.userName}>{user?.displayName || 'User'}</span>
            <span className={styles.userEmail}>{user?.email || ''}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
