"use client";

import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Bot, 
  DollarSign, 
  Bell, 
  Shield, 
  Palette, 
  Lock, 
  Check, 
  Smartphone, 
  Laptop, 
  AlertCircle, 
  Trash2, 
  LogOut, 
  Sparkles,
  Camera,
  Settings,
  Zap
} from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAppStore } from '@/store/useAppStore';
import { auth } from '@/lib/firebase';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { motion } from 'framer-motion';
import styles from './Settings.module.css';

type TabType = 'profile' | 'aiMentor' | 'financial' | 'notifications' | 'security' | 'appearance' | 'privacy';

const COUNTRY_CODES = [
  { code: '+1', country: 'US/Canada' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'India' },
  { code: '+61', country: 'Australia' },
  { code: '+49', country: 'Germany' },
  { code: '+33', country: 'France' },
  { code: '+81', country: 'Japan' },
  { code: '+86', country: 'China' },
  { code: '+971', country: 'UAE' },
  { code: '+65', country: 'Singapore' }
];

const SUGGESTED_LOCATIONS = [
  "Chandigarh, India", "Chennai, India", "Chicago, USA", "Cape Town, South Africa", 
  "Delhi, India", "Dallas, USA", "Denver, USA", "Dubai, UAE",
  "London, UK", "Los Angeles, USA", "Lisbon, Portugal",
  "Mumbai, India", "Miami, USA", "Melbourne, Australia",
  "New York, USA", "New Delhi, India", "Nairobi, Kenya",
  "Paris, France", "Pune, India", "Perth, Australia",
  "San Francisco, USA", "Seattle, USA", "Sydney, Australia",
  "Tokyo, Japan", "Toronto, Canada", "Taipei, Taiwan"
];

