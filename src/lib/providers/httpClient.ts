// AirAware AI V2 — Shared Open-Meteo HTTP Client & Coordinate Validator

import { CONFIG } from '../config';
import { ProviderError } from '../errors/providerError';

/** Validate coordinates against configured planetary bounds. */
export function assertValidCoordinates(
  latitude: number,
  longitude: number,
  provider: string
): { latRounded: number; lonRounded: number } {
  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < CONFIG.coordinates.minLat ||
    latitude > CONFIG.coordinates.maxLat ||
    longitude < CONFIG.coordinates.minLon ||
    longitude > CONFIG.coordinates.maxLon
  ) {
    throw new ProviderError({
      message: `Invalid coordinates: lat=${latitude}, lon=${longitude}`,
      code: 'INVALID_COORDINATES',
      provider,
      statusCode: 400,
      retryable: false,
    });
  }

  return {
    latRounded: Number(latitude.toFixed(4)),
    lonRounded: Number(longitude.toFixed(4)),
  };
}

/** Fetch JSON from an upstream Open-Meteo endpoint with standardized timeout and error handling. */
export async function fetchProviderJson<T>(
  url: string,
  options: {
    provider: string;
    label: string;
    timeoutMs: number;
  }
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), options.timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'User-Agent': 'AirAware-AI/2.0',
      },
    });

    if (!response.ok) {
      throw new ProviderError({
        message: `${options.label} responded with HTTP ${response.status}`,
        code: 'PROVIDER_HTTP_ERROR',
        provider: options.provider,
        statusCode: response.status,
        retryable: response.status >= 500,
      });
    }

    return (await response.json()) as T;
  } catch (err: unknown) {
    if (err instanceof ProviderError) throw err;

    if (err instanceof Error && err.name === 'AbortError') {
      throw new ProviderError({
        message: `${options.label} request timed out (${Math.round(options.timeoutMs / 1000)}s)`,
        code: 'PROVIDER_TIMEOUT',
        provider: options.provider,
        statusCode: 504,
        retryable: true,
      });
    }

    throw new ProviderError({
      message: `${options.label} is temporarily unreachable`,
      code: 'PROVIDER_UNREACHABLE',
      provider: options.provider,
      statusCode: 502,
      retryable: true,
      cause: err,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}
