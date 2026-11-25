// AirAware AI V2 — Gemini Indoor Air Advisor Integration
// Provides grounded commentary on user indoor environments and outdoor conditions.
// Strictly non-sensor: never invents indoor measurements or promises complete air safety.

import { IndoorAdvisorPlan } from '../types';
import { validateAiOutput } from './validator';
import { callGeminiModel, parseGeminiJsonObject } from './geminiClient';

interface IndoorExplanationJson {
  headline?: string;
  overview?: string;
  keyAction?: string;
  [key: string]: unknown;
}

/** Enrich an IndoorAdvisorPlan with grounded Gemini commentary when available. */
export async function explainIndoorPlanWithGemini(plan: IndoorAdvisorPlan): Promise<IndoorAdvisorPlan> {
  if (plan.outdoorAqi === null || plan.outdoorAqi === undefined) {
    return plan;
  }

  const validNumbers = [plan.outdoorAqi];
  const langLabel = plan.language === 'ta' ? 'Tamil' : plan.language === 'hi' ? 'Hindi' : 'English';

  const systemPrompt = `You are AirAware AI's Indoor Air Environment Advisor.
Your job is to explain practical indoor air quality considerations based on real outdoor data and user-provided room details.

CRITICAL NON-NEGOTIABLES:
1. AIRAWARE AI DOES NOT HAVE AN INDOOR SENSOR. NEVER state, estimate, or invent any indoor AQI, indoor PM2.5, or indoor measurement.
2. Clearly distinguish between verified outdoor readings and user-reported indoor conditions.
3. Never state that an action makes air "completely safe", "safe", or "pollution-free". Use balanced guidance like "helps reduce particle infiltration".
4. Zero medical diagnoses, medical advice, or prescriptions.
5. Target profile: ${plan.profileCategory}.
6. Language: ${plan.language} (${langLabel}).
7. Return a JSON object with keys: "headline", "overview", "keyAction".`;

  const userPrompt = `Outdoor Air: IN NAQI ${plan.outdoorAqi} (${plan.outdoorCategory}), Dominant Pollutant: ${plan.dominantPollutant}
User Indoor Setup:
- Naturally Ventilated: ${plan.setup.naturallyVentilated ?? 'Not specified'}
- Windows Status: ${plan.setup.windowsStatus ?? 'Not specified'}
- Cooking Nearby: ${plan.setup.cookingNearby ?? 'Not specified'}
- Dust or Smoke: ${plan.setup.visibleDustOrSmoke ?? 'Not specified'}
- Air Purifier: ${plan.setup.airPurifierAvailable ?? 'Not specified'}
- Road Facing: ${plan.setup.roadFacingArea ?? 'Not specified'}

Provide a concise, grounded family summary in ${langLabel}. Return only valid JSON.`;

  const rawText = await callGeminiModel({
    prompt: `${systemPrompt}\n\n${userPrompt}`,
    responseMimeType: 'application/json',
  });

  if (!rawText) return plan;

  const parsed = parseGeminiJsonObject<IndoorExplanationJson>(rawText);
  if (!parsed) return plan;

  const combinedText = `${parsed.headline ?? ''} ${parsed.overview ?? ''} ${parsed.keyAction ?? ''}`;
  const validation = validateAiOutput(combinedText, validNumbers);

  if (!validation.isValid) {
    console.warn('[AirAware AI] Gemini indoor explanation failed validation. Using deterministic fallback:', validation.reason);
    return plan;
  }

  return {
    ...plan,
    familySummary: {
      headline:
        typeof parsed.headline === 'string' && parsed.headline
          ? parsed.headline
          : plan.familySummary.headline,
      overview:
        typeof parsed.overview === 'string' && parsed.overview
          ? parsed.overview
          : plan.familySummary.overview,
      keyAction:
        typeof parsed.keyAction === 'string' && parsed.keyAction
          ? parsed.keyAction
          : plan.familySummary.keyAction,
    },
  };
}
