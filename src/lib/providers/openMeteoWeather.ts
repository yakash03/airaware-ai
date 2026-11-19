// AirAware AI V2 — Open-Meteo Weather Forecast Service

import { OpenMeteoWeatherResponse } from '../types';
import { CONFIG } from '../config';
import { ProviderError } from '../errors/providerError';
import { cache } from '../cache/ttlCache';

export async function fetchWeather(
  latitude: number,
  longitude: number,
  timezone: string = 'auto'
): Promise<OpenMeteoWeatherResponse> {
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
      provider: 'open-meteo-weather',
      retryable: false,
    });
  }

  const latRounded = Number(latitude.toFixed(4));
  const lonRounded = Number(longitude.toFixed(4));
  const cacheKey = `weather:${latRounded}:${lonRounded}:${timezone}`;

  const cached = cache.get<OpenMeteoWeatherResponse>(cacheKey);
  if (cached) {
    return cached;
  }

  const url = `${CONFIG.openMeteoWeather.baseUrl}?latitude=${latRounded}&longitude=${lonRounded}&hourly=${CONFIG.openMeteoWeather.hourlyParams}&forecast_days=${CONFIG.openMeteoWeather.forecastDays}&timezone=${encodeURIComponent(
    timezone
  )}`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), CONFIG.openMeteoWeather.timeout);

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
        message: `Weather API responded with HTTP ${response.status}`,
        code: 'PROVIDER_HTTP_ERROR',
        provider: 'open-meteo-weather',
        statusCode: response.status,
        retryable: response.status >= 500,
      });
    }

    const data = (await response.json()) as OpenMeteoWeatherResponse;

    if (!data.hourly || !Array.isArray(data.hourly.time) || data.hourly.time.length === 0) {
      throw new ProviderError({
        message: 'Weather API returned empty hourly data',
        code: 'EMPTY_RESPONSE',
        provider: 'open-meteo-weather',
        retryable: true,
      });
    }

    cache.set(cacheKey, data, CONFIG.cache.weatherTTL);
    return data;
  } catch (err: unknown) {
    if (err instanceof ProviderError) throw err;

    if (err instanceof Error && err.name === 'AbortError') {
      throw new ProviderError({
        message: 'Weather API request timed out (8s)',
        code: 'PROVIDER_TIMEOUT',
        provider: 'open-meteo-weather',
        retryable: true,
      });
    }

    throw new ProviderError({
      message: err instanceof Error ? err.message : 'Unknown Weather API error',
      code: 'PROVIDER_UNREACHABLE',
      provider: 'open-meteo-weather',
      retryable: true,
      cause: err,
    });
  }
}
