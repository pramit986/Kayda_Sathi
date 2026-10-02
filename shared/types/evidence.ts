// ============================================================
// Kayda Sathi — Shared Evidence Types
// ============================================================

export type EvidenceType =
  | 'PDF'
  | 'IMAGE'
  | 'SCREENSHOT'
  | 'WHATSAPP_SCREENSHOT'
  | 'EMAIL_SCREENSHOT'
  | 'PAYMENT_PROOF'
  | 'RENTAL_AGREEMENT'
  | 'PHOTOGRAPH'
  | 'AUDIO'
  | 'TEXT_NOTE';

export interface ExtractedFact {
  id: string;
  statement: string;
  confidence: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Evidence {
  id: string;
  caseId: string;
  type: EvidenceType;
  title: string;
  fileUrl?: string;
  description?: string;
  documentDate?: string;
  uploadedAt: string;
  extractedText?: string;
  extractedFacts: ExtractedFact[];
  relatedClaims: string[];
  isDemo?: boolean;
}

export interface EvidenceSummary {
  id: string;
  caseId: string;
  type: EvidenceType;
  title: string;
  uploadedAt: string;
  hasExtractedFacts: boolean;
}

export interface EvidenceGap {
  id: string;
  description: string;
  suggestedEvidence: string[];
  importance: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface Contradiction {
  id: string;
  description: string;
  sourceA: { evidenceId: string; label: string; value: string };
  sourceB: { evidenceId: string; label: string; value: string };
}
