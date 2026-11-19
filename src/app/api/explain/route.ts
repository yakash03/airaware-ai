// AirAware AI V2 — Age-Adaptive Explanation Route Handler
// POST /api/explain

import { NextRequest, NextResponse } from 'next/server';
import { AirSnapshot, ProfileCategory, Language, AgeExplanation, ApiResponse } from '@/lib/types';
import { explainAirForProfile } from '@/lib/ai/gemini';

export async function POST(request: NextRequest) {
  const nowIso = new Date().toISOString();

  try {
    const body = await request.json();
    const { snapshot, category, profileCategory, language } = body as {
      snapshot?: AirSnapshot;
      category?: ProfileCategory;
      profileCategory?: ProfileCategory;
      language?: Language;
    };

    if (!snapshot || !snapshot.current) {
      return NextResponse.json<ApiResponse<AgeExplanation>>(
        {
          success: false,
          error: 'Missing required environmental snapshot data.',
          fetchedAt: nowIso,
        },
        { status: 400 }
      );
    }

    const targetCategory: ProfileCategory = category || profileCategory || 'ADULT';
    const targetLang: Language = language || 'en';

    const explanation = await explainAirForProfile(snapshot, targetCategory, targetLang);

    return NextResponse.json<ApiResponse<AgeExplanation>>({
      success: true,
      data: explanation,
      fetchedAt: nowIso,
    });
  } catch (error: unknown) {
    console.error('[API /api/explain Error]:', error);
    return NextResponse.json<ApiResponse<AgeExplanation>>(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate explanation.',
        fetchedAt: nowIso,
      },
      { status: 500 }
    );
  }
}
