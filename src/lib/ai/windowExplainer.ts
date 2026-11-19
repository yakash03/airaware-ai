// AirAware AI V2 — Gemini Window Explanation Engine
// Natural language commentary grounded in deterministic forecast comparisons.
// Never modifies rankings, creates thresholds, or makes medical diagnoses.

import { BestWindowPlan } from '../types';
import { validateAiOutput } from './validator';

export async function explainWindowWithGemini(plan: BestWindowPlan): Promise<BestWindowPlan> {
  const apiKey = process.env.GEMINI_API_KEY;

  // If no API key configured or data is insufficient, use pure deterministic explanation
  if (!apiKey || !plan.dataSufficient || !plan.bestWindow || !plan.worstWindow) {
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
8. Requested language: ${plan.language} (${plan.language === 'ta' ? 'Tamil' : plan.language === 'hi' ? 'Hindi' : 'English'}).
9. Return a JSON object with keys: "headline", "recommendation", "activitySpecificAdvice", "cautionNote".`;

  const userPrompt = `Location: ${plan.location}
Selected Activity: ${plan.activity}
Profile: ${plan.profileCategory}
Language: ${plan.language}
Best Window: ${best.timeLabel} (IN NAQI: ${best.averageAqi}, Category: ${best.aqiCategory})
Worst Window: ${worst.timeLabel} (IN NAQI: ${worst.averageAqi}, Category: ${worst.aqiCategory})
Dominant Pollutant: ${best.dominantPollutant}

Explain this comparison clearly and concisely for the target profile in ${plan.language === 'ta' ? 'Tamil' : plan.language === 'hi' ? 'Hindi' : 'English'}. Return only valid JSON.`;

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

    if (!response.ok) {
      return plan; // Fallback to deterministic
    }

    const json = await response.json();
    const rawText = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawText) return plan;

    const parsed = JSON.parse(rawText);

    // Validate using strict number and medical assertion validator
    const combinedText = `${parsed.headline ?? ''} ${parsed.recommendation ?? ''} ${parsed.activitySpecificAdvice ?? ''} ${parsed.cautionNote ?? ''}`;
    const validation = validateAiOutput(combinedText, validNumbers);

    if (!validation.isValid) {
      console.warn('[AirAware AI] Gemini window explanation failed validation. Using deterministic fallback:', validation.reason);
      return plan;
    }

    return {
      ...plan,
      ageAdaptedExplanation: {
        headline: parsed.headline || plan.ageAdaptedExplanation.headline,
        recommendation: parsed.recommendation || plan.ageAdaptedExplanation.recommendation,
        activitySpecificAdvice: parsed.activitySpecificAdvice || plan.ageAdaptedExplanation.activitySpecificAdvice,
        cautionNote: parsed.cautionNote || plan.ageAdaptedExplanation.cautionNote,
      },
    };
  } catch (err) {
    console.warn('[AirAware AI] Gemini window explainer error. Falling back to deterministic rules:', err);
    return plan;
  }
}
