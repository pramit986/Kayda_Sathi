// ============================================================
// Kayda Sathi — Gemini AI Client (@google/genai)
// ============================================================

import { GoogleGenAI } from '@google/genai';
import { config, hasGeminiKey } from '../config/env';
import { SYSTEM_LEGAL_EXPERT } from './prompts';

let genAI: GoogleGenAI | null = null;

if (hasGeminiKey()) {
  try {
    genAI = new GoogleGenAI({ apiKey: config.geminiApiKey });
    console.log(`🤖 Gemini Client initialized with primary model: ${config.geminiModel}`);
  } catch (err) {
    console.warn('⚠️ Failed to initialize Google Gen AI client:', err);
  }
} else {
  console.log('ℹ️ No GEMINI_API_KEY set — AI engine will use domain-aware legal fallback mode.');
}

/**
 * Safely parse JSON from LLM output, stripping code fences if present
 */
function cleanJsonOutput(raw: string): any {
  let cleaned = raw.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }
  return JSON.parse(cleaned);
}

const CANDIDATE_MODELS = [
  config.geminiModel || 'gemini-3.5-flash-lite',
  'gemini-3.5-flash-lite',
  'gemini-3.8-flash',
  'gemini-2.5-flash',
];

export const geminiClient = {
  isAvailable: (): boolean => Boolean(genAI && hasGeminiKey()),

  /**
   * Generate structured JSON from a prompt using Gemini with multi-model fallback
   */
  async generateJson<T = any>(prompt: string, systemInstruction: string = SYSTEM_LEGAL_EXPERT): Promise<T> {
    if (!genAI) {
      throw new Error('Gemini client is not initialized or API key is missing');
    }

    let lastError: any = null;
    const attempted = new Set<string>();

    for (const model of CANDIDATE_MODELS) {
      if (attempted.has(model)) continue;
      attempted.add(model);

      try {
        const response = await genAI.models.generateContent({
          model,
          contents: prompt,
          config: {
            systemInstruction,
            responseMimeType: 'application/json',
            temperature: 0.2, // Low temperature for high factual accuracy in legal analysis
          },
        });

        const text = response.text || '';
        return cleanJsonOutput(text) as T;
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini model ${model} unavailable (${err?.message || err}). Trying next model...`);
      }
    }

    throw lastError || new Error('All Gemini candidate models failed');
  },

  /**
   * Multi-modal analysis for evidence files (images/PDFs) with prompt
   */
  async analyzeEvidenceFile<T = any>(
    base64Data: string,
    mimeType: string,
    prompt: string
  ): Promise<T> {
    if (!genAI) {
      throw new Error('Gemini client is not initialized');
    }

    let lastError: any = null;
    const attempted = new Set<string>();

    for (const model of CANDIDATE_MODELS) {
      if (attempted.has(model)) continue;
      attempted.add(model);

      try {
        const response = await genAI.models.generateContent({
          model,
          contents: [
            {
              role: 'user',
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: base64Data,
                  },
                },
                {
                  text: prompt,
                },
              ],
            },
          ],
          config: {
            systemInstruction: SYSTEM_LEGAL_EXPERT,
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const text = response.text || '';
        return cleanJsonOutput(text) as T;
      } catch (err: any) {
        lastError = err;
        console.warn(`Gemini multi-modal with ${model} failed (${err?.message || err}). Trying next candidate...`);
      }
    }

    throw lastError || new Error('All Gemini candidate models failed for multimodal analysis');
  },
};
