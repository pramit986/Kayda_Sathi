// ============================================================
// Kayda Sathi — Mobile Types Re-export
// ============================================================

export * from '../../shared/types/case';
export * from '../../shared/types/evidence';
export * from '../../shared/types/legal';
export * from '../../shared/types/user';
export * from '../../shared/types/api';

export interface IntakeQuestion {
  questionId: string;
  question: string;
  type: 'TEXT' | 'SELECT' | 'DATE' | 'AMOUNT';
  options?: string[];
  required: boolean;
}
