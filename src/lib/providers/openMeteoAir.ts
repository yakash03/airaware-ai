// AirAware AI V2 — Open-Meteo Air Quality Provider Service

import { OpenMeteoAirQualityResponse } from '../types';
import { CONFIG } from '../config';
import { ProviderError } from '../errors/providerError';
import { cache } from '../cache/ttlCache';
import { assertValidCoordinates, fetchProviderJson } from './httpClient';

/** Fetch hourly CAMS air-quality forecast/estimates from Open-Meteo with TTL caching. */
export async function fetchAirQuality(
  latitude: number,
  longitude: number,
  timezone: string = 'auto'
): Promise<OpenMeteoAirQualityResponse> {
  const { latRounded, lonRounded } = assertValidCoordinates(latitude, longitude, 'open-meteo-air');
  const cacheKey = `aq:${latRounded}:${lonRounded}:${timezone}`;

  const cached = cache.get<OpenMeteoAirQualityResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  const url = `${CONFIG.openMeteoAir.baseUrl}?latitude=${latRounded}&longitude=${lonRounded}&hourly=${CONFIG.openMeteoAir.hourlyParams}&past_days=${CONFIG.openMeteoAir.pastDays}&forecast_days=${CONFIG.openMeteoAir.forecastDays}&timezone=${encodeURIComponent(
    timezone
  )}`;

  const data = await fetchProviderJson<OpenMeteoAirQualityResponse>(url, {
    provider: 'open-meteo-air',
    label: 'Air Quality API',
    timeoutMs: CONFIG.openMeteoAir.timeout,
  });

  if (!data.hourly || !Array.isArray(data.hourly.time) || data.hourly.time.length === 0) {
    throw new ProviderError({
      message: 'Air Quality API returned empty hourly data',
      code: 'EMPTY_RESPONSE',
      provider: 'open-meteo-air',
      statusCode: 502,
      retryable: true,
    });
  }

  cache.set(cacheKey, data, CONFIG.cache.airQualityTTL);
  return data;
}
