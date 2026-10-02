import dotenv from "dotenv";
import { cert, getApps, initializeApp, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import { getStorage, Storage } from "firebase-admin/storage";

dotenv.config();

let firebaseApp: App | undefined;
let firebaseInitError: Error | null = null;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (getApps().length > 0) {
    firebaseApp = getApps()[0];
  } else if (projectId && clientEmail && privateKey) {
    firebaseApp = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    });
  } else {
    throw new Error("Missing required Firebase environment variables");
  }
} catch (error: any) {
  firebaseInitError = error;
  console.error("⚠️ Firebase Admin initialization error:", error.message);
}

export const adminAuth = (firebaseApp ? getAuth(firebaseApp) : null) as unknown as Auth;
export const db = (firebaseApp ? getFirestore(firebaseApp) : null) as unknown as Firestore;
export const storage = (firebaseApp ? getStorage(firebaseApp) : null) as unknown as Storage;

export { firebaseApp, firebaseInitError };
export default firebaseApp;
