// ============================================================
// Kayda Sathi — Case & Evidence Reactive Store
// ============================================================
// Manages real cases, demo cases, evidence vault, and intake state.
// Synchronizes with the backend API while offering offline persistence via AsyncStorage.

import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Case, Evidence, CaseDocument, IntakeAnswer, IntakeQuestion, ActionItem, Fact } from '@/types';
import { DEMO_CASE, DEMO_EVIDENCE } from './demoData';
import { api } from '@/services/api';

const STORAGE_CASES_KEY = '@kayda_sathi_cases_v1';
const STORAGE_EVIDENCE_KEY = '@kayda_sathi_evidence_v1';

// Global in-memory cache
let casesCache: Case[] = [DEMO_CASE];
let evidenceCache: Evidence[] = [...DEMO_EVIDENCE];
let isInitialized = false;

// Listeners for reactive updates across components
type Listener = () => void;
const listeners = new Set<Listener>();

function notifyListeners() {
  listeners.forEach(fn => fn());
}

async function persistToStorage() {
  try {
    const userCases = casesCache.filter(c => !c.isDemo);
    const userEvidence = evidenceCache.filter(e => !e.isDemo);
    await AsyncStorage.setItem(STORAGE_CASES_KEY, JSON.stringify(userCases));
    await AsyncStorage.setItem(STORAGE_EVIDENCE_KEY, JSON.stringify(userEvidence));
  } catch (err) {
    console.warn('Failed to persist to AsyncStorage:', err);
  }
}

