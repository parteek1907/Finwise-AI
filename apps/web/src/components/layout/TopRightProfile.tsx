"use client";

import React, { useEffect, useState, useRef } from 'react';
import { User as UserIcon, Settings, LogOut, ChevronDown, UserCheck } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import styles from './TopRightProfile.module.css';

export function TopRightProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [imgError, setImgError] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (err) {
      console.error("Failed to log out", err);
    }
  };

  const getAvatarUrl = () => {
    if (user?.photoURL && !imgError) return user.photoURL;
    const name = user?.displayName || user?.email || 'Aditya Tanwar';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=19533B&color=fff`;
  };

  const displayName = user?.displayName || 'Aditya Tanwar';
  const displayEmail = user?.email || 'adityatanwar13827@gmail.com';

  return (
    <div className={styles.topbar} style={{ justifyContent: 'flex-end' }}>
      <div className={styles.actions}>
        <div className={styles.dropdownContainer} ref={dropdownRef}>
          <button 
            className={styles.profileButton}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-haspopup="true"
            type="button"
          >
            <div className={styles.avatar}>
              <img 
                src={getAvatarUrl()} 
                alt={displayName} 
                onError={() => setImgError(true)}
              />
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{displayName}</span>
              <span className={styles.userEmail}>{displayEmail}</span>
            </div>
            <ChevronDown className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`} size={16} />
          </button>

          {isOpen && (
            <div className={styles.dropdownMenu}>
              <div className={styles.menuHeader}>
                <div className={styles.headerAvatar}>
                  <img src={getAvatarUrl()} alt={displayName} />
                </div>
                <div className={styles.headerMeta}>
                  <p className={styles.headerName}>{displayName}</p>
                  <p className={styles.headerEmail}>{displayEmail}</p>
                </div>
              </div>
              
              <div className={styles.menuDivider} />
              
              <div className={styles.menuGroup}>
                <button 
                  type="button"
                  className={styles.menuItem} 
                  onClick={() => { setIsOpen(false); router.push('/profile'); }}
                >
                  <UserIcon size={16} />
                  <span>Edit Profile</span>
                </button>
                
                <button 
                  type="button"
                  className={styles.menuItem} 
                  onClick={() => { setIsOpen(false); router.push('/profile'); }}
                >
                  <Settings size={16} />
                  <span>Settings</span>
                </button>
              </div>
              
              <div className={styles.menuDivider} />
              
              <button 
                type="button"
                className={`${styles.menuItem} ${styles.logoutBtn}`} 
                onClick={handleLogout}
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

