// ============================================================
// CloudForge — Firebase Configuration
// JS SDK with explicit browserLocalPersistence for WebView
// Wiring package (prepared 2026-10-15): structure follows
// ThreatForge's Phase 1 config (Auth + Firestore with a
// persistent local cache, exported as `db`).
//
// Values below are CloudForge's own, from its Firebase project
// "cloudforge-app" (created 2026-10-15; Anonymous Auth enabled,
// Firestore created in nam5, Spark plan). The web app's SDK config
// is used here, matching ThreatForge's convention. Every value is
// project-specific — do NOT copy ThreatForge's values.
// ============================================================

import { initializeApp } from "firebase/app";
import {
  initializeAuth,
  browserLocalPersistence,
  type Auth,
} from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  type Firestore,
} from "firebase/firestore";

// IMPORTANT: These are client-side Firebase config values.
// They are NOT secrets — they identify the project to Firebase.
// Security is enforced by Firebase Security Rules, not by hiding these.
const firebaseConfig = {
  apiKey: "AIzaSyDZEGkYnfBsPvoZ7R3Au9Oh3JKL7awy8UY",
  authDomain: "cloudforge-app.firebaseapp.com",
  projectId: "cloudforge-app",
  storageBucket: "cloudforge-app.firebasestorage.app",
  messagingSenderId: "337133138700",
  appId: "1:337133138700:web:811ffebb43d0e37f6d4f29",
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

// Firestore with a persistent local cache: reads stay fast and writes
// queue automatically while offline, syncing when connectivity returns.
// Must be initialized here (before any other Firestore usage).
// NOTE: CloudForge does not have a sync service yet — this export is
// what a Phase 1-style sync service (users/{uid} progress doc +
// users/{uid}/events analytics) would consume, same as ThreatForge.
const db: Firestore = initializeFirestore(app, {
  localCache: persistentLocalCache(),
});

export { app, auth, db };
