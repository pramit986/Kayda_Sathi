// ============================================================
// Kayda Sathi — Shared Legal Knowledge Types
// ============================================================

export type LegalSourceType = 'OFFICIAL_GOVERNMENT' | 'STATUTE_ACT' | 'REGULATORY_BODY' | 'JUDICIAL_PORTAL';

export interface LegalSourceReference {
  id: string;
  category: string;
  legalTopic: string;
  explanation: string;
  rights: string[];
  possibleRemedies: string[];
  nextSteps: string[];
  authority: string;
  sourceTitle: string;
  sourceUrl?: string;
  sourceType: LegalSourceType;
  lastVerified: string;
}

export interface LegalKnowledgeItem {
  id: string;
  category: string;
  issue: string;
  jurisdiction?: string;
  legalTopic: string;
  plainExplanation: string;
  rights: string[];
  possibleRemedies: string[];
  documents: string[];
  authority: string;
  nextSteps: string[];
  warnings: string[];
  sourceTitle: string;
  sourceAuthority: string;
  sourceUrl?: string;
  sourceType?: LegalSourceType;
  lastVerified?: string;
}

export interface LegalPath {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  destination: string;
  complexity: 'SIMPLE' | 'MODERATE' | 'COMPLEX';
}

export interface LegalGPS {
  situation: string;
  paths: LegalPath[];
}
