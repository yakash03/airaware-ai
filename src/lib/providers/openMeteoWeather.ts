// AirAware AI V2 — Open-Meteo Weather Forecast Service

import { OpenMeteoWeatherResponse } from '../types';
import { CONFIG } from '../config';
import { ProviderError } from '../errors/providerError';
import { cache } from '../cache/ttlCache';
import { assertValidCoordinates, fetchProviderJson } from './httpClient';

/** Fetch hourly meteorological context from Open-Meteo with TTL caching. */
export async function fetchWeather(
  latitude: number,
  longitude: number,
  timezone: string = 'auto'
): Promise<OpenMeteoWeatherResponse> {
  const { latRounded, lonRounded } = assertValidCoordinates(
    latitude,
    longitude,
    'open-meteo-weather'
  );
  const cacheKey = `weather:${latRounded}:${lonRounded}:${timezone}`;

  const cached = cache.get<OpenMeteoWeatherResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  const url = `${CONFIG.openMeteoWeather.baseUrl}?latitude=${latRounded}&longitude=${lonRounded}&hourly=${CONFIG.openMeteoWeather.hourlyParams}&forecast_days=${CONFIG.openMeteoWeather.forecastDays}&timezone=${encodeURIComponent(
    timezone
  )}`;

  const data = await fetchProviderJson<OpenMeteoWeatherResponse>(url, {
    provider: 'open-meteo-weather',
    label: 'Weather API',
    timeoutMs: CONFIG.openMeteoWeather.timeout,
  });

  if (!data.hourly || !Array.isArray(data.hourly.time) || data.hourly.time.length === 0) {
    throw new ProviderError({
      message: 'Weather API returned empty hourly data',
      code: 'EMPTY_RESPONSE',
      provider: 'open-meteo-weather',
      statusCode: 502,
      retryable: true,
    });
  }

  cache.set(cacheKey, data, CONFIG.cache.weatherTTL);
  return data;
}
