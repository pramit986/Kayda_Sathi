// ============================================================
// Kayda Sathi — Shared API Types
// ============================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
}

export interface CreateCaseRequest {
  description: string;
  inputType: 'TEXT' | 'VOICE';
  language?: 'en' | 'hi' | 'mr';
}

export interface IntakeResponse {
  questionId: string;
  question: string;
  type: 'TEXT' | 'SELECT' | 'DATE' | 'AMOUNT';
  options?: string[];
  required: boolean;
}

export interface IntakeAnswer {
  questionId: string;
  answer: string;
}
