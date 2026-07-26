"use client";

import React, { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import styles from './AppLayout.module.css';
import { auth } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useAppStore } from '@/store/useAppStore';
import { useSettingsStore } from '@/store/useSettingsStore';

import { MotionConfig } from 'framer-motion';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  const updateUser = useAppStore(state => state.updateUser);
  const updateProfile = useSettingsStore(state => state.updateProfile);
  const updateExchangeRates = useSettingsStore(state => state.updateExchangeRates);
  const reduceAnimations = useSettingsStore(state => state.appearance.reduceAnimations);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  useEffect(() => {
    fetch('/api/market/exchange-rates')
      .then(res => res.json())
      .then(rates => {
        if (rates && Object.keys(rates).length > 0) {
          updateExchangeRates(rates);
        }
      })
      .catch(console.error);
  }, [updateExchangeRates]);

  useEffect(() => {
    document.documentElement.setAttribute('data-reduce-animations', String(reduceAnimations));
  }, [reduceAnimations]);

  useEffect(() => {
    window.dispatchEvent(new Event('resize'));
    const t1 = setTimeout(() => window.dispatchEvent(new Event('resize')), 100);
    const t2 = setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [isSidebarCollapsed]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const providerData = firebaseUser.providerData;
        const googleProfile = providerData?.find((p: any) => p.providerId === 'google.com');
        const realGoogleName = googleProfile?.displayName;

        const rawName = realGoogleName || firebaseUser.displayName || (firebaseUser.email ? firebaseUser.email.split('@')[0] : '');
        const emailPrefix = firebaseUser.email ? firebaseUser.email.split('@')[0] : '';
        const formattedEmailPrefix = emailPrefix ? emailPrefix.charAt(0).toUpperCase() + emailPrefix.slice(1) : '';
        const userEmail = firebaseUser.email || '';
        const userAvatar = firebaseUser.photoURL || '';

        const storeProfile = useSettingsStore.getState().profile;
        const currentName = storeProfile.name;
        const currentEmail = storeProfile.email;
        
        const isDifferentUser = currentEmail && currentEmail !== userEmail;
        const isStuckName = currentName === 'Aditya Tanwar' || currentName === firebaseUser.displayName || currentName === formattedEmailPrefix;

        if (!currentName || isDifferentUser || isStuckName) {
          updateUser({ name: rawName || 'User' });
          updateProfile({
            name: rawName || 'User',
            email: userEmail,
            avatar: userAvatar,
          });
        } else {
          updateProfile({
            email: userEmail,
            avatar: userAvatar,
          });
        }
      }
    });

    return () => unsubscribe();
  }, [updateUser, updateProfile]);
  
  
  // Mentor page gets 0 padding at bottom to allow chat to go all the way down
  const isMentor = pathname === '/mentor';

  return (
    <MotionConfig reducedMotion={reduceAnimations ? "always" : "never"}>
      <div className={`${styles.appContainer} ${isSidebarCollapsed ? styles.appContainerCollapsed : ''}`}>
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
        <div className={styles.mainWrapper}>
          <main 
            className={styles.mainWorkspace}
            style={isMentor ? { paddingBottom: 0 } : undefined}
          >
            {children}
          </main>
        </div>
      </div>
    </MotionConfig>
  );
}
