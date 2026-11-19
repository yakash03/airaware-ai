// AirAware AI V2 — Open-Meteo Geocoding Service

import { GeoLocation, OpenMeteoGeocodingResponse } from '../types';
import { CONFIG } from '../config';
import { ProviderError } from '../errors/providerError';
import { cache } from '../cache/ttlCache';

export async function searchLocations(query: string): Promise<GeoLocation[]> {
  const trimmed = query.trim();
  if (!trimmed || trimmed.length < 2) {
    return [];
  }

  const cacheKey = `geo:${trimmed.toLowerCase()}`;
  const cached = cache.get<GeoLocation[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const url = `${CONFIG.openMeteoGeo.baseUrl}?name=${encodeURIComponent(
    trimmed
  )}&count=${CONFIG.openMeteoGeo.maxResults}&language=${CONFIG.openMeteoGeo.language}&format=json`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.openMeteoGeo.timeout);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'AirAware-AI/2.0',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new ProviderError({
        message: `Geocoding failed with status ${response.status}`,
        code: 'PROVIDER_HTTP_ERROR',
        provider: 'open-meteo-geocoding',
        statusCode: response.status,
        retryable: response.status >= 500,
      });
    }

    const data = (await response.json()) as OpenMeteoGeocodingResponse;

    if (!data.results || data.results.length === 0) {
      return [];
    }

    const locations: GeoLocation[] = data.results.map((r) => ({
      id: r.id,
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country,
      admin1: r.admin1,
      admin2: r.admin2,
      timezone: r.timezone || 'Asia/Kolkata',
      population: r.population,
      countryCode: r.country_code,
    }));

    cache.set(cacheKey, locations, CONFIG.cache.geocodingTTL);
    return locations;
  } catch (err: unknown) {
    if (err instanceof ProviderError) throw err;

    if (err instanceof Error && err.name === 'AbortError') {
      throw new ProviderError({
        message: 'Geocoding request timed out',
        code: 'PROVIDER_TIMEOUT',
        provider: 'open-meteo-geocoding',
        retryable: true,
      });
    }

    throw new ProviderError({
      message: err instanceof Error ? err.message : 'Unknown geocoding error',
      code: 'PROVIDER_UNREACHABLE',
      provider: 'open-meteo-geocoding',
      retryable: true,
      cause: err,
    });
  }
}
