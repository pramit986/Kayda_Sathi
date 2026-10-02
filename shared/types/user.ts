// ============================================================
// Kayda Sathi — Shared User Types
// ============================================================

export interface User {
  id: string;
  displayName?: string;
  email?: string;
  phone?: string;
  preferredLanguage: 'en' | 'hi' | 'mr';
  createdAt: string;
}

export interface UserProfile extends User {
  caseCount: number;
  evidenceCount: number;
}
