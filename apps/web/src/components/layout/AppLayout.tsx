import React from 'react';
import { Sidebar } from './Sidebar';
import { TopRightProfile } from './TopRightProfile';
import styles from './AppLayout.module.css';

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className={styles.appContainer}>
      <Sidebar />
      <div className={styles.mainWrapper}>
        <TopRightProfile />
        <main className={styles.mainWorkspace}>
          {children}
        </main>
      </div>
    </div>
  );
}
