// AirAware AI V2 — Open-Meteo Air Quality Provider Service

import { OpenMeteoAirQualityResponse } from '../types';
import { CONFIG } from '../config';
import { ProviderError } from '../errors/providerError';
import { cache } from '../cache/ttlCache';

export async function fetchAirQuality(
  latitude: number,
  longitude: number,
  timezone: string = 'auto'
): Promise<OpenMeteoAirQualityResponse> {
  // Validate coordinates
  if (
    isNaN(latitude) ||
    isNaN(longitude) ||
    latitude < CONFIG.coordinates.minLat ||
    latitude > CONFIG.coordinates.maxLat ||
    longitude < CONFIG.coordinates.minLon ||
    longitude > CONFIG.coordinates.maxLon
  ) {
    throw new ProviderError({
      message: `Invalid coordinates: lat=${latitude}, lon=${longitude}`,
      code: 'INVALID_COORDINATES',
      provider: 'open-meteo-air',
      retryable: false,
    });
  }

  // Snap to 4 decimal places for consistent cache hits
  const latRounded = Number(latitude.toFixed(4));
  const lonRounded = Number(longitude.toFixed(4));
  const cacheKey = `aq:${latRounded}:${lonRounded}:${timezone}`;

  const cached = cache.get<OpenMeteoAirQualityResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  const url = `${CONFIG.openMeteoAir.baseUrl}?latitude=${latRounded}&longitude=${lonRounded}&hourly=${CONFIG.openMeteoAir.hourlyParams}&past_days=${CONFIG.openMeteoAir.pastDays}&forecast_days=${CONFIG.openMeteoAir.forecastDays}&timezone=${encodeURIComponent(
    timezone
  )}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.openMeteoAir.timeout);

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
        message: `Air Quality API responded with HTTP ${response.status}`,
        code: 'PROVIDER_HTTP_ERROR',
        provider: 'open-meteo-air',
        statusCode: response.status,
        retryable: response.status >= 500,
      });
    }

    const data = (await response.json()) as OpenMeteoAirQualityResponse;

    if (!data.hourly || !Array.isArray(data.hourly.time) || data.hourly.time.length === 0) {
      throw new ProviderError({
        message: 'Air Quality API returned empty hourly data',
        code: 'EMPTY_RESPONSE',
        provider: 'open-meteo-air',
        retryable: true,
      });
    }

    cache.set(cacheKey, data, CONFIG.cache.airQualityTTL);
    return data;
  } catch (err: unknown) {
    if (err instanceof ProviderError) throw err;

    if (err instanceof Error && err.name === 'AbortError') {
      throw new ProviderError({
        message: 'Air Quality API request timed out (8s)',
        code: 'PROVIDER_TIMEOUT',
        provider: 'open-meteo-air',
        retryable: true,
      });
    }

    throw new ProviderError({
      message: err instanceof Error ? err.message : 'Unknown Air Quality API error',
      code: 'PROVIDER_UNREACHABLE',
      provider: 'open-meteo-air',
      retryable: true,
      cause: err,
    });
  }
}
