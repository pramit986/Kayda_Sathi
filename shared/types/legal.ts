// ============================================================
// Kayda Sathi — Shared Legal Knowledge Types
// ============================================================

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
