// ============================================================
// Kayda Sathi — Server Environment Configuration
// ============================================================

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  },
  corsOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['*'],
  uploadDir: path.resolve(__dirname, '../../uploads'),
};

export const hasGeminiKey = (): boolean => {
  return Boolean(config.geminiApiKey && config.geminiApiKey !== 'your-gemini-api-key');
};

export const hasFirebaseAdmin = (): boolean => {
  return Boolean(
    config.firebase.projectId &&
    config.firebase.projectId !== 'your-project-id' &&
    config.firebase.privateKey &&
    config.firebase.clientEmail
  );
};
