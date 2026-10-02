// ============================================================
// Kayda Sathi — Firebase Configuration (Placeholder)
// ============================================================
// TODO: Replace with actual Firebase config from Firebase Console
// See: https://firebase.google.com/docs/web/setup

export const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
  storageBucket: 'YOUR_PROJECT.appspot.com',
  messagingSenderId: 'YOUR_SENDER_ID',
  appId: 'YOUR_APP_ID',
};

// Firebase is initialized in Phase 2 when we connect real auth & Firestore.
// For now, the app operates with local demo data only.

export const isFirebaseConfigured = (): boolean => {
  return firebaseConfig.apiKey !== 'YOUR_API_KEY';
};
