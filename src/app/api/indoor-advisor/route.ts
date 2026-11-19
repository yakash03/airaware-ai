// AirAware AI V2 — Indoor Air Advisor API Route
// POST /api/indoor-advisor
// Combines user-provided room details with real outdoor data.
// Strictly non-sensor: never fabricates indoor measurements.

import { NextRequest, NextResponse } from 'next/server';
import { calculateIndoorGuidance, DEFAULT_INDOOR_SETUP } from '@/lib/rules/indoorAdvisorRules';
import { explainIndoorPlanWithGemini } from '@/lib/ai/indoorExplainer';
import {
  IndoorEnvironmentSetup,
  ProfileCategory,
  Language,
  PollutantId,
  ApiResponse,
  IndoorAdvisorPlan,
} from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      setup = DEFAULT_INDOOR_SETUP,
      outdoorAqi = null,
      outdoorCategory = null,
      dominantPollutant = null,
      profileCategory = 'ADULT',
      language = 'en',
      locationName = 'Selected Location',
    } = body as {
      setup?: IndoorEnvironmentSetup;
      outdoorAqi?: number | null;
      outdoorCategory?: string | null;
      dominantPollutant?: PollutantId | null;
      profileCategory?: ProfileCategory;
      language?: Language;
      locationName?: string;
    };

    // Calculate deterministic suggestions
    const initialPlan = calculateIndoorGuidance(
      setup,
      outdoorAqi,
      outdoorCategory,
      dominantPollutant,
      profileCategory as ProfileCategory,
      language as Language,
      locationName
    );

    // AI Enrichment (with deterministic fallback)
    const finalPlan = await explainIndoorPlanWithGemini(initialPlan);

    const response: ApiResponse<IndoorAdvisorPlan> = {
      success: true,
      data: finalPlan,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[/api/indoor-advisor] Error generating indoor plan:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error while evaluating indoor environment.',
        fetchedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
