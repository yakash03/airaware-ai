// AirAware AI V2 — Shared Server-Side Gemini Client
// Passes API keys strictly via the x-goog-api-key header (never in URLs).

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const DEFAULT_TIMEOUT_MS = 7000;

interface GeminiGenerateResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
}

export interface GeminiRequestOptions {
  prompt: string;
  responseMimeType?: 'application/json' | 'text/plain';
  maxOutputTokens?: number;
  temperature?: number;
}

/** Return the server-side Gemini API key if configured. */
export function getGeminiApiKey(): string {
  return process.env.GEMINI_API_KEY?.trim() ?? '';
}

/** Call Gemini 2.0 Flash server-side using header auth and strict timeout, returning raw text or null on failure. */
export async function callGeminiModel(options: GeminiRequestOptions): Promise<string | null> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const response = await fetch(GEMINI_ENDPOINT, {
      method: 'POST',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: options.prompt }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.2,
          ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
          ...(options.maxOutputTokens ? { maxOutputTokens: options.maxOutputTokens } : {}),
        },
      }),
    });

    if (!response.ok) {
      console.warn(`[Gemini API] HTTP ${response.status}. Falling back to deterministic output.`);
      return null;
    }

    const data = (await response.json()) as GeminiGenerateResponse;
    return data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
  } catch (err: unknown) {
    console.warn('[Gemini Error or Timeout]:', err instanceof Error ? err.message : 'Unknown error');
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

/** Parse a JSON object from Gemini output, safely stripping optional markdown fences. */
export function parseGeminiJsonObject<T extends Record<string, unknown>>(rawText: string): T | null {
  try {
    const cleaned = rawText
      .replace(/^```(?:json)?\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();
    const parsed: unknown = JSON.parse(cleaned);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null;
    }
    return parsed as T;
  } catch {
    return null;
  }
}
