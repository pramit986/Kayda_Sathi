// ============================================================
// Kayda Sathi — Case Management Service (Phase 2)
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/firebase';
import { AiService } from '../ai/aiService';
import { Case, CaseDocument, IntakeAnswer, IntakeQuestion } from '../types';

// In-memory cache of pending intake questions for newly created cases
const pendingIntakeQuestions = new Map<string, IntakeQuestion[]>();

export class CaseService {
  /**
   * Create a new case from user story description
   */
  static async createCaseFromStory(params: {
    description: string;
    inputType?: 'TEXT' | 'VOICE';
    language?: 'en' | 'hi' | 'mr';
    userId?: string;
  }): Promise<{ case: Case; intakeQuestions: IntakeQuestion[] }> {
    const { description, userId = 'user-default' } = params;

    // Call AI intelligence pipeline
    const aiResult = await AiService.classifyAndIntake(description);

    const caseId = `case-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();

    const newCase: Case = {
      id: caseId,
      userId,
      title: aiResult.title,
      category: aiResult.category,
      subCategory: aiResult.subCategory,
      description,
      jurisdiction: aiResult.jurisdiction,
      facts: aiResult.facts,
      claims: aiResult.claims,
      timeline: aiResult.timeline,
      evidenceIds: [],
      actionItems: aiResult.actionItems,
      documents: [],
      status: 'ACTIVE',
      preparation: aiResult.preparation,
      createdAt: now,
      updatedAt: now,
    };

    // Save case to database
    await db.saveCase(newCase);

    // Save pending intake questions
    pendingIntakeQuestions.set(caseId, aiResult.intakeQuestions);

    return {
      case: newCase,
      intakeQuestions: aiResult.intakeQuestions,
    };
  }

  /**
   * Submit answers to clarifying intake questions
   */
  static async answerIntakeQuestions(
    caseId: string,
    answers: IntakeAnswer[]
  ): Promise<Case> {
    const existingCase = await db.getCase(caseId);
    if (!existingCase) {
      throw new Error(`Case with ID ${caseId} not found`);
    }

    // Refine case with AI
    const refined = await AiService.refineCaseWithIntake(existingCase, answers);

    const updatedCase: Case = {
      ...existingCase,
      facts: refined.facts,
      claims: refined.claims,
      preparation: refined.preparation,
      actionItems: refined.actionItems,
      updatedAt: new Date().toISOString(),
    };

    await db.saveCase(updatedCase);
    pendingIntakeQuestions.delete(caseId);

    return updatedCase;
  }

  /**
   * Get pending intake questions for a case
   */
  static getIntakeQuestions(caseId: string): IntakeQuestion[] {
    return pendingIntakeQuestions.get(caseId) || [];
  }

  /**
   * Get case by ID
   */
  static async getCase(id: string): Promise<Case | null> {
    return db.getCase(id);
  }

  /**
   * List cases
   */
  static async listCases(userId?: string): Promise<Case[]> {
    return db.listCases(userId);
  }

  /**
   * Update case
   */
  static async updateCase(id: string, updates: Partial<Case>): Promise<Case> {
    const existing = await db.getCase(id);
    if (!existing) {
      throw new Error(`Case ${id} not found`);
    }

    const updated: Case = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    await db.saveCase(updated);
    return updated;
  }

  /**
   * Toggle action item status (TODO <-> DONE)
   */
  static async updateActionItem(caseId: string, actionId: string, status: 'TODO' | 'IN_PROGRESS' | 'DONE'): Promise<Case> {
    const c = await db.getCase(caseId);
    if (!c) throw new Error('Case not found');

    c.actionItems = c.actionItems.map(item =>
      item.id === actionId ? { ...item, status } : item
    );

    // Update readiness score based on actions completed
    const doneCount = c.actionItems.filter(a => a.status === 'DONE').length;
    const totalCount = c.actionItems.length;
    if (totalCount > 0) {
      c.preparation.actionReadiness = Math.min(100, Math.round(50 + (doneCount / totalCount) * 50));
    }

    c.updatedAt = new Date().toISOString();
    await db.saveCase(c);
    return c;
  }

  /**
   * Generate formal legal document for a case
   */
  static async generateDocument(
    caseId: string,
    docType: CaseDocument['type']
  ): Promise<CaseDocument> {
    const c = await db.getCase(caseId);
    if (!c) throw new Error(`Case ${caseId} not found`);

    const doc = await AiService.generateLegalDocument(c, docType);

    c.documents = [...(c.documents || []), doc];
    c.updatedAt = new Date().toISOString();
    await db.saveCase(c);

    return doc;
  }

  /**
   * Delete case
   */
  static async deleteCase(id: string): Promise<boolean> {
    return db.deleteCase(id);
  }
}
