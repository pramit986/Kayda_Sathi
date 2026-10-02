// ============================================================
// Kayda Sathi — Shared Case Types
// ============================================================

export type CaseStatus = 'ACTIVE' | 'ACTION_REQUIRED' | 'RESOLVED' | 'ARCHIVED';

export type FactStatus = 'VERIFIED' | 'USER_STATED' | 'AI_INFERRED' | 'UNKNOWN';

export type ActionItemStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export type CaseCategory =
  | 'RENTAL'
  | 'CONSUMER'
  | 'BANKING'
  | 'CYBERCRIME'
  | 'WORKPLACE'
  | 'TRAFFIC'
  | 'GOVERNMENT'
  | 'PROPERTY'
  | 'WOMEN_CHILD'
  | 'LEGAL_NOTICE';

export interface Fact {
  id: string;
  statement: string;
  status: FactStatus;
  source?: string;
  sourceEvidenceId?: string;
  extractedAt?: string;
}

export interface Claim {
  id: string;
  statement: string;
  supportingEvidenceIds: string[];
  supportingFacts: string[];
  strength: 'STRONG' | 'MODERATE' | 'WEAK' | 'UNSUPPORTED';
}

export interface TimelineEvent {
  id: string;
  date: string;
  title: string;
  description?: string;
  sourceType: 'EVIDENCE' | 'USER_STATEMENT' | 'AI_INFERRED';
  sourceId?: string;
  sourceLabel?: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  reason?: string;
  requirements?: string[];
  status: ActionItemStatus;
  order: number;
}

export interface CaseDocument {
  id: string;
  type: 'REFUND_REQUEST' | 'COMPLAINT' | 'GRIEVANCE' | 'AUTHORITY_APPLICATION' | 'LEGAL_REQUEST' | 'LAWYER_BRIEF';
  title: string;
  content: string;
  generatedAt: string;
}

export interface CasePreparation {
  understanding: number; // 0-100
  evidence: number;
  actionReadiness: number;
}

export interface Case {
  id: string;
  userId: string;
  title: string;
  category: CaseCategory;
  subCategory?: string;
  description: string;
  jurisdiction?: string;
  facts: Fact[];
  claims: Claim[];
  timeline: TimelineEvent[];
  evidenceIds: string[];
  actionItems: ActionItem[];
  documents: CaseDocument[];
  status: CaseStatus;
  preparation: CasePreparation;
  isDemo?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CaseClassification {
  category: CaseCategory;
  issue: string;
  jurisdictionRequired: boolean;
  missingInformation: string[];
}

export interface CaseSummary {
  id: string;
  title: string;
  category: CaseCategory;
  status: CaseStatus;
  preparation: CasePreparation;
  updatedAt: string;
  isDemo?: boolean;
}
