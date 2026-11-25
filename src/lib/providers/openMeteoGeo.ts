// AirAware AI V2 — Open-Meteo Geocoding Service

import { GeoLocation, OpenMeteoGeocodingResponse } from '../types';
import { CONFIG } from '../config';
import { cache } from '../cache/ttlCache';
import { fetchProviderJson } from './httpClient';

/** Search matching city locations via Open-Meteo Geocoding with TTL caching. */
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

  const data = await fetchProviderJson<OpenMeteoGeocodingResponse>(url, {
    provider: 'open-meteo-geocoding',
    label: 'Geocoding API',
    timeoutMs: CONFIG.openMeteoGeo.timeout,
  });

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
}
