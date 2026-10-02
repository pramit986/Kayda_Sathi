// ============================================================
// Kayda Sathi — Case Routes
// ============================================================

import { Router } from 'express';
import {
  createCase,
  getCases,
  getCaseById,
  submitIntakeAnswers,
  updateActionItemStatus,
  generateDocument,
  deleteCase,
} from '../controllers/caseController';

const router = Router();

// Base: /api/cases
router.get('/', getCases);
router.post('/', createCase);
router.get('/:id', getCaseById);
router.delete('/:id', deleteCase);

// Intake refinement
router.post('/:id/intake', submitIntakeAnswers);

// Action item updates
router.patch('/:id/actions/:actionId', updateActionItemStatus);

// Document generation
router.post('/:id/documents', generateDocument);

export default router;
