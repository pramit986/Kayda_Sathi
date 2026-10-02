// ============================================================
// Kayda Sathi — Unified AI Intelligence Service
// ============================================================

import { geminiClient } from './geminiClient';
import { MockAiService } from './mockAiService';
import {
  CLASSIFY_AND_INTAKE_PROMPT,
  REFINE_CASE_WITH_INTAKE_PROMPT,
  ANALYZE_EVIDENCE_PROMPT,
  GENERATE_LEGAL_DOCUMENT_PROMPT,
} from './prompts';
import {
  CaseCategory,
  Fact,
  Claim,
  TimelineEvent,
  ActionItem,
  IntakeQuestion,
  CasePreparation,
  ExtractedFact,
  Contradiction,
  EvidenceGap,
  CaseDocument,
} from '../types';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';

export class AiService {
  /**
   * Classify user story and generate initial facts, claims, timeline & intake questions
   */
  static async classifyAndIntake(description: string): Promise<{
    title: string;
    category: CaseCategory;
    subCategory: string;
    jurisdiction: string;
    facts: Fact[];
    claims: Claim[];
    timeline: TimelineEvent[];
    intakeQuestions: IntakeQuestion[];
    preparation: CasePreparation;
    actionItems: ActionItem[];
  }> {
    if (geminiClient.isAvailable()) {
      try {
        const prompt = `${CLASSIFY_AND_INTAKE_PROMPT}\n\nCITIZEN PROBLEM DESCRIPTION:\n"""\n${description}\n"""`;
        const result = await geminiClient.generateJson(prompt);

        return {
          title: result.title || 'Legal Grievance',
          category: (result.category as CaseCategory) || 'CONSUMER',
          subCategory: result.subCategory || 'General Dispute',
          jurisdiction: result.jurisdiction || 'Appropriate District Forum',
          facts: (result.facts || []).map((f: any) => ({
            id: uuidv4(),
            statement: f.statement,
            status: f.status || 'USER_STATED',
            extractedAt: new Date().toISOString(),
          })),
          claims: (result.claims || []).map((c: any) => ({
            id: uuidv4(),
            statement: c.statement,
            supportingFacts: c.supportingFacts || [],
            supportingEvidenceIds: [],
            strength: c.strength || 'MODERATE',
          })),
          timeline: (result.timeline || []).map((t: any) => ({
            id: uuidv4(),
            date: t.date || new Date().toISOString().split('T')[0],
            title: t.title,
            description: t.description,
            sourceType: t.sourceType || 'USER_STATEMENT',
          })),
          intakeQuestions: (result.intakeQuestions || []).map((q: any, i: number) => ({
            questionId: q.questionId || `q_${i + 1}`,
            question: q.question,
            type: q.type || 'TEXT',
            options: q.options,
            required: q.required !== false,
          })),
          preparation: result.preparation || { understanding: 55, evidence: 20, actionReadiness: 40 },
          actionItems: (result.actionItems || []).map((a: any, i: number) => ({
            id: uuidv4(),
            title: a.title,
            description: a.description,
            reason: a.reason,
            requirements: a.requirements || [],
            status: 'TODO',
            order: a.order || i + 1,
          })),
        };
      } catch (err) {
        console.warn('⚠️ Gemini classification failed, falling back to mock intelligence engine:', err);
      }
    }

    return MockAiService.classifyAndIntake(description);
  }

