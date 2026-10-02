// ============================================================
// Kayda Sathi — Legal Analysis Route
// ============================================================
// POST /api/analyze — text or voice audio input → structured JSON

import { Router } from 'express';
import { analyzeQuery } from '../controllers/analyzeController';
import { uploadMiddleware } from '../middleware/upload';

const router = Router();

// Accept optional audio file (field name: 'audio') or plain JSON body
router.post('/', uploadMiddleware.single('audio'), analyzeQuery);

export default router;
