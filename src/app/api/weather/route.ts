// AirAware AI V2 — Weather Forecast API Route Handler
// GET /api/weather?lat=13.0827&lon=80.2707&timezone=Asia/Kolkata

import { NextRequest, NextResponse } from 'next/server';
import { fetchWeather } from '@/lib/providers/openMeteoWeather';
import { ApiResponse, OpenMeteoWeatherResponse } from '@/lib/types';
import { ProviderError } from '@/lib/errors/providerError';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');
  const timezone = searchParams.get('timezone') || 'auto';

  const nowIso = new Date().toISOString();

  if (!latStr || !lonStr) {
    return NextResponse.json<ApiResponse<OpenMeteoWeatherResponse>>(
      {
        success: false,
        error: 'Missing required parameters "lat" and "lon".',
        fetchedAt: nowIso,
      },
      { status: 400 }
    );
  }

  const lat = parseFloat(latStr);
  const lon = parseFloat(lonStr);

  if (isNaN(lat) || isNaN(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json<ApiResponse<OpenMeteoWeatherResponse>>(
      {
        success: false,
        error: 'Invalid coordinates provided.',
        fetchedAt: nowIso,
      },
      { status: 400 }
    );
  }

  try {
    const data = await fetchWeather(lat, lon, timezone);

    return NextResponse.json<ApiResponse<OpenMeteoWeatherResponse>>({
      success: true,
      data,
      fetchedAt: nowIso,
    });
  } catch (error: unknown) {
    console.error('[API /api/weather Error]:', error);

    const errorMessage =
      error instanceof ProviderError
        ? error.message
        : 'Failed to retrieve weather data.';

    const status = error instanceof ProviderError && error.statusCode ? error.statusCode : 500;

    return NextResponse.json<ApiResponse<OpenMeteoWeatherResponse>>(
      {
        success: false,
        error: errorMessage,
        fetchedAt: nowIso,
      },
      { status: status >= 400 && status < 600 ? status : 500 }
    );
  }
}