  /**
   * Refine case after user answers intake questions
   */
  static async refineCaseWithIntake(
    existingCase: any,
    answers: { questionId: string; answer: string }[]
  ): Promise<{
    facts: Fact[];
    claims: Claim[];
    preparation: CasePreparation;
    actionItems: ActionItem[];
  }> {
    if (geminiClient.isAvailable()) {
      try {
        const prompt = `${REFINE_CASE_WITH_INTAKE_PROMPT}\n\nEXISTING CASE CONTEXT:\n${JSON.stringify({
          title: existingCase.title,
          category: existingCase.category,
          facts: existingCase.facts,
          claims: existingCase.claims,
        })}\n\nCITIZEN INTAKE ANSWERS:\n${JSON.stringify(answers, null, 2)}`;

        const result = await geminiClient.generateJson(prompt);

        return {
          facts: (result.facts || []).map((f: any) => ({
            id: uuidv4(),
            statement: f.statement,
            status: f.status || 'USER_STATED',
            extractedAt: new Date().toISOString(),
          })),
          claims: (result.claims || []).map((c: any) => ({
            id: uuidv4(),
            statement: c.statement,
            supportingFacts: c.supportingFacts || [],
            supportingEvidenceIds: [],
            strength: c.strength || 'STRONG',
          })),
          preparation: result.preparation || { understanding: 80, evidence: 35, actionReadiness: 70 },
          actionItems: (result.actionItems || existingCase.actionItems).map((a: any, i: number) => ({
            id: a.id || uuidv4(),
            title: a.title,
            description: a.description,
            reason: a.reason,
            requirements: a.requirements || [],
            status: a.status || 'TODO',
            order: a.order || i + 1,
          })),
        };
      } catch (err) {
        console.warn('⚠️ Gemini refinement failed, falling back to mock engine:', err);
      }
    }

    return MockAiService.refineCaseWithIntake(existingCase, answers);
  }

  /**
   * Analyze evidence (document, screenshot, agreement) using Gemini multi-modal or text
   */
  static async analyzeEvidence(
    evidenceTitle: string,
    evidenceType: string,
    filePath?: string,
    mimeType?: string,
    description?: string
  ): Promise<{
    extractedFacts: ExtractedFact[];
    supportedClaims: string[];
    contradictions: Contradiction[];
    evidenceGaps: EvidenceGap[];
  }> {
    if (geminiClient.isAvailable() && filePath && fs.existsSync(filePath) && mimeType) {
      try {
        const fileBuffer = fs.readFileSync(filePath);
        const base64Data = fileBuffer.toString('base64');
        const prompt = `${ANALYZE_EVIDENCE_PROMPT}\nEvidence Type: ${evidenceType}\nEvidence Title: ${evidenceTitle}\nCitizen Note: ${description || 'None'}`;

        const result = await geminiClient.analyzeEvidenceFile(base64Data, mimeType, prompt);

        return {
          extractedFacts: (result.extractedFacts || []).map((f: any) => ({
            id: uuidv4(),
            statement: f.statement,
            confidence: f.confidence || 'HIGH',
          })),
          supportedClaims: result.supportedClaims || [],
          contradictions: (result.contradictions || []).map((c: any) => ({
            id: uuidv4(),
            description: c.description,
            sourceA: { evidenceId: 'ev-existing', label: c.labelA || 'Prior Statement', value: c.valueA || '' },
            sourceB: { evidenceId: 'ev-new', label: c.labelB || evidenceTitle, value: c.valueB || '' },
          })),
          evidenceGaps: (result.evidenceGaps || []).map((g: any) => ({
            id: uuidv4(),
            description: g.description,
            suggestedEvidence: g.suggestedEvidence || [],
            importance: g.importance || 'MEDIUM',
          })),
        };
      } catch (err) {
        console.warn('⚠️ Gemini evidence analysis failed, falling back to mock engine:', err);
      }
    }

    return MockAiService.analyzeEvidence(evidenceTitle, evidenceType, description);
  }

  /**
   * Generate formal draft legal documents
   */
  static async generateLegalDocument(
    c: any,
    type: CaseDocument['type']
  ): Promise<CaseDocument> {
    if (geminiClient.isAvailable()) {
      try {
        const prompt = `${GENERATE_LEGAL_DOCUMENT_PROMPT}\n\nDocument Type Requested: ${type}\n\nCASE DATA:\n${JSON.stringify({
          title: c.title,
          category: c.category,
          subCategory: c.subCategory,
          jurisdiction: c.jurisdiction,
          facts: c.facts,
          claims: c.claims,
          timeline: c.timeline,
        }, null, 2)}`;

        const result = await geminiClient.generateJson(prompt);

        return {
          id: uuidv4(),
          type,
          title: result.title || `${type.replace('_', ' ')} — ${c.title}`,
          content: result.content,
          generatedAt: new Date().toISOString(),
        };
      } catch (err) {
        console.warn('⚠️ Gemini document drafting failed, falling back to mock engine:', err);
      }
    }

    return MockAiService.generateLegalDocument(c, type);
  }
}
