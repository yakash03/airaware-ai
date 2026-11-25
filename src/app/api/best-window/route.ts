// AirAware AI V2 — Best Window & Outdoor Activity Planner API Route
// POST /api/best-window

import { NextRequest, NextResponse } from 'next/server';
import { calculateBestWindows } from '@/lib/rules/bestWindowRules';
import { explainWindowWithGemini } from '@/lib/ai/windowExplainer';
import { ApiResponse, BestWindowPlan, HourlySlot } from '@/lib/types';
import {
  handleRouteError,
  parseActivity,
  parseJsonBody,
  parseLanguage,
  parseProfileCategory,
  RequestValidationError,
  sanitizeLocationName,
} from '@/lib/api/validation';

interface BestWindowRequestBody {
  hourlyForecast?: unknown;
  activity?: unknown;
  profileCategory?: unknown;
  language?: unknown;
  locationName?: unknown;
}

export async function POST(req: NextRequest) {
  const nowIso = new Date().toISOString();

  try {
    const body = await parseJsonBody<BestWindowRequestBody>(req);

    if (!body.hourlyForecast || !Array.isArray(body.hourlyForecast)) {
      throw new RequestValidationError('Missing or invalid hourlyForecast array.');
    }

    const activity = parseActivity(body.activity, 'WALKING');
    const profileCategory = parseProfileCategory(body.profileCategory, 'ADULT');
    const language = parseLanguage(body.language, 'en');
    const locationName = sanitizeLocationName(
      typeof body.locationName === 'string' ? body.locationName : undefined
    );

    const initialPlan = calculateBestWindows(
      body.hourlyForecast as HourlySlot[],
      activity,
      profileCategory,
      language,
      locationName
    );

    const finalPlan = await explainWindowWithGemini(initialPlan);

    return NextResponse.json<ApiResponse<BestWindowPlan>>({
      success: true,
      data: finalPlan,
      fetchedAt: nowIso,
    });
  } catch (error: unknown) {
    return handleRouteError<BestWindowPlan>(
      '/api/best-window',
      error,
      'Unable to evaluate forecast windows right now.'
    );
  }
}
