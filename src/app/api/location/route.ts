// AirAware AI V2 — Location Search API Route Handler
// GET /api/location?q=Chennai

import { NextRequest, NextResponse } from 'next/server';
import { searchLocations } from '@/lib/providers/openMeteoGeo';
import { ApiResponse, GeoLocation } from '@/lib/types';
import { ProviderError } from '@/lib/errors/providerError';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  const nowIso = new Date().toISOString();

  if (!query || query.trim().length < 2) {
    return NextResponse.json<ApiResponse<GeoLocation[]>>(
      {
        success: false,
        error: 'Query parameter "q" must be at least 2 characters.',
        fetchedAt: nowIso,
      },
      { status: 400 }
    );
  }

  try {
    const locations = await searchLocations(query);

    return NextResponse.json<ApiResponse<GeoLocation[]>>({
      success: true,
      data: locations,
      fetchedAt: nowIso,
    });
  } catch (error: unknown) {
    console.error('[API /api/location Error]:', error);

    const errorMessage =
      error instanceof ProviderError
        ? error.message
        : 'Failed to search locations. Please try again.';

    const status = error instanceof ProviderError && error.statusCode ? error.statusCode : 500;

    return NextResponse.json<ApiResponse<GeoLocation[]>>(
      {
        success: false,
        error: errorMessage,
        fetchedAt: nowIso,
      },
      { status: status >= 400 && status < 600 ? status : 500 }
    );
  }
}
