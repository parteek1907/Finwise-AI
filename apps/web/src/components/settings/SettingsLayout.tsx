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
  Zap,
  CreditCard,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Loader2,
  Download,
  RotateCcw
} from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useAppStore } from '@/store/useAppStore';
import { auth } from '@/lib/firebase';
import { ConfirmationModal } from '@/components/ui/ConfirmationModal';
import { PayUCheckoutModal, CheckoutPlan } from '@/components/payment/PayUCheckoutModal';
import { SubscriptionCancelModal, SubscriptionData } from '@/components/subscription/SubscriptionCancelModal';
import { downloadReceiptPdf } from '@/utils/generateReceiptPdf';
import { motion } from 'framer-motion';
import styles from './Settings.module.css';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { useRouter } from 'next/navigation';

type TabType = 'profile' | 'aiMentor' | 'financial' | 'notifications' | 'security' | 'appearance' | 'privacy' | 'billing';

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
  const router = useRouter();
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
    setSessions,
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

  // Fetch real session data
  useEffect(() => {
    async function fetchSessionData() {
      try {
        let ip = 'Unknown IP';
        let location = profile.location || 'Unknown Location';
        try {
          // Fetch from an API that returns both IP and location
          const res = await fetch('https://ipapi.co/json/');
          if (res.ok) {
            const data = await res.json();
            ip = data.ip || ip;
            if (!profile.location && data.city && data.country_name) {
              location = `${data.city}, ${data.country_name}`;
            }
          } else {
            // Fallback to ipify if ipapi.co fails (e.g. rate limit)
            const fallbackRes = await fetch('https://api.ipify.org?format=json');
            if (fallbackRes.ok) {
              const fallbackData = await fallbackRes.json();
              ip = fallbackData.ip;
            }
          }
        } catch (e) {
          console.warn('Failed to fetch IP and Location', e);
        }

        let device = 'Unknown Device';
        if (typeof window !== 'undefined') {
          const ua = window.navigator.userAgent;
          let browser = 'Unknown Browser';
          if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
          else if (ua.indexOf('SamsungBrowser') > -1) browser = 'Samsung Internet';
          else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) browser = 'Opera';
          else if (ua.indexOf('Trident') > -1) browser = 'Internet Explorer';
          else if (ua.indexOf('Edge') > -1 || ua.indexOf('Edg') > -1) browser = 'Edge';
          else if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
          else if (ua.indexOf('Safari') > -1) browser = 'Safari';

          let os = 'Unknown OS';
          let isMobile = false;
          if (ua.indexOf('Win') > -1) os = 'Windows';
          else if (ua.indexOf('Mac') > -1 && ua.indexOf('Mobile') === -1) os = 'macOS';
          else if (ua.indexOf('Linux') > -1 && ua.indexOf('Android') === -1) os = 'Linux';
          else if (ua.indexOf('Android') > -1) { os = 'Android'; isMobile = true; }
          else if (ua.indexOf('like Mac') > -1 || (ua.indexOf('Mac') > -1 && ua.indexOf('Mobile') > -1)) { os = 'iOS'; isMobile = true; }

          device = `${browser} on ${os}${isMobile ? ' (Mobile)' : ''}`;
        }

        // Initialize session with IP location or profile location
        const currentSession = {
          id: 'real-session-' + Date.now(),
          device,
          ip,
          location,
          lastActive: 'Active now',
          isCurrent: true,
        };

        // Set it initially
        setSessions([currentSession]);

        // Attempt to get exact physical location if user allows
        if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              try {
                const { latitude, longitude } = position.coords;
                const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
                if (geoRes.ok) {
                  const geoData = await geoRes.json();
                  if (geoData.city) {
                    const exactLocation = `${geoData.city}, ${geoData.countryName || 'India'}`;
                    setSessions([{ ...currentSession, location: exactLocation }]);
                  }
                }
              } catch (e) {
                console.warn('Reverse geocoding failed', e);
              }
            },
            (err) => {
              console.warn('Geolocation permission denied or failed', err);
            },
            { timeout: 5000 }
          );
        }
      } catch (err) {
        console.error('Error fetching session data', err);
      }
    }
    
    // Check if sessions array has mock data or is empty
    if (sessions.length === 0 || sessions.some(s => s.id === 's1')) {
      fetchSessionData();
    }
  }, []); // Run once on mount

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

  // Payment & Billing States
  const [paymentHistory, setPaymentHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [checkoutModalOpen, setCheckoutModalOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<CheckoutPlan | null>(null);

  // Subscription Management States
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionData | null>(null);
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReactivatingSub, setIsReactivatingSub] = useState(false);

  const fetchSubscriptionData = async () => {
    setLoadingSubscription(true);
    try {
      const currentUser = auth.currentUser;
      const headers: Record<string, string> = {};
      if (currentUser) {
        const token = await currentUser.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/subscription/current`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSubscriptionData(data);
      }
    } catch (err) {
      console.error("Failed to load subscription details:", err);
    } finally {
      setLoadingSubscription(false);
    }
  };

  const handleReactivateSubscription = async () => {
    setIsReactivatingSub(true);
    try {
      const currentUser = auth.currentUser;
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (currentUser) {
        const token = await currentUser.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/subscription/reactivate`, {
        method: "POST",
        headers
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Your subscription has been successfully reactivated!");
        await fetchSubscriptionData();
        await useAppStore.getState().syncEntitlements();
      } else {
        showToast(data.detail || "Failed to reactivate subscription.");
      }
    } catch (err) {
      console.error("Error reactivating subscription:", err);
      showToast("Network error. Please try again.");
    } finally {
      setIsReactivatingSub(false);
    }
  };

  const [isDevResetting, setIsDevResetting] = useState(false);

  const handleDevReset = async () => {
    if (!window.confirm("Developer Test Reset:\n\nImmediately cancel all active subscriptions, revert tier to Free Foundation, and clear all payment history records so you can test payment again from scratch?\n\nProceed?")) {
      return;
    }

    setIsDevResetting(true);
    try {
      const currentUser = auth.currentUser;
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (currentUser) {
        const token = await currentUser.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`/api/subscription/dev-reset`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          user_id: currentUser?.uid || appUser.id || "demo_user",
          email: currentUser?.email || profile.email || appUser.email || ""
        })
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        // Immediately reset local store user tier to Foundation
        useAppStore.getState().updateUser({
          tier: 'FOUNDATION',
          subscriptionPlan: 'FOUNDATION',
          subscriptionStatus: 'inactive',
          subscriptionExpiresAt: null,
          purchasedItems: []
        });

        // Immediately clear payment history table and close any cancel modal
        setPaymentHistory([]);
        setIsCancelModalOpen(false);

        showToast("✓ Developer Reset: All subscriptions cancelled & payment history cleared! You can test payment again.");
        await Promise.allSettled([
          useAppStore.getState().syncEntitlements(),
          fetchSubscriptionData(),
          fetchPaymentHistory()
        ]);
      } else {
        showToast(data.detail || "Failed to reset billing test data.");
      }
    } catch (err: any) {
      console.error("Error during dev reset:", err);
      showToast(err.message || "Failed to reset billing test data.");
    } finally {
      setIsDevResetting(false);
    }
  };

  const fetchPaymentHistory = async () => {
    setLoadingHistory(true);
    try {
      const currentUser = auth.currentUser;
      const headers: Record<string, string> = {};
      if (currentUser) {
        const token = await currentUser.getIdToken();
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch(`/api/payment/history`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPaymentHistory(data.payments || []);
      }
    } catch (err) {
      console.error("Failed to load payment history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'billing') {
      fetchPaymentHistory();
      fetchSubscriptionData();
      useAppStore.getState().syncEntitlements();
    }
  }, [activeTab]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (usr) => {
      if (usr && activeTab === 'billing') {
        fetchPaymentHistory();
        fetchSubscriptionData();
      }
    });
    return () => unsub();
  }, [activeTab]);

  // Handle returning from login with ?openPlan=
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const openPlanParam = params.get("openPlan");
      if (openPlanParam) {
        setActiveTab("billing");
        const planDefs: Record<string, CheckoutPlan> = {
          PREMIUM_MONTHLY: {
            id: "PREMIUM_MONTHLY",
            name: "FinWise Premium (Monthly)",
            amount: 299,
            period: "month",
            features: [
              "All AI Mentors, unlocked with no query limits",
              "Real-time Scam Shield & Fraud detection",
              "Live Trading Labs & Candlestick simulator",
              "Emotion AI behavioral bias tracking",
            ],
            description: "Flexible monthly subscription & cancel anytime.",
          },
          PREMIUM_YEARLY: {
            id: "PREMIUM_YEARLY",
            name: "FinWise Premium (Yearly)",
            amount: 2799,
            period: "year",
            features: [
              "Everything in Premium Monthly",
              "All 10 Courses & Final Exam Master Access",
              "Verified FinWise Completion Certificate",
              "Priority AI mentor speed & deep analysis",
            ],
            description: "Commit for a year with 22% annual savings.",
          },
          STUDENT_MONTHLY: {
            id: "STUDENT_MONTHLY",
            name: "FinWise Student Pass (Monthly)",
            amount: 149,
            period: "month",
            features: [
              "Full Financial Academy courses & quizzes",
              "Interactive Trading Simulations",
              "Story simulations & gamified quests",
              "Leaderboards & community challenges",
            ],
            description: "Flexible academic monthly subscription.",
          },
          STUDENT_YEARLY: {
            id: "STUDENT_YEARLY",
            name: "FinWise Student Pass (Yearly)",
            amount: 1399,
            period: "year",
            features: [
              "Everything in Student Monthly",
              "All Academic Certifications & Exams",
              "Interactive Trading Simulations",
              "Save 22% compared to monthly renewal",
            ],
            description: "Commit for a year with 22% academic savings.",
          },
          TRADING_LABS_PASS: {
            id: "TRADING_LABS_PASS",
            name: "Trading Labs Pass (Lifetime)",
            amount: 199,
            period: "lifetime",
            features: [
              "Stock Market Basics Simulator",
              "Interactive Candlestick pattern recognition",
              "Virtual portfolio order execution",
              "Real-time simulated price feeds",
            ],
            description: "One-time standalone lab pass for practical trading.",
          },
        };

        if (planDefs[openPlanParam]) {
          setSelectedPlanForCheckout(planDefs[openPlanParam]);
          setCheckoutModalOpen(true);
        }
      }
    }
  }, []);

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
        useAppStore.getState().resetStore();
        terminateAllOtherSessions();
        showToast('Logged out of all other devices');
      },
    });
  };

  const tabs = [
    { id: 'profile' as TabType, label: 'Profile', icon: User },
    { id: 'billing' as TabType, label: 'Billing & Plans', icon: CreditCard },
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

          {/* BILLING & PLANS SECTION */}
          {activeTab === 'billing' && (
            <div className={styles.cardStack}>
              {/* MANAGE SUBSCRIPTION CARD */}
              <div className={styles.billingCurrentCard}>
                <div className={styles.billingCurrentHeader}>
                  <div>
                    <span className={`${styles.billingTierPill} ${
                      appUser.tier === 'PREMIUM' 
                        ? styles.billingTierPillPremium 
                        : appUser.tier === 'STUDENT' 
                        ? styles.billingTierPillStudent 
                        : ''
                    }`}>
                      <Sparkles size={14} />
                      {appUser.tier || 'FOUNDATION'} TIER
                    </span>
                    <h2 className={styles.billingCurrentTitle}>
                      {subscriptionData?.plan_name || (
                        appUser.tier === 'PREMIUM'
                          ? 'FinWise Premium Membership'
                          : appUser.tier === 'STUDENT'
                          ? 'Student Academic Pass'
                          : 'Free Foundation Plan'
                      )}
                    </h2>
                    <p className={styles.billingCurrentSubtitle}>
                      {subscriptionData?.status === 'cancels_at_period_end'
                        ? 'Cancellation is scheduled. You retain full access to all premium features until your paid period ends.'
                        : appUser.tier === 'PREMIUM'
                        ? 'Unlimited access to all AI Mentors, Scam Shield, Emotion AI, and Live Trading Labs.'
                        : appUser.tier === 'STUDENT'
                        ? 'Academic learning modules and story simulations active.'
                        : 'Essential learning modules active. Upgrade to unlock unlimited AI and Trading Labs.'}
                    </p>
                  </div>
                  <div className={styles.billingCurrentStatusWrap}>
                    {subscriptionData?.status === 'cancels_at_period_end' ? (
                      <span className={styles.billingStatusBadgeCancelling}>
                        <Clock size={14} />
                        Cancels at Period End
                      </span>
                    ) : subscriptionData?.status === 'expired' ? (
                      <span className={styles.billingStatusBadgeExpired}>
                        <AlertCircle size={14} />
                        Expired
                      </span>
                    ) : (
                      <span className={styles.billingStatusBadge}>
                        <span className={styles.billingStatusDot} />
                        {appUser.subscriptionStatus === 'active' && appUser.tier !== 'FOUNDATION'
                          ? 'Active Subscription'
                          : 'Free Tier'}
                      </span>
                    )}

                    {subscriptionData?.expires_at ? (
                      <p className={styles.billingRenewsText} suppressHydrationWarning>
                        {subscriptionData.status === 'cancels_at_period_end'
                          ? `Access until: ${new Date(subscriptionData.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                          : subscriptionData.auto_renew
                          ? `Renews: ${new Date(subscriptionData.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`
                          : `Expires: ${new Date(subscriptionData.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                      </p>
                    ) : appUser.subscriptionExpiresAt ? (
                      <p className={styles.billingRenewsText} suppressHydrationWarning>
                        Renews: {new Date(appUser.subscriptionExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    ) : null}
                  </div>
                </div>

                {/* Actual Real Subscription Details Grid */}
                <div className={styles.subscriptionMetaGrid}>
                  <div className={styles.subMetaItem}>
                    <span className={styles.subMetaLabel}>Current Plan</span>
                    <span className={styles.subMetaVal}>
                      {subscriptionData?.period === 'year'
                        ? 'Annual Plan'
                        : subscriptionData?.period === 'month'
                        ? 'Monthly Plan'
                        : subscriptionData?.is_lifetime
                        ? 'Lifetime Pass'
                        : appUser.tier === 'PREMIUM'
                        ? 'Monthly Plan'
                        : 'Free Tier'}
                    </span>
                    <span className={styles.subMetaValSmall}>
                      {subscriptionData?.plan_name || (appUser.tier === 'PREMIUM' ? 'FinWise Premium' : 'Foundation')}
                    </span>
                  </div>

                  <div className={styles.subMetaItem}>
                    <span className={styles.subMetaLabel}>Amount & Frequency</span>
                    <span className={styles.subMetaVal}>
                      {subscriptionData?.amount
                        ? `₹${subscriptionData.amount} / ${subscriptionData.period || 'mo'}`
                        : appUser.tier === 'PREMIUM'
                        ? '₹499 / mo'
                        : appUser.tier === 'STUDENT'
                        ? '₹149 / mo'
                        : '₹0 (Free)'}
                    </span>
                    <span className={styles.subMetaValSmall}>
                      {subscriptionData?.is_lifetime
                        ? 'One-time payment'
                        : subscriptionData?.status === 'cancels_at_period_end'
                        ? 'Renewal stopped'
                        : subscriptionData?.auto_renew
                        ? 'Automatic renewal'
                        : 'Fixed period access'}
                    </span>
                  </div>

                  <div className={styles.subMetaItem}>
                    <span className={styles.subMetaLabel}>Activation Date</span>
                    <span className={styles.subMetaVal} suppressHydrationWarning>
                      {subscriptionData?.activated_at
                        ? new Date(subscriptionData.activated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : subscriptionData?.created_at
                        ? new Date(subscriptionData.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'Active since signup'}
                    </span>
                    <span className={styles.subMetaValSmall}>
                      {subscriptionData?.latest_payment ? 'Verified via PayU' : 'Account default'}
                    </span>
                  </div>

                  <div className={styles.subMetaItem}>
                    <span className={styles.subMetaLabel}>
                      {subscriptionData?.status === 'cancels_at_period_end'
                        ? 'Access Through'
                        : subscriptionData?.auto_renew
                        ? 'Next Renewal'
                        : 'Expiry Date'}
                    </span>
                    <span className={styles.subMetaVal} suppressHydrationWarning>
                      {subscriptionData?.expires_at
                        ? new Date(subscriptionData.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : appUser.subscriptionExpiresAt
                        ? new Date(appUser.subscriptionExpiresAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                        : 'No expiration'}
                    </span>
                    <span className={styles.subMetaValSmall}>
                      {subscriptionData?.status === 'cancels_at_period_end'
                        ? 'No charges on expiry'
                        : subscriptionData?.auto_renew
                        ? 'Standard billing cycle'
                        : 'Access granted'}
                    </span>
                  </div>
                </div>

                {/* If Cancelling Notice Banner */}
                {subscriptionData?.status === 'cancels_at_period_end' && (
                  <div className={styles.subscriptionNoticeBanner}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <AlertCircle size={18} color="#D97706" style={{ flexShrink: 0 }} />
                      <div>
                        <strong>Cancellation scheduled:</strong> Your subscription will end on{' '}
                        {subscriptionData?.expires_at
                          ? new Date(subscriptionData.expires_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                          : 'the end of your period'}
                        . No further renewal charges will be made. You retain full access to all features until then.
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.reactivateSubBtn}
                      onClick={handleReactivateSubscription}
                      disabled={isReactivatingSub}
                    >
                      {isReactivatingSub ? <Loader2 size={14} className={styles.spinner} /> : <CheckCircle2 size={14} />}
                      Reactivate Subscription
                    </button>
                  </div>
                )}

                {/* Available Management Actions */}
                <div className={styles.manageActionsRow}>
                  <div className={styles.manageActionsLeft}>
                    {/* If Active Paid Subscription */}
                    {subscriptionData?.can_cancel && (
                      <button
                        type="button"
                        className={styles.cancelSubBtn}
                        onClick={() => setIsCancelModalOpen(true)}
                        id="cancel-subscription-btn"
                      >
                        Cancel Subscription
                      </button>
                    )}

                    {/* Developer Instant Cancel & Reset Action - properly integrated & discrete */}
                    <button
                      type="button"
                      id="dev-cancel-subs-btn"
                      className={styles.devCancelBtn}
                      onClick={handleDevReset}
                      disabled={isDevResetting}
                      title="[Dev Tool] Instantly cancel all subscriptions, revert tier to Free Foundation, and clear payment history so you can test payment again."
                    >
                      <RotateCcw size={12} style={{ animation: isDevResetting ? 'spin 1s linear infinite' : 'none' }} />
                      <span>{subscriptionData?.has_subscription ? 'Dev Instant Cancel' : 'Dev Reset Billing'}</span>
                    </button>

                    {/* Switch to Annual Offer if on monthly */}
                    {subscriptionData?.can_cancel && subscriptionData?.period === 'month' && (
                      <button
                        type="button"
                        className={styles.switchAnnualSubBtn}
                        onClick={() => {
                          const annualPlan: CheckoutPlan = {
                            id: "PREMIUM_YEARLY",
                            name: "FinWise Premium (Yearly)",
                            amount: 2799,
                            period: "year",
                            features: [
                              "Everything in Premium Monthly",
                              "All 10 Courses & Final Exam Master Access",
                              "Verified FinWise Completion Certificate",
                              "Priority AI mentor speed & deep analysis",
                            ],
                            description: "Commit for a year with 22% annual savings.",
                          };
                          setSelectedPlanForCheckout(annualPlan);
                          setCheckoutModalOpen(true);
                        }}
                      >
                        <Sparkles size={14} />
                        Switch to Annual (Save 22%)
                      </button>
                    )}

                    {/* If Cancelling, allow Reactivate */}
                    {subscriptionData?.can_reactivate && (
                      <button
                        type="button"
                        className={styles.reactivateSubBtn}
                        onClick={handleReactivateSubscription}
                        disabled={isReactivatingSub}
                      >
                        {isReactivatingSub ? <Loader2 size={14} className={styles.spinner} /> : <CheckCircle2 size={14} />}
                        Reactivate Subscription
                      </button>
                    )}

                    {/* If Free Tier, prompt Upgrade */}
                    {(!subscriptionData?.has_subscription || appUser.tier === 'FOUNDATION') && (
                      <button
                        type="button"
                        className={styles.reactivateSubBtn}
                        onClick={() => {
                          const premiumMonthly: CheckoutPlan = {
                            id: "PREMIUM_MONTHLY",
                            name: "FinWise Premium (Monthly)",
                            amount: 299,
                            period: "month",
                            features: [
                              "All AI Mentors, unlocked with no query limits",
                              "Real-time Scam Shield & Fraud detection",
                              "Live Trading Labs & Candlestick simulator",
                              "Emotion AI behavioral bias tracking",
                            ],
                            description: "Flexible monthly subscription & cancel anytime.",
                          };
                          setSelectedPlanForCheckout(premiumMonthly);
                          setCheckoutModalOpen(true);
                        }}
                      >
                        <Sparkles size={14} />
                        Upgrade to Premium
                      </button>
                    )}
                  </div>

                  <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                    Secured by PayU Payment Gateway • Idempotent Billing
                  </span>
                </div>

                <div className={styles.billingFeaturesList}>
                  <div className={styles.billingFeatureItem}>
                    <CheckCircle2 size={16} color="#19533B" />
                    <span>AI Mentor: <strong>{appUser.tier === 'PREMIUM' ? 'Unlimited queries' : '5 queries/day'}</strong></span>
                  </div>
                  <div className={styles.billingFeatureItem}>
                    <CheckCircle2 size={16} color="#19533B" />
                    <span>Scam Shield: <strong>{appUser.tier === 'PREMIUM' ? 'Unlimited scans' : '5 scans/day'}</strong></span>
                  </div>
                  <div className={styles.billingFeatureItem}>
                    <CheckCircle2 size={16} color="#19533B" />
                    <span>Live Trading Labs: <strong>{appUser.tier === 'PREMIUM' || appUser.tier === 'STUDENT' ? 'Unlocked & Active' : 'Requires Pass'}</strong></span>
                  </div>
                  <div className={styles.billingFeatureItem}>
                    <CheckCircle2 size={16} color="#19533B" />
                    <span>Emotion AI Biases: <strong>{appUser.tier === 'PREMIUM' ? 'Unlocked' : 'Locked'}</strong></span>
                  </div>
                </div>
              </div>

              {/* PLANS GRID */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                      Available Membership Plans & Passes
                    </h3>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
                      Choose your plan or switch anytime. All transactions are securely processed via PayU.
                    </p>
                  </div>
                </div>

                <div className={styles.plansGrid}>
                  {/* Plan 1: Premium Monthly */}
                  {(() => {
                    const isCurrent = appUser.tier === 'PREMIUM' && (appUser.subscriptionPlan === 'PREMIUM_MONTHLY' || !appUser.subscriptionPlan || appUser.subscriptionPlan === 'PREMIUM');
                    const isYearlyActive = appUser.tier === 'PREMIUM' && appUser.subscriptionPlan === 'PREMIUM_YEARLY';

                    return (
                      <div className={`${styles.planCardItem} ${isCurrent ? styles.planCardActive : ''}`}>
                        {isCurrent && (
                          <span className={styles.currentTierBadge}>
                            <Sparkles size={13} />
                            CURRENT TIER
                          </span>
                        )}
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#111827' }}>Premium Monthly</h4>
                          </div>
                          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>Flexible monthly subscription</p>
                          {isCurrent && (
                            <div className={styles.currentPlanStatusText}>
                              <CheckCircle2 size={13} />
                              <span>Active Subscription</span>
                            </div>
                          )}
                          <div className={styles.planCardPrice}>
                            ₹299 <span>/ month</span>
                          </div>
                          <ul className={styles.planFeaturesUl}>
                            <li className={styles.planFeatureLi}><Check size={14} color="#19533B" /> Unlimited AI Financial Mentor</li>
                            <li className={styles.planFeatureLi}><Check size={14} color="#19533B" /> Real-time Scam & Fraud Shield</li>
                            <li className={styles.planFeatureLi}><Check size={14} color="#19533B" /> Full Live Trading Labs & Simulator</li>
                            <li className={styles.planFeatureLi}><Check size={14} color="#19533B" /> Emotion AI Behavioral Tracking</li>
                          </ul>
                        </div>
                        {isCurrent ? (
                          <button
                            type="button"
                            className={styles.currentPlanBtn}
                            disabled
                          >
                            <CheckCircle2 size={16} />
                            Current Plan Active
                          </button>
                        ) : isYearlyActive ? (
                          <button
                            type="button"
                            className={styles.planCtaIncluded}
                            disabled
                          >
                            <Check size={16} />
                            Included in Yearly VIP
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={styles.planCtaBtn}
                            onClick={() => {
                              setSelectedPlanForCheckout({
                                id: 'PREMIUM_MONTHLY',
                                name: 'FinWise Premium (Monthly)',
                                amount: 299,
                                period: 'month',
                                features: ['Unlimited AI Mentor', 'Scam Shield', 'Live Trading Labs', 'Emotion AI'],
                                description: 'Full monthly access to all FinWise premium features.'
                              });
                              setCheckoutModalOpen(true);
                            }}
                          >
                            <CreditCard size={16} />
                            Upgrade (₹299)
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {/* Plan 2: Premium Yearly */}
                  {(() => {
                    const isCurrent = appUser.tier === 'PREMIUM' && appUser.subscriptionPlan === 'PREMIUM_YEARLY';
                    const isMonthlyActive = appUser.tier === 'PREMIUM' && (appUser.subscriptionPlan === 'PREMIUM_MONTHLY' || !appUser.subscriptionPlan || appUser.subscriptionPlan === 'PREMIUM');

                    return (
                      <div className={`${styles.planCardItem} ${styles.planCardPopular} ${isCurrent ? styles.planCardActive : ''}`}>
                        {isCurrent ? (
                          <>
                            <span className={styles.currentTierBadge}>
                              <Sparkles size={13} />
                              CURRENT TIER
                            </span>
                            <span className={styles.planPopularBadge}>Best Value</span>
                          </>
                        ) : (
                          <span className={styles.planPopularBadge}>Best Value • Save 22%</span>
                        )}
                        <div>
                          <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#111827' }}>Premium Yearly</h4>
                          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>All-inclusive annual membership</p>
                          {isCurrent && (
                            <div className={styles.currentPlanStatusText}>
                              <CheckCircle2 size={13} />
                              <span>Active Annual VIP</span>
                            </div>
                          )}
                          <div className={styles.planCardPrice}>
                            ₹2,799 <span>/ year</span>
                          </div>
                          <ul className={styles.planFeaturesUl}>
                            <li className={styles.planFeatureLi}><Check size={14} color="#19533B" /> Everything in Premium Monthly</li>
                            <li className={styles.planFeatureLi}><Check size={14} color="#19533B" /> Priority AI processing & advice</li>
                            <li className={styles.planFeatureLi}><Check size={14} color="#19533B" /> All 10 Courses & Final Exam Master</li>
                            <li className={styles.planFeatureLi}><Check size={14} color="#19533B" /> Verified FinWise Completion Badge</li>
                          </ul>
                        </div>
                        {isCurrent ? (
                          <button
                            type="button"
                            className={styles.currentPlanBtn}
                            disabled
                          >
                            <CheckCircle2 size={16} />
                            Current Plan Active
                          </button>
                        ) : isMonthlyActive ? (
                          <button
                            type="button"
                            className={styles.planCtaBtn}
                            onClick={() => {
                              setSelectedPlanForCheckout({
                                id: 'PREMIUM_YEARLY',
                                name: 'FinWise Premium (Yearly)',
                                amount: 2799,
                                period: 'year',
                                features: ['Full Ecosystem Access', 'Priority AI Mentor', 'All Labs & Certifications'],
                                description: 'Annual VIP access with 22% discount.'
                              });
                              setCheckoutModalOpen(true);
                            }}
                          >
                            <Sparkles size={16} />
                            Switch to Yearly (Save 22%)
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={styles.planCtaBtn}
                            onClick={() => {
                              setSelectedPlanForCheckout({
                                id: 'PREMIUM_YEARLY',
                                name: 'FinWise Premium (Yearly)',
                                amount: 2799,
                                period: 'year',
                                features: ['Full Ecosystem Access', 'Priority AI Mentor', 'All Labs & Certifications'],
                                description: 'Annual VIP access with 22% discount.'
                              });
                              setCheckoutModalOpen(true);
                            }}
                          >
                            <Sparkles size={16} />
                            Upgrade Yearly (₹2,799)
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {/* Plan 3: Student Pass */}
                  {(() => {
                    const isCurrent = appUser.tier === 'STUDENT';
                    const isPremiumActive = appUser.tier === 'PREMIUM';

                    return (
                      <div className={`${styles.planCardItem} ${isCurrent ? styles.planCardActive : ''}`}>
                        {isCurrent && (
                          <span className={styles.currentTierBadge}>
                            <Sparkles size={13} />
                            CURRENT TIER
                          </span>
                        )}
                        <div>
                          <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#111827' }}>Student Pass</h4>
                          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>Special academic discount</p>
                          {isCurrent && (
                            <div className={styles.currentPlanStatusText}>
                              <CheckCircle2 size={13} />
                              <span>Active Academic Tier</span>
                            </div>
                          )}
                          <div className={styles.planCardPrice}>
                            ₹149 <span>/ month</span>
                          </div>
                          <ul className={styles.planFeaturesUl}>
                            <li className={styles.planFeatureLi}><Check size={14} color="#19533B" /> Full Financial Academy modules</li>
                            <li className={styles.planFeatureLi}><Check size={14} color="#19533B" /> Interactive Trading Simulations</li>
                            <li className={styles.planFeatureLi}><Check size={14} color="#19533B" /> Quests, Badges & Leaderboard</li>
                          </ul>
                        </div>
                        {isCurrent ? (
                          <button
                            type="button"
                            className={styles.currentPlanBtn}
                            disabled
                          >
                            <CheckCircle2 size={16} />
                            Current Plan Active
                          </button>
                        ) : isPremiumActive ? (
                          <button
                            type="button"
                            className={styles.planCtaIncluded}
                            disabled
                          >
                            <Check size={16} />
                            Included with Premium
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={`${styles.planCtaBtn} ${styles.planCtaSecondary}`}
                            onClick={() => {
                              setSelectedPlanForCheckout({
                                id: 'STUDENT_MONTHLY',
                                name: 'FinWise Student Pass (Monthly)',
                                amount: 149,
                                period: 'month',
                                features: ['All Courses Unlocked', 'Trading Labs Pass', 'Certification Exams'],
                                description: 'Affordable academic plan for students.'
                              });
                              setCheckoutModalOpen(true);
                            }}
                          >
                            <CreditCard size={16} />
                            Get Student Pass (₹149)
                          </button>
                        )}
                      </div>
                    );
                  })()}

                  {/* Plan 4: Trading Labs Pass */}
                  {(() => {
                    const isPremiumActive = appUser.tier === 'PREMIUM';
                    const isStudentActive = appUser.tier === 'STUDENT';
                    const hasStandalonePass = appUser.purchasedItems?.includes('TRADING_LABS_PASS') ?? false;

                    return (
                      <div className={`${styles.planCardItem} ${hasStandalonePass && !isPremiumActive && !isStudentActive ? styles.planCardActive : ''}`}>
                        {isPremiumActive ? (
                          <span className={styles.planUnlockedBadge}>
                            <Check size={12} />
                            Unlocked with Premium
                          </span>
                        ) : isStudentActive ? (
                          <span className={styles.planUnlockedBadge}>
                            <Check size={12} />
                            Included in Student Pass
                          </span>
                        ) : hasStandalonePass ? (
                          <span className={styles.currentTierBadge}>
                            <Check size={13} />
                            ACTIVE PASS
                          </span>
                        ) : null}
                        <div>
                          <h4 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: '#111827' }}>Trading Labs Pass</h4>
                          <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>One-time standalone lab pass</p>
                          {(isPremiumActive || isStudentActive || hasStandalonePass) && (
                            <div className={styles.currentPlanStatusText}>
                              <CheckCircle2 size={13} />
                              <span>Labs Unlocked & Active</span>
                            </div>
                          )}
                          <div className={styles.planCardPrice}>
                            ₹199 <span>/ one-time</span>
                          </div>
                          <ul className={styles.planFeaturesUl}>
                            <li className={styles.planFeatureLi}><Check size={14} color="#19533B" /> Stock Market Basics Lab</li>
                            <li className={styles.planFeatureLi}><Check size={14} color="#19533B" /> Candlestick Analysis Simulator</li>
                            <li className={styles.planFeatureLi}><Check size={14} color="#19533B" /> Virtual Trading Portfolio</li>
                          </ul>
                        </div>
                        {isPremiumActive ? (
                          <button
                            type="button"
                            className={styles.planCtaIncluded}
                            disabled
                          >
                            <Check size={16} />
                            Unlocked with Premium
                          </button>
                        ) : isStudentActive ? (
                          <button
                            type="button"
                            className={styles.planCtaIncluded}
                            disabled
                          >
                            <Check size={16} />
                            Included in Student Pass
                          </button>
                        ) : hasStandalonePass ? (
                          <button
                            type="button"
                            className={styles.currentPlanBtn}
                            disabled
                          >
                            <CheckCircle2 size={16} />
                            Pass Active & Unlocked
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={`${styles.planCtaBtn} ${styles.planCtaSecondary}`}
                            onClick={() => {
                              setSelectedPlanForCheckout({
                                id: 'TRADING_LABS_PASS',
                                name: 'Live Trading Labs & Simulator Pass',
                                amount: 199,
                                period: 'lifetime',
                                features: ['Stock Market Basics Lab', 'Candlestick Analysis', 'Virtual Order Execution'],
                                description: 'One-time unlock for all interactive live trading labs.'
                              });
                              setCheckoutModalOpen(true);
                            }}
                          >
                            <CreditCard size={16} />
                            Unlock Labs (₹199)
                          </button>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* PAYMENT & TRANSACTION HISTORY TABLE */}
              <div className={styles.card}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#111827', margin: 0 }}>
                      Payment History & Receipts
                    </h2>
                    <p style={{ fontSize: '13px', color: '#6B7280', margin: '4px 0 0 0' }}>
                      Verified payment transactions, downloadable official payment receipts, and billing records.
                    </p>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      type="button"
                      id="dev-reset-billing-btn"
                      className={styles.devCancelBtn}
                      onClick={handleDevReset}
                      disabled={isDevResetting}
                      title="[Dev Tool] Immediately cancel all subscriptions, revert tier to Foundation, and clear all payment records so you can test payments again from scratch."
                    >
                      <RotateCcw size={12} style={{ animation: isDevResetting ? 'spin 1s linear infinite' : 'none' }} />
                      <span>{isDevResetting ? 'Resetting...' : 'Clear Test History'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={fetchPaymentHistory}
                      className={styles.secondaryBtn}
                      style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <RefreshCw size={14} style={{ animation: loadingHistory ? 'spin 1s linear infinite' : 'none' }} />
                      Refresh
                    </button>
                  </div>
                </div>

                {paymentHistory.length === 0 ? (
                  <div className={styles.emptyHistory}>
                    <CreditCard size={36} color="#9CA3AF" style={{ margin: '0 auto 12px auto' }} />
                    <p style={{ fontWeight: 600, color: '#374151', margin: '0 0 4px 0' }}>No payment records yet</p>
                    <p style={{ fontSize: '13px', margin: 0 }}>
                      When you activate or renew a subscription plan, your official transaction receipts will appear here.
                    </p>
                  </div>
                ) : (
                  <div className={styles.tableWrapper}>
                    <table className={styles.historyTable}>
                      <thead>
                        <tr>
                          <th>Txn ID</th>
                          <th>Plan</th>
                          <th>Amount</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th>PayU ID</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentHistory.map((p: any) => {
                          const isSuccess = p.status?.toLowerCase() === 'success';
                          const isPending = p.status?.toLowerCase() === 'pending';
                          return (
                            <tr key={p.txnid}>
                              <td style={{ fontFamily: 'monospace', fontWeight: 600, fontSize: '12px' }}>
                                {p.txnid}
                              </td>
                              <td style={{ fontWeight: 500 }}>
                                {p.plan_id}
                              </td>
                              <td style={{ fontWeight: 700 }}>
                                ₹{Number(p.amount).toFixed(2)}
                              </td>
                              <td style={{ color: '#6B7280', fontSize: '12px', whiteSpace: 'nowrap' }} suppressHydrationWarning>
                                {p.created_at ? new Date(p.created_at).toLocaleString() : 'N/A'}
                              </td>
                              <td>
                                <span className={`${styles.statusPill} ${
                                  isSuccess 
                                    ? styles.statusSuccess 
                                    : isPending 
                                    ? styles.statusPending 
                                    : styles.statusFailure
                                }`}>
                                  {isSuccess ? (
                                    <>
                                      <CheckCircle2 size={12} />
                                      SUCCESS
                                    </>
                                  ) : isPending ? (
                                    <>
                                      <Clock size={12} />
                                      PENDING
                                    </>
                                  ) : (
                                    <>
                                      <XCircle size={12} />
                                      {p.status?.toUpperCase() || 'FAILED'}
                                    </>
                                  )}
                                </span>
                              </td>
                              <td style={{ fontFamily: 'monospace', color: '#6B7280', fontSize: '12px' }}>
                                {p.payu_id || p.bank_ref_num || '—'}
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  {isSuccess && (
                                    <button
                                      type="button"
                                      title="Download official PDF receipt"
                                      onClick={() => {
                                        downloadReceiptPdf({
                                          txnid: p.txnid,
                                          receiptNumber: p.receipt_number,
                                          date: p.created_at ? new Date(p.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "N/A",
                                          planName: p.product_name || p.plan_id,
                                          amount: String(p.amount),
                                          currency: "INR",
                                          customerName: p.user_name || profile.name || appUser.name || "FinWise Customer",
                                          customerEmail: p.user_email || profile.email || appUser.email || "",
                                          billingAddress: p.billing_address,
                                          billingCity: p.billing_city,
                                          billingState: p.billing_state,
                                          billingPincode: p.billing_pincode,
                                          billingCountry: p.billing_country || "India",
                                          paymentMethod: p.payment_method || "Online Payment (PayU Gateway)",
                                          payuId: p.payu_id,
                                          bankRef: p.bank_ref_num && p.bank_ref_num !== p.txnid ? p.bank_ref_num : undefined,
                                          status: "success",
                                          verificationUrl: p.receipt_number ? `https://finwise.ai/receipt/verify?id=${encodeURIComponent(p.receipt_number)}` : undefined,
                                        });
                                      }}
                                      style={{
                                        background: '#ECFDF5',
                                        color: '#065F46',
                                        border: '1px solid #A7F3D0',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      <Download size={12} />
                                      PDF
                                    </button>
                                  )}
                                  <button
                                    type="button"
                                    onClick={() => router.push(`/payment/status?txnid=${encodeURIComponent(p.txnid)}&status=${encodeURIComponent(p.status)}`)}
                                    style={{
                                      background: 'transparent',
                                      border: '1px solid #D1D5DB',
                                      padding: '4px 8px',
                                      borderRadius: '6px',
                                      fontSize: '12px',
                                      cursor: 'pointer',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: '4px',
                                      color: '#374151'
                                    }}
                                  >
                                    <ExternalLink size={12} />
                                    View
                                  </button>
                                  {!isSuccess && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setSelectedPlanForCheckout({
                                          id: p.plan_id,
                                          name: p.plan_id,
                                          amount: p.amount,
                                          period: 'subscription',
                                          features: ['Retry previous transaction'],
                                        });
                                        setCheckoutModalOpen(true);
                                      }}
                                      style={{
                                        background: '#19533B',
                                        color: '#FFFFFF',
                                        border: 'none',
                                        padding: '4px 8px',
                                        borderRadius: '6px',
                                        fontSize: '12px',
                                        cursor: 'pointer',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                      }}
                                    >
                                      Retry
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
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

      {/* PayU Test Checkout Modal */}
      {selectedPlanForCheckout && (
        <PayUCheckoutModal
          isOpen={checkoutModalOpen}
          onClose={() => {
            setCheckoutModalOpen(false);
            fetchPaymentHistory();
            fetchSubscriptionData();
          }}
          plan={selectedPlanForCheckout}
        />
      )}

      {/* Subscription Cancellation Flow Modal */}
      <SubscriptionCancelModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onDevReset={handleDevReset}
        subscription={
          subscriptionData || {
            plan_id: (appUser as any).planId || (appUser.tier === 'PREMIUM' ? 'PREMIUM_MONTHLY' : appUser.tier === 'STUDENT' ? 'STUDENT_MONTHLY' : 'FOUNDATION'),
            plan_name: appUser.tier === 'PREMIUM' ? 'FinWise Premium' : appUser.tier === 'STUDENT' ? 'Student Academic Pass' : 'Free Foundation Plan',
            tier: appUser.tier || 'FOUNDATION',
            amount: appUser.tier === 'PREMIUM' ? 299 : appUser.tier === 'STUDENT' ? 149 : 0,
            period: 'month',
            expires_at: appUser.subscriptionExpiresAt,
            activated_at: null,
            status: appUser.subscriptionStatus || 'active'
          }
        }
        onSuccess={async () => {
          setIsCancelModalOpen(false);
          showToast("Cancellation scheduled. Your premium access remains active until the end of the billing period.");
          await fetchSubscriptionData();
          await useAppStore.getState().syncEntitlements();
        }}
      />
    </div>
  );
}
