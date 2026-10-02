// ============================================================
// Kayda Sathi — Firebase Admin & Database Abstraction
// ============================================================

import admin from 'firebase-admin';
import { config, hasFirebaseAdmin } from './env';
import { Case, Evidence } from '../types';
import fs from 'fs';
import path from 'path';

let firestoreDb: FirebaseFirestore.Firestore | null = null;
let firebaseBucket: any = null;

if (hasFirebaseAdmin()) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId,
        privateKey: config.firebase.privateKey,
        clientEmail: config.firebase.clientEmail,
      }),
      storageBucket: config.firebase.storageBucket || `${config.firebase.projectId}.appspot.com`,
    });

    firestoreDb = admin.firestore();
    firebaseBucket = admin.storage().bucket();
    console.log('🔥 Firebase Admin SDK initialized successfully');
  } catch (err) {
    console.warn('⚠️ Failed to initialize Firebase Admin SDK, falling back to local store:', err);
  }
} else {
  console.log('ℹ️ No Firebase Admin credentials found — running in Local Persistent Store mode.');
}

// Local in-memory / JSON persistence fallback for seamless developer experience
const LOCAL_DATA_FILE = path.resolve(__dirname, '../../data/store.json');

interface LocalStore {
  cases: Record<string, Case>;
  evidence: Record<string, Evidence>;
}

function loadLocalStore(): LocalStore {
  try {
    const dir = path.dirname(LOCAL_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    if (fs.existsSync(LOCAL_DATA_FILE)) {
      const data = fs.readFileSync(LOCAL_DATA_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('Error loading local store:', e);
  }
  return { cases: {}, evidence: {} };
}

function saveLocalStore(store: LocalStore): void {
  try {
    const dir = path.dirname(LOCAL_DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(LOCAL_DATA_FILE, JSON.stringify(store, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving local store:', e);
  }
}

// Unified Database Client
export const db = {
  isFirestore: () => Boolean(firestoreDb),

  // Case Operations
  async getCase(id: string): Promise<Case | null> {
    if (firestoreDb) {
      const doc = await firestoreDb.collection('cases').doc(id).get();
      return doc.exists ? (doc.data() as Case) : null;
    }
    const store = loadLocalStore();
    return store.cases[id] || null;
  },

  async saveCase(c: Case): Promise<Case> {
    if (firestoreDb) {
      await firestoreDb.collection('cases').doc(c.id).set(c);
      return c;
    }
    const store = loadLocalStore();
    store.cases[c.id] = c;
    saveLocalStore(store);
    return c;
  },

  async listCases(userId?: string): Promise<Case[]> {
    if (firestoreDb) {
      let query: FirebaseFirestore.Query = firestoreDb.collection('cases');
      if (userId) {
        query = query.where('userId', '==', userId);
      }
      const snapshot = await query.get();
      return snapshot.docs.map(doc => doc.data() as Case);
    }
    const store = loadLocalStore();
    let cases = Object.values(store.cases);
    if (userId) {
      cases = cases.filter(c => c.userId === userId);
    }
    return cases.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  },

  async deleteCase(id: string): Promise<boolean> {
    if (firestoreDb) {
      await firestoreDb.collection('cases').doc(id).delete();
      return true;
    }
    const store = loadLocalStore();
    if (store.cases[id]) {
      delete store.cases[id];
      // Also delete related evidence
      for (const evId of Object.keys(store.evidence)) {
        if (store.evidence[evId].caseId === id) {
          delete store.evidence[evId];
        }
      }
      saveLocalStore(store);
      return true;
    }
    return false;
  },

  // Evidence Operations
  async getEvidence(id: string): Promise<Evidence | null> {
    if (firestoreDb) {
      const doc = await firestoreDb.collection('evidence').doc(id).get();
      return doc.exists ? (doc.data() as Evidence) : null;
    }
    const store = loadLocalStore();
    return store.evidence[id] || null;
  },

  async saveEvidence(e: Evidence): Promise<Evidence> {
    if (firestoreDb) {
      await firestoreDb.collection('evidence').doc(e.id).set(e);
      return e;
    }
    const store = loadLocalStore();
    store.evidence[e.id] = e;
    saveLocalStore(store);
    return e;
  },

  async listEvidenceForCase(caseId: string): Promise<Evidence[]> {
    if (firestoreDb) {
      const snapshot = await firestoreDb.collection('evidence').where('caseId', '==', caseId).get();
      return snapshot.docs.map(doc => doc.data() as Evidence);
    }
    const store = loadLocalStore();
    return Object.values(store.evidence).filter(e => e.caseId === caseId);
  },

  async deleteEvidence(id: string): Promise<boolean> {
    if (firestoreDb) {
      await firestoreDb.collection('evidence').doc(id).delete();
      return true;
    }
    const store = loadLocalStore();
    if (store.evidence[id]) {
      delete store.evidence[id];
      saveLocalStore(store);
      return true;
    }
    return false;
  },
};

export { admin, firestoreDb, firebaseBucket };
