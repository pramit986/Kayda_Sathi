// ============================================================
// Kayda Sathi — Express API Server
// ============================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { config, hasGeminiKey, hasFirebaseAdmin } from './config/env';
import caseRoutes from './routes/caseRoutes';
import evidenceRoutes from './routes/evidenceRoutes';
import analyzeRoutes from './routes/analyzeRoutes';

const app = express();
const PORT = config.port;

// Security & Parsing Middleware
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow mobile clients to load static uploaded evidence
}));
app.use(cors({
  origin: config.corsOrigins,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve uploaded evidence statically
app.use('/uploads', express.static(config.uploadDir));

// Health check & status
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    data: {
      service: 'Kayda Sathi API',
      version: '1.0.0',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      aiEngine: hasGeminiKey() ? `Gemini (${config.geminiModel})` : 'Legal Domain Mock Engine (Local Dev)',
      database: hasFirebaseAdmin() ? 'Firebase Firestore' : 'Local Persistent JSON Store',
    },
  });
});

// Real API Routes for Phases 2, 3, 4
app.use('/api/cases', caseRoutes);
app.use('/api/evidence', evidenceRoutes);
app.use('/api/analyze', analyzeRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ success: false, error: err.message || 'Internal server error' });
});

// Only start listener if run directly
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`\n🏛️  Kayda Sathi API running on port ${PORT}`);
    console.log(`   Health: http://localhost:${PORT}/api/health`);
    console.log(`   Cases: http://localhost:${PORT}/api/cases`);
    console.log(`   Evidence: http://localhost:${PORT}/api/evidence`);
    console.log(`   Analyze: http://localhost:${PORT}/api/analyze\n`);
  });
}

export default app;
