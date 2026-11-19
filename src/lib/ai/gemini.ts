// AirAware AI V2 — Secure Gemini AI Integration & Grounded Fallback Engine
// Strict adherence to Real Data Only, Zero Hallucination, and Medical Disclaimers

import { AirSnapshot, ProfileCategory, Language, AgeExplanation, ChatMessage } from '../types';
import { generateDeterministicExplanation } from '../rules/deterministicExplanations';
import { validateAiOutput } from './validator';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    code: number;
    message: string;
  };
}

/**
 * Collects all verified numeric values from the snapshot so the validator can reject any hallucinated numbers.
 */
function collectAllowedNumbers(snapshot: AirSnapshot): number[] {
  const nums: number[] = [];
  if (snapshot.computedAqi?.value !== null && snapshot.computedAqi?.value !== undefined) {
    nums.push(snapshot.computedAqi.value);
  }
  for (const m of snapshot.current) {
    nums.push(m.value);
  }
  if (snapshot.weather) {
    nums.push(snapshot.weather.temperature);
    nums.push(snapshot.weather.humidity);
    nums.push(snapshot.weather.windSpeed);
  }
  return nums;
}

export async function explainAirForProfile(
  snapshot: AirSnapshot,
  category: ProfileCategory,
  language: Language = 'en'
): Promise<AgeExplanation> {
  // Always prepare the verified deterministic baseline first
  const fallback = generateDeterministicExplanation(snapshot, category, language);

  if (!GEMINI_API_KEY) {
    // If no key configured, return high-quality deterministic response
    return fallback;
  }

  const allowedNumbers = collectAllowedNumbers(snapshot);

  const systemInstruction = `You are AirAware AI, an environmental data communication specialist.
Your role is to explain verified environmental air-quality data to a family member in the ${category} age group.

STRICT NON-NEGOTIABLE RULES:
1. Use ONLY the numbers provided in the input. Never invent, extrapolate, or estimate unmeasured values.
2. The AQI scale is India CPCB National AQI (0–500). Do NOT substitute US EPA AQI or European AQI.
3. This is a regional atmospheric model estimate (CAMS), not a local street sensor.
4. NO MEDICAL DIAGNOSIS. Do NOT prescribe, treat, diagnose, or say "safe/unsafe for all". Use cautious phrasing like "potentially more favorable".
5. Target Language: ${language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'English'}.
6. Style for ${category}:
   - CHILD: Friendly, short words, simple sentences, check with parent/guardian before running outside.
   - TEEN: Relatable, conversational, practical sports/commute tips.
   - ADULT: Informative, key pollutant factors, realistic guidance, uncertainty context.
   - SENIOR: High clarity, short sentences, highlights essential outdoor walk timing and indoor comfort.

OUTPUT FORMAT: You MUST return a valid JSON object with these exact keys:
{
  "headline": "Short title",
  "summary": "1-2 sentences summarizing today's air",
  "activityGuidance": "General lifestyle suggestion",
  "pollutantBreakdown": "Brief note on the dominant pollutant"
}`;

  const promptContent = JSON.stringify({
    location: snapshot.current[0]?.location?.name || 'Selected City',
    cpcbAqi: snapshot.computedAqi?.value,
    cpcbCategory: snapshot.computedAqi?.category,
    dominantPollutant: snapshot.computedAqi?.dominantPollutant,
    currentPollutants: snapshot.current.map((m) => ({
      pollutant: m.pollutant,
      value: m.value,
      unit: m.unit,
    })),
    weather: snapshot.weather
      ? {
          temperature: snapshot.weather.temperature,
          humidity: snapshot.weather.humidity,
          windSpeed: snapshot.weather.windSpeed,
        }
      : null,
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: `${systemInstruction}\n\nDATA:\n${promptContent}` }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
          maxOutputTokens: 600,
        },
      }),
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[Gemini API] HTTP ${response.status}. Using deterministic fallback.`);
      return fallback;
    }

    const data = (await response.json()) as GeminiGenerateResponse;
    const textOutput = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textOutput) {
      return fallback;
    }

    // Validate the LLM output against strict rules
    const validation = validateAiOutput(textOutput, allowedNumbers);
    if (!validation.isValid) {
      console.warn(`[Gemini Validation Failed]: ${validation.reason}. Falling back to deterministic output.`);
      return fallback;
    }

    const parsed = JSON.parse(textOutput);
    return {
      profileCategory: category,
      headline: parsed.headline || fallback.headline,
      summary: parsed.summary || fallback.summary,
      activityGuidance: parsed.activityGuidance || fallback.activityGuidance,
      pollutantBreakdown: parsed.pollutantBreakdown || fallback.pollutantBreakdown,
      cautionLevel: fallback.cautionLevel,
      language,
      whyAdvice: fallback.whyAdvice,
    };
  } catch (err: unknown) {
    console.warn('[Gemini Error or Timeout]:', err instanceof Error ? err.message : err);
    return fallback;
  }
}

/**
 * Grounded conversational assistant ("Ask AirAware AI")
 */
export async function askAirAwareAi(
  userQuestion: string,
  snapshot: AirSnapshot,
  category: ProfileCategory = 'ADULT',
  language: Language = 'en'
): Promise<ChatMessage> {
  const allowedNumbers = collectAllowedNumbers(snapshot);
  const nowIso = new Date().toISOString();

  // If no API key, provide smart deterministic answers to common environmental questions
  if (!GEMINI_API_KEY) {
    return generateDeterministicAnswer(userQuestion, snapshot, category, language);
  }

  const systemInstruction = `You are AirAware AI Assistant. Answer the user's question about air quality strictly using the provided environmental snapshot.
