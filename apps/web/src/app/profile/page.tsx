"use client";

import React from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { User as UserIcon, Shield, Bell, Settings as SettingsIcon, LogOut, FileText, Smartphone } from 'lucide-react';
import styles from './Profile.module.css';
import { useAppStore } from '@/store/useAppStore';

export default function ProfilePage() {
  const user = useAppStore(state => state.user);

  return (
    <AppLayout>
      <div className={styles.workspace}>
        <div className={styles.layout}>
          
          {/* Main Profile Settings */}
          <main className={styles.mainCol}>
            <div className={styles.profileCard}>
              <div className={styles.avatarSection}>
                <div className={styles.avatarWrapper}>
                  <img src={user.avatar} alt={user.name} />
                  <button className={styles.editAvatarBtn}>Edit</button>
                </div>
                <div className={styles.userInfo}>
                  <h1>{user.name}</h1>
                  <span className={styles.userEmail}>{user.email}</span>
                  <div className={styles.archetypeBadge}>
                    <Shield size={14} />
                    Archetype: {user.archetype}
                  </div>
                </div>
              </div>

              <div className={styles.settingsGroup}>
                <h3>Personal Information</h3>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label>Full Name</label>
                    <input type="text" defaultValue={user.name} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Email Address</label>
                    <input type="email" defaultValue={user.email} />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Phone Number</label>
                    <input type="tel" defaultValue="+1 (555) 123-4567" />
                  </div>
                  <div className={styles.inputGroup}>
                    <label>Location</label>
                    <input type="text" defaultValue="New York, USA" />
                  </div>
                </div>
                <div className={styles.saveAction}>
                  <button className={styles.saveBtn}>Save Changes</button>
                </div>
              </div>
            </div>

            <div className={styles.preferencesCard}>
              <h3>App Preferences</h3>
              
              <div className={styles.prefList}>
                <div className={styles.prefItem}>
                  <div className={styles.prefIcon}><Bell size={20} /></div>
                  <div className={styles.prefText}>
                    <h4>Push Notifications</h4>
                    <p>Receive alerts for goals and daily learning.</p>
                  </div>
                  <div className={styles.toggleActive}></div>
                </div>
                
                <div className={styles.prefItem}>
                  <div className={styles.prefIcon}><Smartphone size={20} /></div>
                  <div className={styles.prefText}>
                    <h4>Biometric Login</h4>
                    <p>Use FaceID or TouchID to secure your account.</p>
                  </div>
                  <div className={styles.toggleActive}></div>
                </div>
              </div>
            </div>
          </main>

          {/* Sidebar Menu */}
          <aside className={styles.sideCol}>
            <nav className={styles.sideMenu}>
              <a href="#" className={styles.menuItemActive}>
                <UserIcon size={18} /> Account Details
              </a>
              <a href="#" className={styles.menuItem}>
                <Shield size={18} /> Security & Privacy
              </a>
              <a href="#" className={styles.menuItem}>
                <Bell size={18} /> Notifications
              </a>
              <a href="#" className={styles.menuItem}>
                <SettingsIcon size={18} /> Appearance
              </a>
              <a href="#" className={styles.menuItem}>
                <FileText size={18} /> Terms & Policies
              </a>
              <hr className={styles.divider} />
              <a href="#" className={`${styles.menuItem} ${styles.logoutText}`}>
                <LogOut size={18} /> Sign Out
              </a>
            </nav>

            <div className={styles.dangerZone}>
              <h4>Danger Zone</h4>
              <p>Permanently delete your account and all data.</p>
              <button className={styles.deleteBtn}>Delete Account</button>
            </div>
          </aside>
        </div>
      </div>
    </AppLayout>
  );
}
