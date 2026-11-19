// AirAware AI V2 — Best Window & Outdoor Activity Planner API Route
// POST /api/best-window
// Receives genuine hourly forecast slots, calculates deterministic window rankings,
// and optionally enriches with grounded AI explanations.

import { NextRequest, NextResponse } from 'next/server';
import { calculateBestWindows } from '@/lib/rules/bestWindowRules';
import { explainWindowWithGemini } from '@/lib/ai/windowExplainer';
import { ActivityType, ProfileCategory, Language, HourlySlot, ApiResponse, BestWindowPlan } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      hourlyForecast,
      activity = 'WALKING',
      profileCategory = 'ADULT',
      language = 'en',
      locationName = 'Selected Location',
    } = body as {
      hourlyForecast?: HourlySlot[];
      activity?: ActivityType;
      profileCategory?: ProfileCategory;
      language?: Language;
      locationName?: string;
    };

    if (!hourlyForecast || !Array.isArray(hourlyForecast)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing or invalid hourlyForecast array.',
          fetchedAt: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    // Deterministic calculation
    const initialPlan = calculateBestWindows(
      hourlyForecast,
      activity as ActivityType,
      profileCategory as ProfileCategory,
      language as Language,
      locationName
    );

    // AI Enrichment (with deterministic fallback)
    const finalPlan = await explainWindowWithGemini(initialPlan);

    const response: ApiResponse<BestWindowPlan> = {
      success: true,
      data: finalPlan,
      fetchedAt: new Date().toISOString(),
    };

    return NextResponse.json(response);
  } catch (error: any) {
    console.error('[/api/best-window] Error generating window plan:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error while evaluating forecast windows.',
        fetchedAt: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