Target Audience: ${category}
Language: ${language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'English'}

RULES:
1. Ground answers strictly in the provided data.
2. If the user asks about an unavailable pollutant or indoor sensor, state that data is unavailable.
3. No medical advice, diagnostics, or treatments.
4. Keep answer concise (2-4 sentences).`;

  const contextData = JSON.stringify({
    location: snapshot.current[0]?.location?.name,
    aqi: snapshot.computedAqi?.value,
    category: snapshot.computedAqi?.category,
    dominantPollutant: snapshot.computedAqi?.dominantPollutant,
    pollutants: snapshot.current.map((p) => `${p.pollutant}: ${p.value} ${p.unit}`),
    temperature: snapshot.weather?.temperature,
  });

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 7000);

    const response = await fetch(url, {
      method: 'POST',
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [{ text: `${systemInstruction}\nCONTEXT: ${contextData}\nQUESTION: ${userQuestion}` }],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          maxOutputTokens: 300,
        },
      }),
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return generateDeterministicAnswer(userQuestion, snapshot, category, language);
    }

    const data = (await response.json()) as GeminiGenerateResponse;
    const answer = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!answer) {
      return generateDeterministicAnswer(userQuestion, snapshot, category, language);
    }

    const validation = validateAiOutput(answer, allowedNumbers);
    if (!validation.isValid) {
      console.warn(`[Chat Validation Failed]: ${validation.reason}. Using grounded fallback.`);
      return generateDeterministicAnswer(userQuestion, snapshot, category, language);
    }

    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: answer,
      timestamp: nowIso,
      profileCategory: category,
      language,
    };
  } catch {
    return generateDeterministicAnswer(userQuestion, snapshot, category, language);
  }
}

/**
 * Grounded deterministic Q&A fallback
 */
function generateDeterministicAnswer(
  q: string,
  snapshot: AirSnapshot,
  category: ProfileCategory,
  language: Language
): ChatMessage {
  const queryLower = q.toLowerCase();
  const aqiVal = snapshot.computedAqi?.value ?? '--';
  const aqiCat = snapshot.computedAqi?.category ?? 'Moderate';
  const dom = snapshot.computedAqi?.dominantPollutant ?? 'PM2.5';
  const cityName = snapshot.current[0]?.location?.name || 'your area';

  let answerEn = '';

  if (queryLower.includes('pm2.5') || queryLower.includes('pm25')) {
    answerEn = `PM2.5 refers to fine particulate matter smaller than 2.5 micrometers. These particles are tiny enough to penetrate deep into the lungs. In ${cityName} today, PM2.5 is currently at ${snapshot.current.find(m => m.pollutant === 'pm2_5')?.value ?? '--'} µg/m³.`;
  } else if (queryLower.includes('aqi') || queryLower.includes('today')) {
    answerEn = `Today's India National AQI for ${cityName} is ${aqiVal} (${aqiCat}), with ${dom.toUpperCase()} as the prominent pollutant. This is a regional CAMS model estimate.`;
  } else if (queryLower.includes('tamil') || language === 'ta') {
    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: `${cityName}-ன் இன்றைய காற்று குறியீடு (IN NAQI) ${aqiVal} ஆகும் (${aqiCat}). இதில் முதன்மை காரணியாக ${dom.toUpperCase()} உள்ளது.`,
      timestamp: new Date().toISOString(),
      profileCategory: category,
      language: 'ta',
    };
  } else if (queryLower.includes('hindi') || language === 'hi') {
    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: `${cityName} के लिए आज का भारतीय वायु गुणवत्ता सूचकांक (IN NAQI) ${aqiVal} (${aqiCat}) है, जिसमें मुख्य प्रदूषक ${dom.toUpperCase()} है।`,
      timestamp: new Date().toISOString(),
      profileCategory: category,
      language: 'hi',
    };
  } else {
    answerEn = `For ${cityName}, the current environmental air index is ${aqiVal} (${aqiCat}) based on CAMS regional model projections. Dominant pollutant: ${dom.toUpperCase()}.`;
  }

  // Adjust style for Child
  if (category === 'CHILD' && language === 'en') {
    answerEn = `The air today has an index of ${aqiVal} (${aqiCat}). ${dom.toUpperCase()} particles are in the air. Remember to drink water and play safely!`;
  }

  return {
    id: `ai-${Date.now()}`,
    role: 'assistant',
    content: answerEn,
    timestamp: new Date().toISOString(),
    profileCategory: category,
    language,
  };
}
