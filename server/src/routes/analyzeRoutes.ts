// ============================================================
// Kayda Sathi — Legal Analysis Route
// ============================================================
// POST /api/analyze — text or voice audio input → structured JSON

import { Router } from 'express';
import { analyzeQuery, transcribeAudioQuery } from '../controllers/analyzeController';
import { uploadMiddleware } from '../middleware/upload';

const router = Router();

// Full analysis: text or voice audio input → 7-field structured JSON
router.post('/', uploadMiddleware.single('audio'), analyzeQuery);

// Voice-to-Text transcription only: audio input → { text: "..." }
router.post('/transcribe', uploadMiddleware.single('audio'), transcribeAudioQuery);

export default router;
