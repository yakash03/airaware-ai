// AirAware AI V2 — Gemini Window Explanation Engine
// Natural language commentary grounded in deterministic forecast comparisons.
// Never modifies rankings, creates thresholds, or makes medical diagnoses.

import { BestWindowPlan } from '../types';
import { validateAiOutput } from './validator';
import { callGeminiModel, parseGeminiJsonObject } from './geminiClient';

interface WindowExplanationJson {
  headline?: string;
  recommendation?: string;
  activitySpecificAdvice?: string;
  cautionNote?: string;
  [key: string]: unknown;
}

/** Enrich a calculated BestWindowPlan with grounded natural-language commentary via Gemini. */
export async function explainWindowWithGemini(plan: BestWindowPlan): Promise<BestWindowPlan> {
  if (!plan.dataSufficient || !plan.bestWindow || !plan.worstWindow) {
    return plan;
  }

  const best = plan.bestWindow;
  const worst = plan.worstWindow;

  const validNumbers = [
    best.averageAqi ?? 0,
    worst.averageAqi ?? 0,
    ...(best.readingsUsed.map((r) => r.avgValue) || []),
    ...(worst.readingsUsed.map((r) => r.avgValue) || []),
  ];

  const langLabel = plan.language === 'ta' ? 'Tamil' : plan.language === 'hi' ? 'Hindi' : 'English';

  const systemPrompt = `You are AirAware AI's Outdoor Activity Planning Assistant.
Your task is to explain a deterministically calculated 24-hour best outdoor window.

CRITICAL RULES:
1. Do not invent or alter any numbers, time windows, or rankings.
2. The best window has already been calculated as: "${best.timeLabel}" with average IN NAQI ${best.averageAqi}.
3. The peak/worst window is: "${worst.timeLabel}" with average IN NAQI ${worst.averageAqi}.
4. Never state that any time is "completely safe", "safe", or "pollution-free". Use phrases like "comparatively more favorable based on the forecast".
5. No medical diagnoses, medical advice, or personalized health prescriptions.
6. Target audience age profile: ${plan.profileCategory}.
7. Selected activity: ${plan.activity}.
8. Requested language: ${plan.language} (${langLabel}).
9. Return a JSON object with keys: "headline", "recommendation", "activitySpecificAdvice", "cautionNote".`;

  const userPrompt = `Location: ${plan.location}
Selected Activity: ${plan.activity}
Profile: ${plan.profileCategory}
Language: ${plan.language}
Best Window: ${best.timeLabel} (IN NAQI: ${best.averageAqi}, Category: ${best.aqiCategory})
Worst Window: ${worst.timeLabel} (IN NAQI: ${worst.averageAqi}, Category: ${worst.aqiCategory})
Dominant Pollutant: ${best.dominantPollutant}

Explain this comparison clearly and concisely for the target profile in ${langLabel}. Return only valid JSON.`;

  const rawText = await callGeminiModel({
    prompt: `${systemPrompt}\n\n${userPrompt}`,
    responseMimeType: 'application/json',
  });

  if (!rawText) return plan;

  const parsed = parseGeminiJsonObject<WindowExplanationJson>(rawText);
  if (!parsed) return plan;

  const combinedText = `${parsed.headline ?? ''} ${parsed.recommendation ?? ''} ${parsed.activitySpecificAdvice ?? ''} ${parsed.cautionNote ?? ''}`;
  const validation = validateAiOutput(combinedText, validNumbers);

  if (!validation.isValid) {
    console.warn('[AirAware AI] Gemini window explanation failed validation. Using deterministic fallback:', validation.reason);
    return plan;
  }

  return {
    ...plan,
    ageAdaptedExplanation: {
      headline:
        typeof parsed.headline === 'string' && parsed.headline
          ? parsed.headline
          : plan.ageAdaptedExplanation.headline,
      recommendation:
        typeof parsed.recommendation === 'string' && parsed.recommendation
          ? parsed.recommendation
          : plan.ageAdaptedExplanation.recommendation,
      activitySpecificAdvice:
        typeof parsed.activitySpecificAdvice === 'string' && parsed.activitySpecificAdvice
          ? parsed.activitySpecificAdvice
          : plan.ageAdaptedExplanation.activitySpecificAdvice,
      cautionNote:
        typeof parsed.cautionNote === 'string' && parsed.cautionNote
          ? parsed.cautionNote
          : plan.ageAdaptedExplanation.cautionNote,
    },
  };
}
