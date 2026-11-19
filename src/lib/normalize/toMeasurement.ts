// AirAware AI V2 — Normalizer (Open-Meteo payload -> Measurement[] & AirSnapshot)

import {
  OpenMeteoAirQualityResponse,
  OpenMeteoWeatherResponse,
  Measurement,
  AirSnapshot,
  HourlySlot,
  PollutantId,
  WeatherData,
} from '../types';
import { CONFIG } from '../config';
import { normalizePollutantValue } from './units';
import { computeIndiaNaqi, PollutantConcentration } from '../aqi/indiaNaqi';
import { calculateFreshness } from '../freshness/policy';

const POLLUTANT_KEYS: { id: PollutantId; apiKey: keyof OpenMeteoAirQualityResponse['hourly'] }[] = [
  { id: 'pm2_5', apiKey: 'pm2_5' },
  { id: 'pm10', apiKey: 'pm10' },
  { id: 'co', apiKey: 'carbon_monoxide' },
  { id: 'no2', apiKey: 'nitrogen_dioxide' },
  { id: 'so2', apiKey: 'sulphur_dioxide' },
  { id: 'o3', apiKey: 'ozone' },
];

export function normalizeAirQualitySnapshot(
  aqData: OpenMeteoAirQualityResponse,
  weatherData: OpenMeteoWeatherResponse | null,
  locationName: string
): AirSnapshot {
  const times = aqData.hourly.time;
  const nowIso = new Date().toISOString();

  // Find the index of the current or most recent hour
  // If aqData.current is available, we use that for current values, otherwise find the closest hourly slot
  let currentHourIdx = 0;
  const nowEpoch = Date.now();
  let minDiff = Infinity;

  for (let i = 0; i < times.length; i++) {
    // Times in Open-Meteo with timezone parameter are like "2026-11-19T14:00"
    const slotEpoch = new Date(times[i]).getTime();
    const diff = Math.abs(nowEpoch - slotEpoch);
    if (diff < minDiff) {
      minDiff = diff;
      currentHourIdx = i;
    }
  }

  const currentSlotTime = times[currentHourIdx] ?? nowIso;
  const currentMeasurements: Measurement[] = [];
  const cpcbConcentrations: PollutantConcentration[] = [];

  for (const { id, apiKey } of POLLUTANT_KEYS) {
    const rawHourly = aqData.hourly[apiKey];
    const rawVal = Array.isArray(rawHourly) ? rawHourly[currentHourIdx] : null;
    const numVal = typeof rawVal === 'number' ? rawVal : null;

    const { displayValue, cpcbValue, unit } = normalizePollutantValue(id, numVal);

    if (displayValue !== null) {
      currentMeasurements.push({
        pollutant: id,
        value: displayValue,
        unit,
        dataType: 'MODEL_ESTIMATE',
        source: 'open-meteo',
        observedAt: currentSlotTime,
        fetchedAt: nowIso,
        location: {
          name: locationName,
          lat: aqData.latitude,
          lon: aqData.longitude,
        },
        attribution: CONFIG.attribution.openMeteoAir,
      });

      if (cpcbValue !== null) {
        cpcbConcentrations.push({
          pollutant: id,
          value: cpcbValue,
        });
      }
    }
  }

  // Compute India NAQI deterministically
  const computedAqi = computeIndiaNaqi(cpcbConcentrations, 'MODEL_ESTIMATE', 'Open-Meteo CAMS');

  // Parse current weather
  let currentWeather: WeatherData | null = null;
  if (weatherData && weatherData.hourly.time.length > 0) {
    const wTimes = weatherData.hourly.time;
    let wIdx = 0;
    let wMinDiff = Infinity;
    for (let i = 0; i < wTimes.length; i++) {
      const diff = Math.abs(nowEpoch - new Date(wTimes[i]).getTime());
      if (diff < wMinDiff) {
        wMinDiff = diff;
        wIdx = i;
      }
    }

    currentWeather = {
      temperature: weatherData.hourly.temperature_2m[wIdx] ?? 0,
      humidity: weatherData.hourly.relative_humidity_2m[wIdx] ?? 0,
      windSpeed: weatherData.hourly.wind_speed_10m[wIdx] ?? 0,
      windDirection: weatherData.hourly.wind_direction_10m[wIdx] ?? 0,
      precipitation: weatherData.hourly.precipitation[wIdx] ?? 0,
      observedAt: wTimes[wIdx] ?? currentSlotTime,
      source: 'open-meteo',
      attribution: CONFIG.attribution.openMeteoWeather,
    };
  }

  // Build hourly forecast timeline (up to 48 hours)
  const hourlyForecast: HourlySlot[] = [];
  for (let i = 0; i < times.length; i++) {
    const slotTime = times[i];
    const slotMeasurements: Measurement[] = [];
    const slotCpcb: PollutantConcentration[] = [];

    for (const { id, apiKey } of POLLUTANT_KEYS) {
      const rawHourly = aqData.hourly[apiKey];
      const val = Array.isArray(rawHourly) ? rawHourly[i] : null;
      const numVal = typeof val === 'number' ? val : null;
      const { displayValue, cpcbValue, unit } = normalizePollutantValue(id, numVal);

      if (displayValue !== null) {
        slotMeasurements.push({
          pollutant: id,
          value: displayValue,
          unit,
          dataType: 'FORECAST',
          source: 'open-meteo',
          observedAt: slotTime,
          fetchedAt: nowIso,
          location: {
            name: locationName,
            lat: aqData.latitude,
            lon: aqData.longitude,
          },
          attribution: CONFIG.attribution.openMeteoAir,
        });

        if (cpcbValue !== null) {
          slotCpcb.push({
            pollutant: id,
            value: cpcbValue,
          });
        }
      }
    }

    const slotComputedAqi = slotCpcb.length > 0
      ? computeIndiaNaqi(slotCpcb, 'FORECAST', 'Open-Meteo CAMS')
      : null;

    let slotWeather: HourlySlot['weather'] = undefined;
    if (weatherData && weatherData.hourly.temperature_2m[i] !== undefined) {
      slotWeather = {
        temperature: weatherData.hourly.temperature_2m[i] ?? 0,
        humidity: weatherData.hourly.relative_humidity_2m[i] ?? 0,
        windSpeed: weatherData.hourly.wind_speed_10m[i] ?? 0,
        precipitation: weatherData.hourly.precipitation[i] ?? 0,
      };
    }

    hourlyForecast.push({
      time: slotTime,
      measurements: slotMeasurements,
      computedAqi: slotComputedAqi,
      weather: slotWeather,
    });
  }

  // Check Freshness
  const { status: freshness, humanAge } = calculateFreshness(currentSlotTime, 'MODEL_ESTIMATE');

  // Warnings
  const warnings: string[] = [];
  if (freshness === 'STALE') {
    warnings.push(`Model data is ${humanAge}. Displaying for reference.`);
  } else if (freshness === 'EXPIRED') {
    warnings.push('Environmental data is older than 3 hours.');
  }

  if (!computedAqi.dataSufficient) {
    warnings.push('Insufficient pollutant parameters for official CPCB NAQI calculation.');
  }

  return {
    current: currentMeasurements,
    hourlyForecast,
    weather: currentWeather,
    computedAqi,
    freshness,
    dataAge: humanAge,
    warnings,
    sources: [
      {
        name: 'Open-Meteo CAMS Global Atmospheric Model',
        dataType: 'MODEL_ESTIMATE',
        attribution: CONFIG.attribution.openMeteoAir,
      },
      ...(currentWeather
        ? [
            {
              name: 'Open-Meteo Weather Forecast',
              dataType: 'FORECAST' as const,
              attribution: CONFIG.attribution.openMeteoWeather,
            },
          ]
        : []),
    ],
    fetchedAt: nowIso,
  };
}
