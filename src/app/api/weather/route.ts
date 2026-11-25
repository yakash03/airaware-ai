// AirAware AI V2 — Weather Forecast API Route Handler
// GET /api/weather?lat=13.0827&lon=80.2707&timezone=Asia/Kolkata

import { NextRequest, NextResponse } from 'next/server';
import { fetchWeather } from '@/lib/providers/openMeteoWeather';
import { ApiResponse, OpenMeteoWeatherResponse } from '@/lib/types';
import { handleRouteError, parseCoordinates, sanitizeTimezone } from '@/lib/api/validation';

export async function GET(request: NextRequest) {
  const nowIso = new Date().toISOString();

  try {
    const { searchParams } = new URL(request.url);
    const { lat, lon } = parseCoordinates(searchParams.get('lat'), searchParams.get('lon'));
    const timezone = sanitizeTimezone(searchParams.get('timezone'));
    const data = await fetchWeather(lat, lon, timezone);

    return NextResponse.json<ApiResponse<OpenMeteoWeatherResponse>>({
      success: true,
      data,
      fetchedAt: nowIso,
    });
  } catch (error: unknown) {
    return handleRouteError<OpenMeteoWeatherResponse>(
      '/api/weather',
      error,
      'Failed to retrieve weather data.'
    );
  }
}
