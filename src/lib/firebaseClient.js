import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.projectId &&
  !firebaseConfig.apiKey.includes('placeholder') &&
  firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY_HERE'
);

// Fallback dummy config if not initialized to prevent crash
const activeConfig = isFirebaseConfigured
  ? firebaseConfig
  : {
      apiKey: 'AIzaSy_dummy_key_placeholder_for_build',
      projectId: 'profekarlos-ensayos',
      appId: '1:141184078366:web:dummy'
    };

const app = !getApps().length ? initializeApp(activeConfig) : getApp();
export const db = getFirestore(app);
export { app };
