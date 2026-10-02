// ============================================================
// Kayda Sathi — Evidence Vault Service (Phase 3)
// ============================================================

import { v4 as uuidv4 } from 'uuid';
import { db } from '../config/firebase';
import { AiService } from '../ai/aiService';
import { Evidence, EvidenceType, TimelineEvent } from '../types';

export class EvidenceService {
  /**
   * Upload and process a new piece of evidence
   */
  static async addEvidence(params: {
    caseId: string;
    title: string;
    type: EvidenceType;
    documentDate?: string;
    description?: string;
    file?: Express.Multer.File;
  }): Promise<{ evidence: Evidence; analysis: any }> {
    const { caseId, title, type, documentDate, description, file } = params;

    const existingCase = await db.getCase(caseId);
    if (!existingCase) {
      throw new Error(`Case with ID ${caseId} does not exist`);
    }

    const evidenceId = `ev-${uuidv4().slice(0, 8)}`;
    const now = new Date().toISOString();

    const fileUrl = file ? `/uploads/${file.filename}` : undefined;

    // Run AI evidence intelligence (multimodal or text analysis)
    const analysis = await AiService.analyzeEvidence(
      title,
      type,
      file?.path,
      file?.mimetype,
      description
    );

    const evidence: Evidence = {
      id: evidenceId,
      caseId,
      type,
      title,
      fileUrl,
      description,
      documentDate: documentDate || now.split('T')[0],
      uploadedAt: now,
      extractedFacts: analysis.extractedFacts,
      relatedClaims: analysis.supportedClaims,
    };

    // Save evidence to database
    await db.saveEvidence(evidence);

    // Update case: link evidence, add extracted facts, update readiness, add timeline milestone
    const updatedEvidenceIds = [...(existingCase.evidenceIds || []), evidenceId];

    // Convert extracted facts to case facts
    const newCaseFacts = analysis.extractedFacts.map(ef => ({
      id: ef.id,
      statement: ef.statement,
      status: ef.confidence === 'HIGH' ? ('VERIFIED' as const) : ('AI_INFERRED' as const),
      source: `Evidence: ${title}`,
      sourceEvidenceId: evidenceId,
      extractedAt: now,
    }));

    // Add timeline event if dated
    const newTimelineEvent: TimelineEvent = {
      id: uuidv4(),
      date: documentDate || now.split('T')[0],
      title: `Evidence Uploaded: ${title}`,
      description: description || `Attached ${type} proof supporting citizen claims.`,
      sourceType: 'EVIDENCE',
      sourceId: evidenceId,
      sourceLabel: title,
    };

    // Recalculate evidence score
    const newEvidenceScore = Math.min(100, (existingCase.preparation?.evidence || 20) + 25);
    const newActionReadiness = Math.min(100, (existingCase.preparation?.actionReadiness || 40) + 15);

    existingCase.evidenceIds = updatedEvidenceIds;
    existingCase.facts = [...existingCase.facts, ...newCaseFacts];
    existingCase.timeline = [...existingCase.timeline, newTimelineEvent].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    existingCase.preparation = {
      ...existingCase.preparation,
      evidence: newEvidenceScore,
      actionReadiness: newActionReadiness,
    };
    existingCase.updatedAt = now;

    await db.saveCase(existingCase);

    return { evidence, analysis };
  }

  /**
   * Get evidence by ID
   */
  static async getEvidence(id: string): Promise<Evidence | null> {
    return db.getEvidence(id);
  }

  /**
   * List all evidence for a case
   */
  static async listByCase(caseId: string): Promise<Evidence[]> {
    return db.listEvidenceForCase(caseId);
  }

  /**
   * Delete evidence
   */
  static async deleteEvidence(id: string): Promise<boolean> {
    const ev = await db.getEvidence(id);
    if (!ev) return false;

    // Remove from case
    const c = await db.getCase(ev.caseId);
    if (c) {
      c.evidenceIds = (c.evidenceIds || []).filter(eId => eId !== id);
      c.facts = c.facts.filter(f => f.sourceEvidenceId !== id);
      c.timeline = c.timeline.filter(t => t.sourceId !== id);
      c.updatedAt = new Date().toISOString();
      await db.saveCase(c);
    }

    return db.deleteEvidence(id);
  }
}