export const CaseStore = {
  async init() {
    if (isInitialized) return;

    try {
      // 1. Load from AsyncStorage
      const storedCasesJson = await AsyncStorage.getItem(STORAGE_CASES_KEY);
      const storedEvidenceJson = await AsyncStorage.getItem(STORAGE_EVIDENCE_KEY);

      const userCases: Case[] = storedCasesJson ? JSON.parse(storedCasesJson) : [];
      const userEvidence: Evidence[] = storedEvidenceJson ? JSON.parse(storedEvidenceJson) : [];

      // Merge demo case with stored user cases
      const caseMap = new Map<string, Case>();
      caseMap.set(DEMO_CASE.id, DEMO_CASE);
      userCases.forEach(c => caseMap.set(c.id, c));
      casesCache = Array.from(caseMap.values());

      const evidenceMap = new Map<string, Evidence>();
      DEMO_EVIDENCE.forEach(e => evidenceMap.set(e.id, e));
      userEvidence.forEach(e => evidenceMap.set(e.id, e));
      evidenceCache = Array.from(evidenceMap.values());

      isInitialized = true;
      notifyListeners();

      // 2. Fetch fresh cases from server in background
      CaseStore.refreshFromServer().catch(() => {
        // Offline / server not running — continues with cached/demo data
      });
    } catch (err) {
      console.warn('Error initializing CaseStore:', err);
      isInitialized = true;
    }
  },

  async refreshFromServer() {
    try {
      const serverCases = await api.getCases();
      if (Array.isArray(serverCases)) {
        const caseMap = new Map<string, Case>();
        caseMap.set(DEMO_CASE.id, DEMO_CASE);
        // Add server cases
        serverCases.forEach(c => caseMap.set(c.id, c));
        casesCache = Array.from(caseMap.values());
        notifyListeners();
        await persistToStorage();
      }
    } catch (err) {
      // Fail silently if offline or server unreachable
    }
  },

  getCases(): Case[] {
    return casesCache;
  },

  getCase(id: string): Case | undefined {
    return casesCache.find(c => c.id === id);
  },

  getEvidence(caseId?: string): Evidence[] {
    if (caseId) {
      return evidenceCache.filter(e => e.caseId === caseId);
    }
    return evidenceCache;
  },

  async createCase(params: {
    description: string;
    inputType?: 'TEXT' | 'VOICE';
  }): Promise<{ case: Case; intakeQuestions: IntakeQuestion[] }> {
    try {
      // Attempt backend API first
      const result = await api.createCase(params);
      const newCase = result.case;

      // Add to store
      casesCache = [newCase, ...casesCache.filter(c => c.id !== newCase.id)];
      notifyListeners();
      await persistToStorage();

      return result;
    } catch (err) {
      console.warn('Backend API call failed, falling back to local case creation:', err);

      // Offline fallback: generate structured case locally
      const now = new Date().toISOString();
      const caseId = `case-${Date.now().toString(36)}`;
      const offlineCase: Case = {
        id: caseId,
        userId: 'local-user',
        title: 'New Legal Grievance',
        category: 'CONSUMER',
        subCategory: 'General Dispute',
        description: params.description,
        jurisdiction: 'District Dispute Commission',
        facts: [
          {
            id: `fact-${Date.now()}`,
            statement: params.description.slice(0, 140),
            status: 'USER_STATED',
            source: 'Citizen Initial Narrative',
            extractedAt: now,
          },
        ],
        claims: [
          {
            id: `claim-${Date.now()}`,
            statement: 'Entitled to relief and statutory resolution',
            supportingEvidenceIds: [],
            supportingFacts: [params.description.slice(0, 140)],
            strength: 'MODERATE',
          },
        ],
        timeline: [
          {
            id: `tl-${Date.now()}`,
            date: now.split('T')[0],
            title: 'Grievance Registered',
            description: 'Incident documented in Kayda Sathi',
            sourceType: 'USER_STATEMENT',
          },
        ],
        evidenceIds: [],
        actionItems: [
          {
            id: `act-1`,
            title: 'Preserve All Written & Digital Proofs',
            description: 'Gather screenshots, receipts, invoices, or notices.',
            reason: 'Electronic records are admissible under Bharatiya Sakshya Adhiniyam 2023.',
            requirements: ['Digital receipts', 'Screenshots'],
            status: 'TODO',
            order: 1,
          },
        ],
        documents: [],
        status: 'ACTIVE',
        preparation: {
          understanding: 50,
          evidence: 20,
          actionReadiness: 35,
        },
        createdAt: now,
        updatedAt: now,
      };

      casesCache = [offlineCase, ...casesCache];
      notifyListeners();
      await persistToStorage();

      const fallbackIntake: IntakeQuestion[] = [
        {
          questionId: 'q1_amount',
          question: 'What is the financial amount in dispute (in ₹)?',
          type: 'AMOUNT',
          required: true,
        },
        {
          questionId: 'q2_docs',
          question: 'Do you have written proof (agreement, receipts, chats)?',
          type: 'SELECT',
          options: ['Yes, fully documented', 'Only chats/messages', 'No written proof'],
          required: true,
        },
      ];

      return { case: offlineCase, intakeQuestions: fallbackIntake };
    }
  },

  async submitIntake(caseId: string, answers: IntakeAnswer[]): Promise<Case> {
    try {
      const updatedCase = await api.submitIntake(caseId, answers);
      casesCache = casesCache.map(c => (c.id === caseId ? updatedCase : c));
      notifyListeners();
      await persistToStorage();
      return updatedCase;
    } catch (err) {
      console.warn('API intake submit failed, applying locally:', err);
      const existing = casesCache.find(c => c.id === caseId);
      if (!existing) throw new Error('Case not found');

      const updatedCase: Case = {
        ...existing,
        preparation: {
          understanding: Math.min(100, existing.preparation.understanding + 25),
          evidence: Math.min(100, existing.preparation.evidence + 15),
          actionReadiness: Math.min(100, existing.preparation.actionReadiness + 20),
        },
        updatedAt: new Date().toISOString(),
      };

      casesCache = casesCache.map(c => (c.id === caseId ? updatedCase : c));
      notifyListeners();
      await persistToStorage();
      return updatedCase;
    }
  },

  async toggleAction(caseId: string, actionId: string): Promise<Case> {
    const existing = casesCache.find(c => c.id === caseId);
    if (!existing) throw new Error('Case not found');

    const item = existing.actionItems.find((a: ActionItem) => a.id === actionId);
    const newStatus: 'TODO' | 'DONE' = item?.status === 'DONE' ? 'TODO' : 'DONE';

    try {
      const updated = await api.updateActionStatus(caseId, actionId, newStatus);
      casesCache = casesCache.map(c => (c.id === caseId ? updated : c));
    } catch {
      // Local optimistic update
      existing.actionItems = existing.actionItems.map((a: ActionItem) =>
        a.id === actionId ? { ...a, status: newStatus } : a
      );
      const doneCount = existing.actionItems.filter((a: ActionItem) => a.status === 'DONE').length;
      existing.preparation.actionReadiness = Math.min(100, 40 + Math.round((doneCount / existing.actionItems.length) * 60));
      casesCache = casesCache.map(c => (c.id === caseId ? { ...existing } : c));
    }

    notifyListeners();
    await persistToStorage();
    return casesCache.find(c => c.id === caseId)!;
  },

  async addEvidence(evidenceData: {
    caseId: string;
    title: string;
    type: any;
    documentDate?: string;
    description?: string;
    fileUri?: string;
    fileName?: string;
    mimeType?: string;
  }): Promise<Evidence> {
    try {
      // Prepare FormData if file is attached
      const formData = new FormData();
      formData.append('caseId', evidenceData.caseId);
      formData.append('title', evidenceData.title);
      formData.append('type', evidenceData.type);
      if (evidenceData.documentDate) formData.append('documentDate', evidenceData.documentDate);
      if (evidenceData.description) formData.append('description', evidenceData.description);

      if (evidenceData.fileUri) {
        formData.append('file', {
          uri: evidenceData.fileUri,
          name: evidenceData.fileName || 'evidence_upload.jpg',
          type: evidenceData.mimeType || 'image/jpeg',
        } as any);
      }

      const result = await api.uploadEvidence(formData);
      const newEv = result.evidence;

      evidenceCache = [newEv, ...evidenceCache];

      // Refresh case data
      const freshCaseData = await api.getCase(evidenceData.caseId);
      if (freshCaseData?.case) {
        casesCache = casesCache.map(c => (c.id === evidenceData.caseId ? freshCaseData.case : c));
      }

      notifyListeners();
      await persistToStorage();
      return newEv;
    } catch (err) {
      console.warn('API evidence upload failed, adding to local store:', err);

      const evId = `evi-${Date.now().toString(36)}`;
      const now = new Date().toISOString();

      const newEvidence: Evidence = {
        id: evId,
        caseId: evidenceData.caseId,
        type: evidenceData.type,
        title: evidenceData.title,
        description: evidenceData.description,
        documentDate: evidenceData.documentDate || now.split('T')[0],
        uploadedAt: now,
        extractedFacts: [
          {
            id: `ef-${Date.now()}`,
            statement: `Document "${evidenceData.title}" uploaded as proof.`,
            confidence: 'HIGH',
          },
        ],
        relatedClaims: [],
      };

      evidenceCache = [newEvidence, ...evidenceCache];

      // Update case
      const c = casesCache.find(x => x.id === evidenceData.caseId);
      if (c) {
        c.evidenceIds = [...(c.evidenceIds || []), evId];
        c.preparation.evidence = Math.min(100, c.preparation.evidence + 20);
        c.preparation.actionReadiness = Math.min(100, c.preparation.actionReadiness + 10);
        c.timeline.push({
          id: `tl-${Date.now()}`,
          date: evidenceData.documentDate || now.split('T')[0],
          title: `Evidence Attached: ${evidenceData.title}`,
          sourceType: 'EVIDENCE',
          sourceId: evId,
          sourceLabel: evidenceData.title,
        });
        casesCache = casesCache.map(x => (x.id === c.id ? { ...c } : x));
      }

      notifyListeners();
      await persistToStorage();
      return newEvidence;
    }
  },

  async generateDocument(caseId: string, type: CaseDocument['type']): Promise<CaseDocument> {
    try {
      const doc = await api.generateDocument(caseId, type);
      const c = casesCache.find(x => x.id === caseId);
      if (c) {
        c.documents = [...(c.documents || []), doc];
        casesCache = casesCache.map(x => (x.id === caseId ? { ...c } : x));
      }
      notifyListeners();
      await persistToStorage();
      return doc;
    } catch (err) {
      console.warn('Backend document generation failed, creating offline draft:', err);
      const c = casesCache.find(x => x.id === caseId);
      if (!c) throw new Error('Case not found');

      const fallbackDoc: CaseDocument = {
        id: `doc-${Date.now()}`,
        type,
        title: `${type.replace('_', ' ')} — ${c.title}`,
        content: `FORMAL LEGAL NOTICE / DEMAND\nDate: ${new Date().toLocaleDateString()}\n\nRegarding: ${c.title}\nDescription: ${c.description}\n\nFacts:\n${c.facts.map((f: Fact, i: number) => `${i + 1}. ${f.statement}`).join('\n')}\n\nYou are hereby requested to settle this dispute within 7 days.`,
        generatedAt: new Date().toISOString(),
      };

      c.documents = [...(c.documents || []), fallbackDoc];
      casesCache = casesCache.map(x => (x.id === caseId ? { ...c } : x));
      notifyListeners();
      await persistToStorage();
      return fallbackDoc;
    }
  },

  async deleteCase(caseId: string): Promise<void> {
    try {
      await api.deleteCase(caseId);
    } catch {
      // continue locally
    }
    casesCache = casesCache.filter(c => c.id !== caseId);
    evidenceCache = evidenceCache.filter(e => e.caseId !== caseId);
    notifyListeners();
    await persistToStorage();
  },

  subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

// React Hook for using cases
export function useCases() {
  const [, setTick] = useState(0);

  useEffect(() => {
    CaseStore.init();
    return CaseStore.subscribe(() => setTick(t => t + 1));
  }, []);

  return {
    cases: CaseStore.getCases(),
    refresh: () => CaseStore.refreshFromServer(),
    createCase: CaseStore.createCase,
    deleteCase: CaseStore.deleteCase,
  };
}

// React Hook for a single case
export function useCase(id: string) {
  const [, setTick] = useState(0);

  useEffect(() => {
    CaseStore.init();
    return CaseStore.subscribe(() => setTick(t => t + 1));
  }, [id]);

  const c = CaseStore.getCase(id);

  return {
    caseData: c,
    toggleAction: (actionId: string) => CaseStore.toggleAction(id, actionId),
    submitIntake: (answers: IntakeAnswer[]) => CaseStore.submitIntake(id, answers),
    generateDocument: (type: CaseDocument['type']) => CaseStore.generateDocument(id, type),
    addEvidence: (data: any) => CaseStore.addEvidence({ ...data, caseId: id }),
    refresh: () => CaseStore.refreshFromServer(),
  };
}

// React Hook for evidence vault
export function useEvidence(caseId?: string) {
  const [, setTick] = useState(0);

  useEffect(() => {
    CaseStore.init();
    return CaseStore.subscribe(() => setTick(t => t + 1));
  }, [caseId]);

  return {
    evidence: CaseStore.getEvidence(caseId),
    addEvidence: CaseStore.addEvidence,
    cases: CaseStore.getCases(),
  };
}