function ToggleSwitch({ checked, onChange, ariaLabel = "Toggle option" }: { checked: boolean; onChange: (val: boolean) => void; ariaLabel?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel}
      className={`${styles.toggleSwitch} ${checked ? styles.toggleOn : ''}`}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
    >
      <div 
        className={styles.toggleKnob}
        style={{
          transform: checked ? 'translateX(22px)' : 'translateX(0px)',
          transition: 'transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      />
    </button>
  );
}

export function SettingsLayout() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Store references
  const {
    profile,
    aiMentor,
    financial,
    notifications,
    sessions,
    appearance,
    updateProfile,
    updateAIMentor,
    updateFinancial,
    updateNotifications,
    updateAppearance,
    terminateSession,
    terminateAllOtherSessions,
    resetAllSettings,
  } = useSettingsStore();

  const { chats, createNewChat, user: appUser } = useAppStore();

  // Initial Setup
  const initialName = profile.name || appUser.name || 'John Doe';
  const initialEmail = profile.email || appUser.email || 'johndoe@example.com';
  const initialLocation = (profile.location === 'Chandigarh, India') ? '' : profile.location;
  
  let initialPhone = profile.phone || '';
  if (initialPhone === '+91 9996334595' || initialPhone.includes('9996334595')) {
    initialPhone = '';
  }
  const foundCode = COUNTRY_CODES.find(c => initialPhone.startsWith(c.code));
  const initialCountryCode = foundCode ? foundCode.code : '+1';
  const initialPhoneNumber = foundCode ? initialPhone.replace(foundCode.code, '').trim() : initialPhone.trim();

  // Local Form States
  const [profileForm, setProfileForm] = useState({
    name: initialName,
    email: initialEmail,
    avatar: profile.avatar || '',
  });
  
  const [countryCode, setCountryCode] = useState(initialCountryCode);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber);
  const [locationQuery, setLocationQuery] = useState(initialLocation);
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const locationRef = useRef<HTMLDivElement>(null);

  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  // Sync local form with store when store updates (e.g., after Firebase auth loads)
  useEffect(() => {
    if (profile.name || appUser.name) {
      setProfileForm(prev => ({
        ...prev,
        name: profile.name || appUser.name || prev.name,
        email: profile.email || appUser.email || prev.email,
        avatar: profile.avatar || prev.avatar,
      }));
    }
  }, [profile.name, profile.email, profile.avatar, appUser.name, appUser.email]);

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (locationRef.current && !locationRef.current.contains(event.target as Node)) {
        setShowLocationDropdown(false);
      }
      if (countryRef.current && !countryRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredLocations = SUGGESTED_LOCATIONS.filter(loc => 
    loc.toLowerCase().includes(locationQuery.toLowerCase())
  );

  const [profileErrors, setProfileErrors] = useState<{ name?: string; email?: string }>({});

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Modals state
  const [modalState, setModalState] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    isDanger: boolean;
    confirmLabel: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    description: '',
    isDanger: false,
    confirmLabel: 'Confirm',
    onConfirm: () => {},
  });

  // Apply Animation reduction setting immediately
  useEffect(() => {
    const root = document.documentElement;
    if (appearance.reduceAnimations) {
      root.setAttribute('data-reduce-animations', 'true');
    } else {
      root.removeAttribute('data-reduce-animations');
    }
  }, [appearance.reduceAnimations]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Profile Save Handler
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { name?: string; email?: string } = {};

    if (!profileForm.name.trim()) {
      errors.name = 'Full name is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!profileForm.email.trim() || !emailRegex.test(profileForm.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (Object.keys(errors).length > 0) {
      setProfileErrors(errors);
      return;
    }

    setProfileErrors({});
    
    const finalPhone = phoneNumber ? `${countryCode} ${phoneNumber}` : '';
    
    updateProfile({ 
      ...profileForm, 
      phone: finalPhone, 
      location: locationQuery 
    });
    
    if (auth.currentUser) {
      import('firebase/auth').then(({ updateProfile: updateFirebaseProfile }) => {
        if (auth.currentUser) {
          updateFirebaseProfile(auth.currentUser, { displayName: profileForm.name }).catch(err => console.error("Firebase profile update error:", err));
        }
      });
    }
    showToast('Profile changes saved successfully');
  };

  // Password Change Handler
  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    setPasswordSuccess('Password changed successfully');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    showToast('Password updated successfully');
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        if (dataUrl) {
          setProfileForm(prev => ({ ...prev, avatar: dataUrl }));
          updateProfile({ avatar: dataUrl });
          showToast('Profile picture updated from device');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Modal Triggers
  const triggerClearHistory = () => {
    setModalState({
      isOpen: true,
      title: 'Clear Chat History',
      description: 'Are you sure you want to permanently clear all previous AI Mentor conversations? This action cannot be undone.',
      isDanger: true,
      confirmLabel: 'Clear History',
      onConfirm: () => {
        // Clear chats state logic
        useAppStore.setState({ chats: [], activeChatId: null });
        showToast('Chat history cleared successfully');
      },
    });
  };

  const triggerDeleteAccount = () => {
    setModalState({
      isOpen: true,
      title: 'Delete Account',
      description: 'Are you sure you want to delete your account? All your personal preferences, financial goals, and stored records will be permanently erased.',
      isDanger: true,
      confirmLabel: 'Delete Account',
      onConfirm: () => {
        resetAllSettings();
        showToast('Account data reset cleanly');
      },
    });
  };

  const triggerLogoutAllSessions = () => {
    setModalState({
      isOpen: true,
      title: 'Log Out All Other Devices',
      description: 'You will be logged out of all active sessions except your current browser session.',
      isDanger: false,
      confirmLabel: 'Log Out All',
      onConfirm: () => {
        terminateAllOtherSessions();
        showToast('Logged out of all other devices');
      },
    });
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'aiMentor' as TabType, label: 'AI Mentor', icon: Bot },
    { id: 'financial' as TabType, label: 'Financial Preferences', icon: DollarSign },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'security' as TabType, label: 'Security', icon: Shield },
    { id: 'appearance' as TabType, label: 'Performance', icon: Zap },
    { id: 'privacy' as TabType, label: 'Privacy', icon: Lock },
  ];

  return (
    <div className={styles.container}>
      {toastMessage && (
        <div className={styles.toast}>
          <Check size={16} />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className={styles.headerArea}>
        <div className={styles.titleWrap}>
          <div className={styles.iconBox}>
            <Settings size={28} color="#19533B" />
          </div>
          <div>
            <h1>Settings</h1>
            <p>Manage your account settings, AI preferences, and security options.</p>
          </div>
        </div>
      </div>

      <div className={styles.workspaceLayout}>
        {/* Navigation Sidebar */}
        <aside className={styles.sidebar}>
          <nav className={styles.navMenu}>
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Settings Content Area */}
        <main className={styles.mainContent}>
          {/* PROFILE SECTION */}
          {activeTab === 'profile' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Profile Information</h2>
                <p>Update your personal details and account info.</p>
              </div>

              <div className={styles.avatarRow}>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={handleFileSelected} 
                />
                <div className={styles.avatarWrapper}>
                  <img
                    src={
                      profileForm.avatar ||
                      auth.currentUser?.photoURL ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        profileForm.name
                      )}&background=19533B&color=fff`
                    }
                    alt={profileForm.name}
                  />
                  <button 
                    type="button" 
                    className={styles.avatarEditBtn}
                    onClick={handleAvatarUpload}
                    aria-label="Upload Avatar"
                    title="Choose photo from device"
                  >
                    <Camera size={14} />
                  </button>
                </div>
                <div className={styles.avatarMeta}>
                  <h3>{profileForm.name}</h3>
                  <p>{profileForm.email}</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className={styles.formStack}>
                <div className={styles.formGrid}>
                  <div className={styles.inputGroup}>
                    <label htmlFor="name">Full Name</label>
                    <input
                      id="name"
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                      className={profileErrors.name ? styles.inputError : ''}
                    />
                    {profileErrors.name && (
                      <span className={styles.errorText}>{profileErrors.name}</span>
                    )}
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="email">Email Address</label>
                    <input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                      className={profileErrors.email ? styles.inputError : ''}
                    />
                    {profileErrors.email && (
                      <span className={styles.errorText}>{profileErrors.email}</span>
                    )}
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="phone">Phone Number</label>
                    <div className={styles.phoneInputContainer}>
                      <div className={styles.countryCodeDropdownWrapper} ref={countryRef}>
                        <div 
                          className={styles.countryCodeSelect} 
                          onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                        >
                          {countryCode}
                        </div>
                        {showCountryDropdown && (
                          <ul className={styles.countryCodeList}>
                            {COUNTRY_CODES.map(c => (
                              <li 
                                key={c.code}
                                className={styles.autocompleteItem}
                                onClick={() => {
                                  setCountryCode(c.code);
                                  setShowCountryDropdown(false);
                                }}
                              >
                                {c.code} {c.country}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                      <input
                        id="phone"
                        type="tel"
                        maxLength={10}
                        placeholder="Enter 10 digit number"
                        value={phoneNumber}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                          setPhoneNumber(val);
                        }}
                        className={styles.phoneNumberInput}
                      />
                    </div>
                  </div>

                  <div className={styles.inputGroup} ref={locationRef}>
                    <label htmlFor="location">Location</label>
                    <div className={styles.autocompleteWrapper}>
                      <input
                        id="location"
                        type="text"
                        placeholder="Type to search location..."
                        value={locationQuery}
                        onChange={(e) => {
                          setLocationQuery(e.target.value);
                          setShowLocationDropdown(true);
                        }}
                        onFocus={() => setShowLocationDropdown(true)}
                        autoComplete="off"
                      />
                      {showLocationDropdown && filteredLocations.length > 0 && (
                        <ul className={styles.autocompleteList}>
                          {filteredLocations.map(loc => (
                            <li 
                              key={loc}
                              className={styles.autocompleteItem}
                              onClick={() => {
                                setLocationQuery(loc);
                                setShowLocationDropdown(false);
                              }}
                            >
                              {loc}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <div className={styles.formActions}>
                  <button type="submit" className={styles.saveBtn}>
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* AI MENTOR SECTION */}
          {activeTab === 'aiMentor' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>AI Mentor Settings</h2>
                <p>Customize how the AI Mentor explains concepts and responds to your queries.</p>
              </div>

              <div className={styles.sectionBlock}>
                <label className={styles.sectionLabel}>Financial Knowledge Level</label>
                <div className={styles.radioGrid}>
                  {(['Beginner', 'Intermediate', 'Advanced'] as const).map((level) => (
                    <label
                      key={level}
                      className={`${styles.radioCard} ${
                        aiMentor.knowledgeLevel === level ? styles.radioCardSelected : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="knowledgeLevel"
                        value={level}
                        checked={aiMentor.knowledgeLevel === level}
                        onChange={() => {
                          updateAIMentor({ knowledgeLevel: level });
                          showToast(`Knowledge level set to ${level}`);
                        }}
                      />
                      <div className={styles.radioContent}>
                        <span className={styles.radioTitle}>{level}</span>
                        <span className={styles.radioDesc}>
                          {level === 'Beginner' && 'Simple, intuitive explanations without heavy jargon.'}
                          {level === 'Intermediate' && 'Balanced guidance with standard financial metrics.'}
                          {level === 'Advanced' && 'Concise, technical data and deep financial analysis.'}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.sectionBlock}>
                <label className={styles.sectionLabel}>Response Length</label>
                <div className={styles.pillGroup}>
                  {(['Short', 'Balanced', 'Detailed'] as const).map((len) => (
                    <button
                      key={len}
                      type="button"
                      className={`${styles.pillBtn} ${
                        aiMentor.responseLength === len ? styles.pillBtnActive : ''
                      }`}
                      onClick={() => {
                        updateAIMentor({ responseLength: len });
                        showToast(`Response length set to ${len}`);
                      }}
                    >
                      {len}
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.sectionBlock}>
                <label className={styles.sectionLabel}>AI Personality</label>
                <div className={styles.radioGrid}>
                  {(['Friendly', 'Professional'] as const).map((person) => (
                    <label
                      key={person}
                      className={`${styles.radioCard} ${
                        aiMentor.aiPersonality === person ? styles.radioCardSelected : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="aiPersonality"
                        value={person}
                        checked={aiMentor.aiPersonality === person}
                        onChange={() => {
                          updateAIMentor({ aiPersonality: person });
                          showToast(`AI Personality updated to ${person}`);
                        }}
                      />
                      <div className={styles.radioContent}>
                        <span className={styles.radioTitle}>{person}</span>
                        <span className={styles.radioDesc}>
                          {person === 'Friendly'
                            ? 'Warm, conversational tone with supportive coaching.'
                            : 'Direct, structured, executive-level communication.'}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.toggleRow}>
                <div>
                  <h4>Remember Chat History</h4>
                  <p>Allow the AI Mentor to retain context across your conversation sessions.</p>
                </div>
                <ToggleSwitch
                  checked={aiMentor.rememberChatHistory}
                  onChange={(next) => {
                    updateAIMentor({ rememberChatHistory: next });
                    showToast(`Chat history retention ${next ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>
            </div>
          )}

          {/* FINANCIAL PREFERENCES SECTION */}
          {activeTab === 'financial' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Financial Preferences</h2>
                <p>Configure currency, risk parameters, and financial notifications.</p>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="currency">Preferred Currency</label>
                <select
                  id="currency"
                  value={financial.preferredCurrency}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    updateFinancial({ preferredCurrency: val });
                    showToast(`Currency updated to ${val}`);
                  }}
                  className={styles.selectInput}
                >
                  <option value="USD">USD ($) - United States Dollar</option>
                  <option value="INR">INR (₹) - Indian Rupee</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>

              <div className={styles.divider} />

              <div className={styles.sectionBlock}>
                <label className={styles.sectionLabel}>Risk Tolerance</label>
                <div className={styles.radioGrid}>
                  {(['Low', 'Medium', 'High'] as const).map((risk) => (
                    <label
                      key={risk}
                      className={`${styles.radioCard} ${
                        financial.riskTolerance === risk ? styles.radioCardSelected : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="riskTolerance"
                        value={risk}
                        checked={financial.riskTolerance === risk}
                        onChange={() => {
                          updateFinancial({ riskTolerance: risk });
                          showToast(`Risk tolerance set to ${risk}`);
                        }}
                      />
                      <div className={styles.radioContent}>
                        <span className={styles.radioTitle}>{risk} Risk</span>
                        <span className={styles.radioDesc}>
                          {risk === 'Low' && 'Focus on capital preservation and steady dividend yields.'}
                          {risk === 'Medium' && 'Balanced mix of conservative growth and moderate equities.'}
                          {risk === 'High' && 'Aggressive capital appreciation with higher volatility.'}
                        </span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className={styles.divider} />

              <div className={styles.toggleRow}>
                <div>
                  <h4>Budget & Goal Reminders</h4>
                  <p>Receive proactive notifications when approaching monthly spending limits.</p>
                </div>
                <ToggleSwitch
                  checked={financial.budgetReminders}
                  onChange={(next) => {
                    updateFinancial({ budgetReminders: next });
                    showToast(`Budget reminders ${next ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>
            </div>
          )}

          {/* NOTIFICATIONS SECTION */}
          {activeTab === 'notifications' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Notification Preferences</h2>
                <p>Choose what alerts and financial summaries you receive.</p>
              </div>

              <div className={styles.toggleList}>
                <div className={styles.toggleRow}>
                  <div>
                    <h4>Goal Reminders</h4>
                    <p>Alerts when you reach milestones or get off-track on your savings goals.</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.goalReminders}
                    onChange={(next) => {
                      updateNotifications({ goalReminders: next });
                      showToast(`Goal reminders ${next ? 'enabled' : 'disabled'}`);
                    }}
                  />
                </div>

                <div className={styles.divider} />

                <div className={styles.toggleRow}>
                  <div>
                    <h4>Scam & Fraud Alerts</h4>
                    <p>High-priority notifications when suspicious transactions or scams are detected.</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.scamAlerts}
                    onChange={(next) => {
                      updateNotifications({ scamAlerts: next });
                      showToast(`Scam alerts ${next ? 'enabled' : 'disabled'}`);
                    }}
                  />
                </div>

                <div className={styles.divider} />

                <div className={styles.toggleRow}>
                  <div>
                    <h4>Weekly Financial Summary</h4>
                    <p>Receive a weekly digest summarizing your net portfolio and goal progress.</p>
                  </div>
                  <ToggleSwitch
                    checked={notifications.weeklySummary}
                    onChange={(next) => {
                      updateNotifications({ weeklySummary: next });
                      showToast(`Weekly summary ${next ? 'enabled' : 'disabled'}`);
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECURITY SECTION */}
          {activeTab === 'security' && (
            <div className={styles.cardStack}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Change Password</h2>
                  <p>Ensure your account is protected with a strong password.</p>
                </div>

                <form onSubmit={handleChangePassword} className={styles.formStack}>
                  {passwordError && (
                    <div className={styles.alertDanger}>
                      <AlertCircle size={16} />
                      <span>{passwordError}</span>
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className={styles.alertSuccess}>
                      <Check size={16} />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}

                  <div className={styles.inputGroup}>
                    <label htmlFor="currentPass">Current Password</label>
                    <input
                      id="currentPass"
                      type="password"
                      placeholder="••••••••"
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        setPasswordForm({ ...passwordForm, currentPassword: e.target.value })
                      }
                    />
                  </div>

                  <div className={styles.formGrid}>
                    <div className={styles.inputGroup}>
                      <label htmlFor="newPass">New Password</label>
                      <input
                        id="newPass"
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.newPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, newPassword: e.target.value })
                        }
                      />
                    </div>

                    <div className={styles.inputGroup}>
                      <label htmlFor="confirmPass">Confirm New Password</label>
                      <input
                        id="confirmPass"
                        type="password"
                        placeholder="••••••••"
                        value={passwordForm.confirmPassword}
                        onChange={(e) =>
                          setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className={styles.formActions}>
                    <button type="submit" className={styles.saveBtn}>
                      Update Password
                    </button>
                  </div>
                </form>
              </div>

              <div className={styles.card}>
                <div className={styles.cardHeaderBetween}>
                  <div>
                    <h2>Active Sessions</h2>
                    <p>Devices currently authenticated to your account.</p>
                  </div>
                  {sessions.length > 1 && (
                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      onClick={triggerLogoutAllSessions}
                    >
                      <LogOut size={14} />
                      <span>Log out from all other devices</span>
                    </button>
                  )}
                </div>

                <div className={styles.sessionList}>
                  {sessions.map((session) => (
                    <div key={session.id} className={styles.sessionItem}>
                      <div className={styles.sessionIcon}>
                        {session.device.toLowerCase().includes('mobile') ? (
                          <Smartphone size={20} />
                        ) : (
                          <Laptop size={20} />
                        )}
                      </div>

                      <div className={styles.sessionInfo}>
                        <div className={styles.sessionTitleRow}>
                          <span className={styles.sessionDevice}>{session.device}</span>
                          {session.isCurrent && (
                            <span className={styles.currentBadge}>Current Device</span>
                          )}
                        </div>
                        <span className={styles.sessionMeta}>
                          {session.location} • {session.ip} • {session.lastActive}
                        </span>
                      </div>

                      {!session.isCurrent && (
                        <button
                          type="button"
                          className={styles.sessionTerminateBtn}
                          onClick={() => {
                            terminateSession(session.id);
                            showToast('Session terminated');
                          }}
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PERFORMANCE SECTION */}
          {activeTab === 'appearance' && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2>Performance Mode</h2>
                <p>Optimize application motion, rendering speed, and interface responsiveness.</p>
              </div>

              <div className={styles.toggleRow}>
                <div>
                  <h4>Reduce Animations & Improve Performance</h4>
                  <p>Completely disables background motion, transition delays, and GPU rendering effects to eliminate lag and maximize speed on low-end devices.</p>
                </div>
                <ToggleSwitch
                  ariaLabel="Reduce Animations & Improve Performance"
                  checked={appearance.reduceAnimations}
                  onChange={(next) => {
                    updateAppearance({ reduceAnimations: next });
                    showToast(`Performance mode ${next ? 'enabled' : 'disabled'}`);
                  }}
                />
              </div>
            </div>
          )}

          {/* PRIVACY SECTION */}
          {activeTab === 'privacy' && (
            <div className={styles.cardStack}>
              <div className={styles.card}>
                <div className={styles.cardHeader}>
                  <h2>Privacy & Data Controls</h2>
                  <p>Manage stored data and conversation logs.</p>
                </div>

                <div className={styles.actionRow}>
                  <div>
                    <h4>Clear Chat History</h4>
                    <p>Permanently remove all cached chats and AI Mentor messages.</p>
                  </div>
                  <button
                    type="button"
                    className={styles.secondaryBtn}
                    onClick={triggerClearHistory}
                  >
                    <Trash2 size={16} />
                    <span>Clear Chat History</span>
                  </button>
                </div>
              </div>

              <div className={styles.dangerCard}>
                <div className={styles.cardHeader}>
                  <h2 className={styles.dangerHeading}>Danger Zone</h2>
                  <p className={styles.dangerSubheading}>
                    Irreversible actions regarding your Finwise AI account.
                  </p>
                </div>

                <div className={styles.actionRow}>
                  <div>
                    <h4>Delete Account</h4>
                    <p>Erase all account settings, goals, financial preferences, and profile data.</p>
                  </div>
                  <button
                    type="button"
                    className={styles.dangerBtn}
                    onClick={triggerDeleteAccount}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalState.isOpen}
        title={modalState.title}
        description={modalState.description}
        isDanger={modalState.isDanger}
        confirmLabel={modalState.confirmLabel}
        onConfirm={modalState.onConfirm}
        onClose={() => setModalState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
}
