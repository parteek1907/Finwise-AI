"use client";

import React, { useEffect, useState, useRef } from 'react';
import { User as UserIcon, Settings, LogOut, ChevronDown, UserCheck } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAppStore } from '@/store/useAppStore';
import styles from './SidebarProfile.module.css';

export function SidebarProfile({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const profile = useSettingsStore(state => state.profile);
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
      useAppStore.getState().resetStore();
      await signOut(auth);
      router.push('/');
    } catch (err) {
      console.error("Failed to log out", err);
    }
  };

  const getAvatarUrl = () => {
    if (user?.photoURL && !imgError) return user.photoURL;
    if (profile.avatar && !imgError) return profile.avatar;
    const providerData = user?.providerData;
    const googleProfile = providerData?.find((p: any) => p.providerId === 'google.com');
    const realGoogleName = googleProfile?.displayName;
    const name = profile.name || realGoogleName || user?.displayName || user?.email || profile.email || 'User';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=19533B&color=fff`;
  };

  const providerData = user?.providerData;
  const googleProfile = providerData?.find((p: any) => p.providerId === 'google.com');
  const realGoogleName = googleProfile?.displayName;
  const displayName = profile.name || realGoogleName || user?.displayName || 'User';
  const displayEmail = user?.email || profile.email || '';

  return (
    <div className={styles.profileSection}>
      <div className={styles.dropdownContainer} ref={dropdownRef}>
        <button 
          className={`${styles.profileButton} ${isCollapsed ? styles.profileButtonCollapsed : ''}`}
            onClick={() => setIsOpen(!isOpen)}
            aria-expanded={isOpen}
            aria-haspopup="true"
            type="button"
          >
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              <img 
                src={getAvatarUrl()} 
                alt={displayName} 
                onError={() => setImgError(true)}
              />
            </div>
          </div>
          {!isCollapsed && (
            <div className={styles.userInfo}>
              <span className={styles.userName}>{displayName}</span>
              <span className={styles.userEmail}>{displayEmail}</span>
            </div>
          )}
          {!isCollapsed && (
            <Settings className={styles.settingsIcon} size={18} />
          )}
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
                  onClick={() => { setIsOpen(false); router.push('/settings'); }}
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
  );
}

