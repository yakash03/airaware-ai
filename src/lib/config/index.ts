// AirAware AI V2 — Configuration
// All endpoints, timeouts, TTLs, and thresholds in one place

export const CONFIG = {
  // Open-Meteo Air Quality API
  openMeteoAir: {
    baseUrl: 'https://air-quality-api.open-meteo.com/v1/air-quality',
    // Parameters verified in Phase 1 test (2026-11-19)
    hourlyParams: [
      'pm10', 'pm2_5', 'carbon_monoxide', 'nitrogen_dioxide',
      'sulphur_dioxide', 'ozone', 'us_aqi', 'european_aqi',
    ].join(','),
    currentParams: [
      'pm10', 'pm2_5', 'carbon_monoxide', 'nitrogen_dioxide',
      'sulphur_dioxide', 'ozone', 'us_aqi', 'european_aqi',
    ].join(','),
    pastDays: 0,
    forecastDays: 2,
    timeout: 8000,
  },

  // Open-Meteo Weather Forecast API
  openMeteoWeather: {
    baseUrl: 'https://api.open-meteo.com/v1/forecast',
    hourlyParams: [
      'temperature_2m', 'relative_humidity_2m', 'wind_speed_10m',
      'wind_direction_10m', 'precipitation',
    ].join(','),
    forecastDays: 2,
    timeout: 8000,
  },

  // Open-Meteo Geocoding API
  openMeteoGeo: {
    baseUrl: 'https://geocoding-api.open-meteo.com/v1/search',
    maxResults: 8,
    language: 'en',
    timeout: 5000,
  },

  // Cache TTLs (milliseconds)
  cache: {
    airQualityTTL: 10 * 60 * 1000,     // 10 minutes
    weatherTTL: 15 * 60 * 1000,         // 15 minutes
    geocodingTTL: 30 * 60 * 1000,       // 30 minutes
  },

  // Freshness thresholds (milliseconds)
  freshness: {
    modelFresh: 60 * 60 * 1000,         // 1 hour
    modelStale: 3 * 60 * 60 * 1000,     // 3 hours
    // Beyond modelStale = EXPIRED
  },

  // Data attribution (required by CC BY 4.0)
  attribution: {
    openMeteoAir: 'Air quality data by Open-Meteo.com (CAMS data, CC BY 4.0)',
    openMeteoWeather: 'Weather data by Open-Meteo.com (CC BY 4.0)',
    openMeteoGeo: 'Geocoding by Open-Meteo.com (GeoNames)',
  },

  // Coordinate validation
  coordinates: {
    minLat: -90,
    maxLat: 90,
    minLon: -180,
    maxLon: 180,
  },
} as const;
