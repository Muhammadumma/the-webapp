import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// User's provided Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDeqA1ZfMwDnKAtIf-nXbFcU52JZkHhAKY",
  authDomain: "project-e281d42c-a391-42b2-97b.firebaseapp.com",
  projectId: "project-e281d42c-a391-42b2-97b",
  storageBucket: "project-e281d42c-a391-42b2-97b.firebasestorage.app",
  messagingSenderId: "228582991023",
  appId: "1:228582991023:web:aa3648614bfca9cbdfe05a",
  measurementId: "G-R6KFGH1JFC"
};

// Initialize Firebase App safely
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = typeof window !== "undefined" ? isSupported().then(yes => yes ? getAnalytics(app) : null) : null;

export default app;
