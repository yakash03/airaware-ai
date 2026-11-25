// AirAware AI V2 — Indoor Air Advisor API Route
// POST /api/indoor-advisor
// Strictly non-sensor: never fabricates indoor measurements.

import { NextRequest, NextResponse } from 'next/server';
import { calculateIndoorGuidance } from '@/lib/rules/indoorAdvisorRules';
import { explainIndoorPlanWithGemini } from '@/lib/ai/indoorExplainer';
import { ApiResponse, IndoorAdvisorPlan } from '@/lib/types';
import {
  handleRouteError,
  parseIndoorSetup,
  parseJsonBody,
  parseLanguage,
  parseOptionalPollutant,
  parseProfileCategory,
  RequestValidationError,
  sanitizeLocationName,
} from '@/lib/api/validation';

interface IndoorAdvisorRequestBody {
  setup?: unknown;
  outdoorAqi?: unknown;
  outdoorCategory?: unknown;
  dominantPollutant?: unknown;
  profileCategory?: unknown;
  language?: unknown;
  locationName?: unknown;
}

export async function POST(req: NextRequest) {
  const nowIso = new Date().toISOString();

  try {
    const body = await parseJsonBody<IndoorAdvisorRequestBody>(req);
    const setup = parseIndoorSetup(body.setup);
    const profileCategory = parseProfileCategory(body.profileCategory, 'ADULT');
    const language = parseLanguage(body.language, 'en');
    const dominantPollutant = parseOptionalPollutant(body.dominantPollutant);
    const locationName = sanitizeLocationName(
      typeof body.locationName === 'string' ? body.locationName : undefined
    );

    let outdoorAqi: number | null = null;
    if (body.outdoorAqi !== undefined && body.outdoorAqi !== null) {
      if (typeof body.outdoorAqi !== 'number' || !Number.isFinite(body.outdoorAqi) || body.outdoorAqi < 0) {
        throw new RequestValidationError('outdoorAqi must be a finite non-negative number or null.');
      }
      outdoorAqi = body.outdoorAqi;
    }

    const outdoorCategory =
      typeof body.outdoorCategory === 'string'
        ? body.outdoorCategory.replace(/[\u0000-\u001F\u007F]/g, '').trim().slice(0, 40)
        : null;

    const initialPlan = calculateIndoorGuidance(
      setup,
      outdoorAqi,
      outdoorCategory,
      dominantPollutant,
      profileCategory,
      language,
      locationName
    );

    const finalPlan = await explainIndoorPlanWithGemini(initialPlan);

    return NextResponse.json<ApiResponse<IndoorAdvisorPlan>>({
      success: true,
      data: finalPlan,
      fetchedAt: nowIso,
    });
  } catch (error: unknown) {
    return handleRouteError<IndoorAdvisorPlan>(
      '/api/indoor-advisor',
      error,
      'Unable to evaluate indoor environment guidance right now.'
    );
  }
}
