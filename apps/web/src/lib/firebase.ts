import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyAsb_Q0OIJK5_sqf3Hkbe3n26Mq41hFAig",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "finwise-f5bc5.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "finwise-f5bc5",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "finwise-f5bc5.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "1061503898931",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:1061503898931:web:42d9226b6286aac17dda46",
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
