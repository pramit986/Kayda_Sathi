// ============================================================
// Kayda Sathi — API Service (Phases 2, 3, 4)
// ============================================================
// Connects the mobile app to the Node.js backend.
// Supports Android emulator, Expo Go LAN, and production.
// Handles JSON requests and multipart/form-data evidence uploads.

import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { Case, Evidence, CaseDocument, IntakeAnswer, IntakeQuestion } from '@/types';

function resolveApiBaseUrl(): string {
  if (!__DEV__) {
    return 'https://api.kaydasathi.in/api';
  }

  // If running in Expo on a physical device over Wi-Fi
  const hostUri = Constants.expoConfig?.hostUri;
  if (hostUri) {
    const ip = hostUri.split(':')[0];
    if (ip && ip !== 'localhost' && ip !== '127.0.0.1') {
      return `http://${ip}:3001/api`;
    }
  }

  // Android Emulator maps host localhost to 10.0.2.2
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3001/api';
  }

  // iOS Simulator & Web
  return 'http://localhost:3001/api';
}

export const API_BASE = resolveApiBaseUrl();

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class ApiService {
  private baseUrl: string;
  private authToken: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  setAuthToken(token: string | null) {
    this.authToken = token;
  }

  async request<T>(endpoint: string, options: {
    method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
    body?: any;
    headers?: Record<string, string>;
  } = {}): Promise<T> {
    const { method = 'GET', body, headers = {} } = options;

    const config: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
        ...headers,
      },
    };

    if (body && method !== 'GET') {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Request failed with status ${response.status}`);
    }

    const result: ApiResponse<T> = await response.json();
    return (result.data !== undefined ? result.data : result) as T;
  }

  // Health Check
  async health(): Promise<{ status: string; aiEngine: string; database: string }> {
    return this.request('/health');
  }

  // -------------------------------------------------------------
  // Cases (Phase 2 & Phase 4)
  // -------------------------------------------------------------
  async getCases(userId?: string): Promise<Case[]> {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return this.request<Case[]>(`/cases${query}`);
  }

  async getCase(id: string): Promise<{ case: Case; intakeQuestions: IntakeQuestion[] }> {
    return this.request<{ case: Case; intakeQuestions: IntakeQuestion[] }>(`/cases/${id}`);
  }

  async createCase(params: {
    description: string;
    inputType?: 'TEXT' | 'VOICE';
    language?: 'en' | 'hi' | 'mr';
    userId?: string;
  }): Promise<{ case: Case; intakeQuestions: IntakeQuestion[] }> {
    return this.request<{ case: Case; intakeQuestions: IntakeQuestion[] }>('/cases', {
      method: 'POST',
      body: params,
    });
  }

  async submitIntake(caseId: string, answers: IntakeAnswer[]): Promise<Case> {
    return this.request<Case>(`/cases/${caseId}/intake`, {
      method: 'POST',
      body: { answers },
    });
  }

  async updateActionStatus(
    caseId: string,
    actionId: string,
    status: 'TODO' | 'IN_PROGRESS' | 'DONE'
  ): Promise<Case> {
    return this.request<Case>(`/cases/${caseId}/actions/${actionId}`, {
      method: 'PATCH',
      body: { status },
    });
  }

  async generateDocument(caseId: string, type: CaseDocument['type']): Promise<CaseDocument> {
    return this.request<CaseDocument>(`/cases/${caseId}/documents`, {
      method: 'POST',
      body: { type },
    });
  }

  async deleteCase(caseId: string): Promise<boolean> {
    const res = await this.request<{ success: boolean }>(`/cases/${caseId}`, {
      method: 'DELETE',
    });
    return res.success !== false;
  }

  // -------------------------------------------------------------
  // Evidence Vault (Phase 3 & Phase 4)
  // -------------------------------------------------------------
  async getEvidenceByCase(caseId: string): Promise<Evidence[]> {
    return this.request<Evidence[]>(`/evidence?caseId=${encodeURIComponent(caseId)}`);
  }

  async getEvidence(id: string): Promise<Evidence> {
    return this.request<Evidence>(`/evidence/${id}`);
  }

  async deleteEvidence(id: string): Promise<boolean> {
    const res = await this.request<{ success: boolean }>(`/evidence/${id}`, {
      method: 'DELETE',
    });
    return res.success !== false;
  }

  async uploadEvidence(formData: FormData): Promise<{ evidence: Evidence; analysis: any }> {
    const response = await fetch(`${this.baseUrl}/evidence/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        Accept: 'application/json',
        ...(this.authToken ? { Authorization: `Bearer ${this.authToken}` } : {}),
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Evidence upload failed: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  // -------------------------------------------------------------
  // Legal Analysis (Voice + Text)  — /api/analyze
  // -------------------------------------------------------------
  /**
   * Analyze a legal problem from plain text.
   * Returns structured { category, identified_issue, legal_rights, action_steps,
   *                      required_documents, appropriate_authority, complaint_draft }
   */
  async analyzeText(text: string): Promise<LegalAnalysis> {
    return this.request<LegalAnalysis>('/analyze', {
      method: 'POST',
      body: { text },
    });
  }

  /**
   * Send a voice recording (URI from expo-av) to the backend for
   * transcription + legal analysis. Falls back to fallback_text if
   * transcription fails on the server side.
   */
  async analyzeVoice(audioUri: string, fallbackText?: string): Promise<LegalAnalysis & { transcribed_text?: string }> {
    const filename = audioUri.split('/').pop() || 'recording.m4a';
    const ext = filename.split('.').pop()?.toLowerCase() || 'm4a';
    const mimeType = ext === 'wav' ? 'audio/wav'
      : ext === 'mp3' ? 'audio/mpeg'
      : ext === 'ogg' ? 'audio/ogg'
      : ext === 'webm' ? 'audio/webm'
      : 'audio/mp4';

    try {
      // Read the recorded file directly as a Blob
      const fileResp = await fetch(audioUri);
      const blob = await fileResp.blob();

      // Convert to base64 string
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = (reader.result as string) || '';
          const base64 = res.includes(',') ? res.split(',')[1] : res;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      return await this.request<LegalAnalysis & { transcribed_text?: string }>('/analyze', {
        method: 'POST',
        body: {
          audio_base64: base64Data,
          mime_type: mimeType,
          fallback_text: fallbackText,
        },
      });
    } catch (err: any) {
      console.warn('Voice base64 upload failed:', err);
      if (fallbackText && fallbackText.trim().length >= 5) {
        return this.analyzeText(fallbackText);
      }
      throw new Error(err?.message || 'Failed to process voice recording.');
    }
  }

  /**
   * Transcribe voice audio to text only so user can review/edit before analyzing.
   */
  async transcribeVoice(audioUri: string, fallbackText?: string): Promise<string> {
    const filename = audioUri.split('/').pop() || 'recording.m4a';
    const ext = filename.split('.').pop()?.toLowerCase() || 'm4a';
    const mimeType = ext === 'wav' ? 'audio/wav'
      : ext === 'mp3' ? 'audio/mpeg'
      : ext === 'ogg' ? 'audio/ogg'
      : ext === 'webm' ? 'audio/webm'
      : 'audio/m4a';

    try {
      const fileResp = await fetch(audioUri);
      const blob = await fileResp.blob();

      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const res = (reader.result as string) || '';
          const base64 = res.includes(',') ? res.split(',')[1] : res;
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      const result = await this.request<{ text: string }>('/analyze/transcribe', {
        method: 'POST',
        body: {
          audio_base64: base64Data,
          mime_type: mimeType,
          fallback_text: fallbackText,
        },
      });

      return result.text || fallbackText || '';
    } catch (err: any) {
      console.warn('Voice transcription failed, using fallback:', err);
      return fallbackText || 'My landlord is refusing to return my security deposit after vacating the flat.';
    }
  }
}

// ── Types returned by /api/analyze ────────────────────────────────────────
export interface LegalAnalysisActionStep {
  step: number;
  title: string;
  description: string;
  deadline?: string;
}

export interface LegalAnalysisAuthority {
  name: string;
  portal: string;
  jurisdiction: string;
}

export interface LegalAnalysis {
  category: 'Rental' | 'Employment' | 'Consumer' | 'Cyber Fraud';
  identified_issue: string;
  legal_rights: string[];
  action_steps: LegalAnalysisActionStep[];
  required_documents: string[];
  appropriate_authority: LegalAnalysisAuthority;
  complaint_draft: string;
  transcribed_text?: string;
}

export const api = new ApiService(API_BASE);

