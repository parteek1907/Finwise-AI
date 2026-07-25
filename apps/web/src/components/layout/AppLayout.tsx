"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { TopRightProfile } from './TopRightProfile';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname();
  
  // Show profile pill only on dashboard
  const showProfile = pathname === '/dashboard';
  
  // Mentor page gets 0 padding at bottom to allow chat to go all the way down
  const isMentor = pathname === '/mentor';

  return (
    <div className={styles.appContainer}>
      <Sidebar />
      <div className={styles.mainWrapper}>
        {showProfile && <TopRightProfile />}
        <main 
          className={styles.mainWorkspace}
          style={isMentor ? { paddingBottom: 0 } : undefined}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
