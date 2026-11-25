// AirAware AI V2 — Secure Gemini AI Integration & Grounded Fallback Engine
// Strict adherence to Real Data Only, Zero Hallucination, and Medical Disclaimers

import { AirSnapshot, ProfileCategory, Language, AgeExplanation, ChatMessage } from '../types';
import { generateDeterministicExplanation } from '../rules/deterministicExplanations';
import { validateAiOutput } from './validator';
import { callGeminiModel, parseGeminiJsonObject } from './geminiClient';

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

function resolveLanguageName(language: Language): string {
  if (language === 'ta') return 'Tamil';
  if (language === 'hi') return 'Hindi';
  return 'English';
}

interface ExplanationJson {
  headline?: string;
  summary?: string;
  activityGuidance?: string;
  pollutantBreakdown?: string;
  [key: string]: unknown;
}

/** Explain an environmental snapshot for a target family profile using Gemini with deterministic fallback. */
export async function explainAirForProfile(
  snapshot: AirSnapshot,
  category: ProfileCategory,
  language: Language = 'en'
): Promise<AgeExplanation> {
  const fallback = generateDeterministicExplanation(snapshot, category, language);
  const allowedNumbers = collectAllowedNumbers(snapshot);
  const langLabel = resolveLanguageName(language);

  const systemInstruction = `You are AirAware AI, an environmental data communication specialist.
Your role is to explain verified environmental air-quality data to a family member in the ${category} age group.

STRICT NON-NEGOTIABLE RULES:
1. Use ONLY the numbers provided in the input. Never invent, extrapolate, or estimate unmeasured values.
2. The AQI scale is India CPCB National AQI (0-500). Do NOT substitute US EPA AQI or European AQI.
3. This is a regional atmospheric model estimate (CAMS), not a local street sensor.
4. NO MEDICAL DIAGNOSIS. Do NOT prescribe, treat, diagnose, or say "safe/unsafe for all". Use cautious phrasing like "potentially more favorable".
5. Target Language: ${langLabel}.
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

  const rawOutput = await callGeminiModel({
    prompt: `${systemInstruction}\n\nDATA:\n${promptContent}`,
    responseMimeType: 'application/json',
    maxOutputTokens: 600,
  });

  if (!rawOutput) return fallback;

  const parsed = parseGeminiJsonObject<ExplanationJson>(rawOutput);
  if (!parsed) return fallback;

  const combinedText = `${parsed.headline ?? ''} ${parsed.summary ?? ''} ${parsed.activityGuidance ?? ''} ${parsed.pollutantBreakdown ?? ''}`;
  const validation = validateAiOutput(combinedText, allowedNumbers);
  if (!validation.isValid) {
    console.warn(`[Gemini Validation Failed]: ${validation.reason}. Falling back to deterministic output.`);
    return fallback;
  }

  return {
    profileCategory: category,
    headline: typeof parsed.headline === 'string' && parsed.headline ? parsed.headline : fallback.headline,
    summary: typeof parsed.summary === 'string' && parsed.summary ? parsed.summary : fallback.summary,
    activityGuidance:
      typeof parsed.activityGuidance === 'string' && parsed.activityGuidance
        ? parsed.activityGuidance
        : fallback.activityGuidance,
    pollutantBreakdown:
      typeof parsed.pollutantBreakdown === 'string' && parsed.pollutantBreakdown
        ? parsed.pollutantBreakdown
        : fallback.pollutantBreakdown,
    cautionLevel: fallback.cautionLevel,
    language,
    whyAdvice: fallback.whyAdvice,
  };
}

/** Grounded conversational assistant ("Ask AirAware AI") with deterministic fallback. */
export async function askAirAwareAi(
  userQuestion: string,
  snapshot: AirSnapshot,
  category: ProfileCategory = 'ADULT',
  language: Language = 'en'
): Promise<ChatMessage> {
  const allowedNumbers = collectAllowedNumbers(snapshot);
  const nowIso = new Date().toISOString();
  const langLabel = resolveLanguageName(language);

  const systemInstruction = `You are AirAware AI Assistant. Answer the user's question about air quality strictly using the provided environmental snapshot.
Target Audience: ${category}
Language: ${langLabel}

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

  const answer = await callGeminiModel({
    prompt: `${systemInstruction}\nCONTEXT: ${contextData}\nQUESTION: ${userQuestion}`,
    maxOutputTokens: 300,
  });

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
}

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
  const nowIso = new Date().toISOString();

  if (queryLower.includes('tamil') || language === 'ta') {
    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: `${cityName}-ன் இன்றைய காற்று குறியீடு (IN NAQI) ${aqiVal} ஆகும் (${aqiCat}). இதில் முதன்மை காரணியாக ${dom.toUpperCase()} உள்ளது.`,
      timestamp: nowIso,
      profileCategory: category,
      language: 'ta',
    };
  }

  if (queryLower.includes('hindi') || language === 'hi') {
    return {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: `${cityName} के लिए आज का भारतीय वायु गुणवत्ता सूचकांक (IN NAQI) ${aqiVal} (${aqiCat}) है, जिसमें मुख्य प्रदूषक ${dom.toUpperCase()} है।`,
      timestamp: nowIso,
      profileCategory: category,
      language: 'hi',
    };
  }

  let answerEn = '';
  if (queryLower.includes('pm2.5') || queryLower.includes('pm25')) {
    const pmVal = snapshot.current.find((m) => m.pollutant === 'pm2_5')?.value ?? '--';
    answerEn = `PM2.5 refers to fine particulate matter smaller than 2.5 micrometers. These particles are tiny enough to penetrate deep into the lungs. In ${cityName} today, PM2.5 is currently at ${pmVal} µg/m³.`;
  } else if (queryLower.includes('aqi') || queryLower.includes('today')) {
    answerEn = `Today's India National AQI for ${cityName} is ${aqiVal} (${aqiCat}), with ${dom.toUpperCase()} as the prominent pollutant. This is a regional CAMS model estimate.`;
  } else {
    answerEn = `For ${cityName}, the current environmental air index is ${aqiVal} (${aqiCat}) based on CAMS regional model projections. Dominant pollutant: ${dom.toUpperCase()}.`;
  }

  if (category === 'CHILD') {
    answerEn = `The air today has an index of ${aqiVal} (${aqiCat}). ${dom.toUpperCase()} particles are in the air. Remember to drink water and play safely!`;
  }

  return {
    id: `ai-${Date.now()}`,
    role: 'assistant',
    content: answerEn,
    timestamp: nowIso,
    profileCategory: category,
    language,
  };
}
