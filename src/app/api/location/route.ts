// AirAware AI V2 — Location Search API Route Handler
// GET /api/location?q=Chennai

import { NextRequest, NextResponse } from 'next/server';
import { searchLocations } from '@/lib/providers/openMeteoGeo';
import { ApiResponse, GeoLocation } from '@/lib/types';
import { handleRouteError, RequestValidationError } from '@/lib/api/validation';

const MAX_QUERY_LENGTH = 100;

export async function GET(request: NextRequest) {
  const nowIso = new Date().toISOString();

  try {
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get('q');
    const cleanQuery = rawQuery?.replace(/[\u0000-\u001F\u007F]/g, '').trim() ?? '';

    if (cleanQuery.length < 2) {
      throw new RequestValidationError('Query parameter "q" must be at least 2 characters.');
    }
    if (cleanQuery.length > MAX_QUERY_LENGTH) {
      throw new RequestValidationError(`Query parameter "q" cannot exceed ${MAX_QUERY_LENGTH} characters.`);
    }

    const locations = await searchLocations(cleanQuery);

    return NextResponse.json<ApiResponse<GeoLocation[]>>({
      success: true,
      data: locations,
      fetchedAt: nowIso,
    });
  } catch (error: unknown) {
    return handleRouteError<GeoLocation[]>(
      '/api/location',
      error,
      'Failed to search locations. Please try again.'
    );
  }
}
