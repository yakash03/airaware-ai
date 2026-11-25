// AirAware AI V2 — Age-Adaptive Explanation Route Handler
// POST /api/explain

import { NextRequest, NextResponse } from 'next/server';
import { AgeExplanation, ApiResponse } from '@/lib/types';
import { explainAirForProfile } from '@/lib/ai/gemini';
import {
  assertValidSnapshot,
  handleRouteError,
  parseJsonBody,
  parseLanguage,
  parseProfileCategory,
} from '@/lib/api/validation';

interface ExplainRequestBody {
  snapshot?: unknown;
  category?: unknown;
  profileCategory?: unknown;
  language?: unknown;
}

export async function POST(request: NextRequest) {
  const nowIso = new Date().toISOString();

  try {
    const body = await parseJsonBody<ExplainRequestBody>(request);
    assertValidSnapshot(body.snapshot);

    const targetCategory = parseProfileCategory(body.category ?? body.profileCategory, 'ADULT');
    const targetLang = parseLanguage(body.language, 'en');

    const explanation = await explainAirForProfile(body.snapshot, targetCategory, targetLang);

    return NextResponse.json<ApiResponse<AgeExplanation>>({
      success: true,
      data: explanation,
      fetchedAt: nowIso,
    });
  } catch (error: unknown) {
    return handleRouteError<AgeExplanation>(
      '/api/explain',
      error,
      'Failed to generate age-adapted explanation.'
    );
  }
}
