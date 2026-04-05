// ============================================================
// CloudForge — Firebase Configuration
// JS SDK with explicit browserLocalPersistence for WebView
// ============================================================

import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  browserLocalPersistence,
  type Auth,
} from "firebase/auth";

// IMPORTANT: These are client-side Firebase config values.
// They are NOT secrets — they identify the project to Firebase.
// Security is enforced by Firebase Security Rules, not by hiding these.
// TODO: Replace with CloudForge's own Firebase project config
const firebaseConfig = {
  apiKey: "REPLACE_WITH_YOUR_FIREBASE_API_KEY",
  authDomain: "cloudforge-app.firebaseapp.com",
  projectId: "cloudforge-app",
  storageBucket: "cloudforge-app.firebasestorage.app",
  messagingSenderId: "000000000000",
  appId: "0:000000000000:web:000000000000000000",
};

const app = initializeApp(firebaseConfig);

// Use initializeAuth with explicit persistence instead of getAuth().
// getAuth() uses indexedDB by default, which can fail silently in
// Android WebView. browserLocalPersistence uses localStorage, which
// combined with our @capacitor/preferences UID backup, provides
// resilient auth persistence.
const auth: Auth = initializeAuth(app, {
  persistence: browserLocalPersistence,
});

export { app, auth };
