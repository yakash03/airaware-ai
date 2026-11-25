// AirAware AI V2 — Air Quality API Route Handler
// GET /api/air?lat=13.0827&lon=80.2707&name=Chennai&timezone=Asia/Kolkata

import { NextRequest, NextResponse } from 'next/server';
import { fetchAirQuality } from '@/lib/providers/openMeteoAir';
import { fetchWeather } from '@/lib/providers/openMeteoWeather';
import { normalizeAirQualitySnapshot } from '@/lib/normalize/toMeasurement';
import { ApiResponse, AirSnapshot } from '@/lib/types';
import { cache } from '@/lib/cache/ttlCache';
import {
  handleRouteError,
  parseCoordinates,
  sanitizeLocationName,
  sanitizeTimezone,
} from '@/lib/api/validation';

export async function GET(request: NextRequest) {
  const nowIso = new Date().toISOString();

  try {
    const { searchParams } = new URL(request.url);
    const { lat, lon } = parseCoordinates(searchParams.get('lat'), searchParams.get('lon'));
    const name = sanitizeLocationName(searchParams.get('name'));
    const timezone = sanitizeTimezone(searchParams.get('timezone'));
    const refresh = searchParams.get('refresh') === 'true';

    if (refresh) {
      const latRounded = Number(lat.toFixed(4));
      const lonRounded = Number(lon.toFixed(4));
      cache.delete(`aq:${latRounded}:${lonRounded}:${timezone}`);
      cache.delete(`weather:${latRounded}:${lonRounded}:${timezone}`);
    }

    const [aqResult, weatherResult] = await Promise.allSettled([
      fetchAirQuality(lat, lon, timezone),
      fetchWeather(lat, lon, timezone),
    ]);

    if (aqResult.status === 'rejected') {
      throw aqResult.reason;
    }

    const aqData = aqResult.value;
    const weatherData = weatherResult.status === 'fulfilled' ? weatherResult.value : null;
    const snapshot = normalizeAirQualitySnapshot(aqData, weatherData, name);

    return NextResponse.json<ApiResponse<AirSnapshot>>({
      success: true,
      data: snapshot,
      fetchedAt: nowIso,
    });
  } catch (error: unknown) {
    return handleRouteError<AirSnapshot>(
      '/api/air',
      error,
      'Failed to retrieve environmental data. Please try again.'
    );
  }
}
