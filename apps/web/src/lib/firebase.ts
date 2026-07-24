import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAsb_Q0OIJK5_sqf3Hkbe3n26Mq41hFAig",
  authDomain: "finwise-f5bc5.firebaseapp.com",
  projectId: "finwise-f5bc5",
  storageBucket: "finwise-f5bc5.firebasestorage.app",
  messagingSenderId: "1061503898931",
  appId: "1:1061503898931:web:42d9226b6286aac17dda46",
};

// Initialize Firebase only if it hasn't been initialized already
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
