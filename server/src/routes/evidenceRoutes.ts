// ============================================================
// Kayda Sathi — Evidence Routes
// ============================================================

import { Router } from 'express';
import {
  uploadEvidence,
  getEvidenceByCase,
  getEvidenceById,
  deleteEvidence,
} from '../controllers/evidenceController';
import { uploadMiddleware } from '../middleware/upload';

const router = Router();

// Base: /api/evidence
router.get('/', getEvidenceByCase);
router.post('/upload', uploadMiddleware.single('file'), uploadEvidence);
router.get('/:id', getEvidenceById);
router.delete('/:id', deleteEvidence);

export default router;
