// ============================================================
// Kayda Sathi — Evidence Controller (Phase 3)
// ============================================================

import { Request, Response } from 'express';
import { EvidenceService } from '../services/evidenceService';

export const uploadEvidence = async (req: Request, res: Response) => {
  try {
    const { caseId, title, type, documentDate, description } = req.body;
    const file = req.file;

    if (!caseId) {
      return res.status(400).json({
        success: false,
        error: 'caseId is required',
      });
    }

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'title is required',
      });
    }

    const result = await EvidenceService.addEvidence({
      caseId: String(caseId),
      title: String(title).trim(),
      type: type || 'DOCUMENT',
      documentDate: documentDate ? String(documentDate) : undefined,
      description: description ? String(description) : undefined,
      file,
    });

    return res.status(201).json({
      success: true,
      data: result,
      message: 'Evidence successfully uploaded and processed by AI.',
    });
  } catch (err: any) {
    console.error('Error uploading evidence:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Error uploading evidence',
    });
  }
};

export const getEvidenceByCase = async (req: Request, res: Response) => {
  try {
    const caseId = req.query.caseId ? String(req.query.caseId) : req.params.caseId ? String(req.params.caseId) : '';
    if (!caseId) {
      return res.status(400).json({
        success: false,
        error: 'caseId parameter is required',
      });
    }

    const evidenceList = await EvidenceService.listByCase(caseId);

    return res.json({
      success: true,
      data: evidenceList,
    });
  } catch (err: any) {
    console.error('Error listing evidence:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Error fetching evidence',
    });
  }
};

export const getEvidenceById = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const evidence = await EvidenceService.getEvidence(id);

    if (!evidence) {
      return res.status(404).json({
        success: false,
        error: `Evidence ${id} not found`,
      });
    }

    return res.json({
      success: true,
      data: evidence,
    });
  } catch (err: any) {
    console.error('Error getting evidence:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Error getting evidence',
    });
  }
};

export const deleteEvidence = async (req: Request, res: Response) => {
  try {
    const id = String(req.params.id);
    const success = await EvidenceService.deleteEvidence(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: `Evidence ${id} not found`,
      });
    }

    return res.json({
      success: true,
      message: `Evidence ${id} removed successfully`,
    });
  } catch (err: any) {
    console.error('Error deleting evidence:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Error deleting evidence',
    });
  }
};
