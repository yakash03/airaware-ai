// AirAware AI V2 — Gemini Indoor Air Advisor Integration
// Provides grounded commentary on user indoor environments and outdoor conditions.
// Strictly non-sensor: never invents indoor measurements or promises complete air safety.

import { IndoorAdvisorPlan } from '../types';
import { validateAiOutput } from './validator';

export async function explainIndoorPlanWithGemini(plan: IndoorAdvisorPlan): Promise<IndoorAdvisorPlan> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || !plan.outdoorAqi) {
    return plan;
  }

  const validNumbers = [
    plan.outdoorAqi,
  ];

  const systemPrompt = `You are AirAware AI's Indoor Air Environment Advisor.
Your job is to explain practical indoor air quality considerations based on real outdoor data and user-provided room details.

CRITICAL NON-NEGOTIABLES:
1. AIRAWARE AI DOES NOT HAVE AN INDOOR SENSOR. NEVER state, estimate, or invent any indoor AQI, indoor PM2.5, or indoor measurement.
2. Clearly distinguish between verified outdoor readings and user-reported indoor conditions.
3. Never state that an action makes air "completely safe", "safe", or "pollution-free". Use balanced guidance like "helps reduce particle infiltration".
4. Zero medical diagnoses, medical advice, or prescriptions.
5. Target profile: ${plan.profileCategory}.
6. Language: ${plan.language} (${plan.language === 'ta' ? 'Tamil' : plan.language === 'hi' ? 'Hindi' : 'English'}).
7. Return a JSON object with keys: "headline", "overview", "keyAction".`;

  const userPrompt = `Outdoor Air: IN NAQI ${plan.outdoorAqi} (${plan.outdoorCategory}), Dominant Pollutant: ${plan.dominantPollutant}
User Indoor Setup:
- Naturally Ventilated: ${plan.setup.naturallyVentilated ?? 'Not specified'}
- Windows Status: ${plan.setup.windowsStatus ?? 'Not specified'}
- Cooking Nearby: ${plan.setup.cookingNearby ?? 'Not specified'}
- Dust or Smoke: ${plan.setup.visibleDustOrSmoke ?? 'Not specified'}
- Air Purifier: ${plan.setup.airPurifierAvailable ?? 'Not specified'}
- Road Facing: ${plan.setup.roadFacingArea ?? 'Not specified'}

Provide a concise, grounded family summary in ${plan.language === 'ta' ? 'Tamil' : plan.language === 'hi' ? 'Hindi' : 'English'}. Return only valid JSON.`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeout);

    if (!response.ok) return plan;

    const json = await response.json();
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return plan;

    const parsed = JSON.parse(rawText);
    const combinedText = `${parsed.headline ?? ''} ${parsed.overview ?? ''} ${parsed.keyAction ?? ''}`;
    const validation = validateAiOutput(combinedText, validNumbers);

    if (!validation.isValid) {
      console.warn('[AirAware AI] Gemini indoor explanation failed validation. Using deterministic fallback:', validation.reason);
      return plan;
    }

    return {
      ...plan,
      familySummary: {
        headline: parsed.headline || plan.familySummary.headline,
        overview: parsed.overview || plan.familySummary.overview,
        keyAction: parsed.keyAction || plan.familySummary.keyAction,
      },
    };
  } catch (err) {
    console.warn('[AirAware AI] Gemini indoor explainer error. Falling back to deterministic rules:', err);
    return plan;
  }
}
