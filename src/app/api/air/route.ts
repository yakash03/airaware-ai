// AirAware AI V2 — Air Quality API Route Handler
// GET /api/air?lat=13.0827&lon=80.2707&name=Chennai&timezone=Asia/Kolkata

import { NextRequest, NextResponse } from 'next/server';
import { fetchAirQuality } from '@/lib/providers/openMeteoAir';
import { fetchWeather } from '@/lib/providers/openMeteoWeather';
import { normalizeAirQualitySnapshot } from '@/lib/normalize/toMeasurement';
import { ApiResponse, AirSnapshot } from '@/lib/types';
import { ProviderError } from '@/lib/errors/providerError';
import { cache } from '@/lib/cache/ttlCache';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const latStr = searchParams.get('lat');
  const lonStr = searchParams.get('lon');
  const name = searchParams.get('name') || 'Selected Location';
  const timezone = searchParams.get('timezone') || 'auto';
  const refresh = searchParams.get('refresh') === 'true';

  const nowIso = new Date().toISOString();

  if (!latStr || !lonStr) {
    return NextResponse.json<ApiResponse<AirSnapshot>>(
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
    return NextResponse.json<ApiResponse<AirSnapshot>>(
      {
        success: false,
        error: 'Invalid coordinates provided. Latitude must be between -90 and 90, Longitude between -180 and 180.',
        fetchedAt: nowIso,
      },
      { status: 400 }
    );
  }

  // Bypass cache if manual refresh requested
  if (refresh) {
    const latRounded = Number(lat.toFixed(4));
    const lonRounded = Number(lon.toFixed(4));
    cache.delete(`aq:${latRounded}:${lonRounded}:${timezone}`);
    cache.delete(`weather:${latRounded}:${lonRounded}:${timezone}`);
  }

  try {
    // Fetch Air Quality and Weather in parallel
    const [aqResult, weatherResult] = await Promise.allSettled([
      fetchAirQuality(lat, lon, timezone),
      fetchWeather(lat, lon, timezone),
    ]);

    if (aqResult.status === 'rejected') {
      throw aqResult.reason;
    }

    const aqData = aqResult.value;
    const weatherData = weatherResult.status === 'fulfilled' ? weatherResult.value : null;

    // Normalize into typed AirSnapshot
    const snapshot = normalizeAirQualitySnapshot(aqData, weatherData, name);

    return NextResponse.json<ApiResponse<AirSnapshot>>({
      success: true,
      data: snapshot,
      fetchedAt: nowIso,
    });
  } catch (error: unknown) {
    console.error('[API /api/air Error]:', error);

    const errorMessage =
      error instanceof ProviderError
        ? error.message
        : 'Failed to retrieve environmental data. Please try again.';

    const status = error instanceof ProviderError && error.statusCode ? error.statusCode : 500;

    return NextResponse.json<ApiResponse<AirSnapshot>>(
      {
        success: false,
        error: errorMessage,
        fetchedAt: nowIso,
      },
      { status: status >= 400 && status < 600 ? status : 500 }
    );
  }
}
