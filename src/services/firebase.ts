import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyD10-_NC3EbKET1b3kAs7OOMl_-LBSqjLc',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'trinetra-bce2b.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'trinetra-bce2b',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'trinetra-bce2b.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '759513409509',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:759513409509:web:f9065c89fdf97799f0310c',
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || 'G-PGNLCL1791',
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
