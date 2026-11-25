// AirAware AI V2 — Real Unit Tests Importing Production Source Modules
// Uses Node.js built-in test runner (node:test) + strict assertions (node:assert/strict).

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { calculateSubIndex, computeIndiaNaqi } from '../../src/lib/aqi/indiaNaqi';
import { normalizePollutantValue } from '../../src/lib/normalize/units';
import { normalizeAirQualitySnapshot } from '../../src/lib/normalize/toMeasurement';
import { calculateFreshness } from '../../src/lib/freshness/policy';
import { TtlCache } from '../../src/lib/cache/ttlCache';
import { validateAiOutput, extractNumbers } from '../../src/lib/ai/validator';
import { parseGeminiJsonObject } from '../../src/lib/ai/geminiClient';
import { generateDeterministicExplanation } from '../../src/lib/rules/deterministicExplanations';
import { calculateBestWindows } from '../../src/lib/rules/bestWindowRules';
import { calculateIndoorGuidance, DEFAULT_INDOOR_SETUP } from '../../src/lib/rules/indoorAdvisorRules';
import {
  parseActivity,
  parseChatQuestion,
  parseCoordinates,
  parseIndoorSetup,
  parseLanguage,
  parseProfileCategory,
  RequestValidationError,
  sanitizeLocationName,
  sanitizeTimezone,
} from '../../src/lib/api/validation';
import { AirSnapshot, HourlySlot, OpenMeteoAirQualityResponse, OpenMeteoWeatherResponse } from '../../src/lib/types';

function makeHourlySlots(aqiValues: number[]): HourlySlot[] {
  const baseEpoch = Date.parse('2026-11-19T06:00:00.000Z');
  return aqiValues.map((aqi, i) => {
    const slotTime = new Date(baseEpoch + i * 3600 * 1000).toISOString();
    return {
      time: slotTime,
      measurements: [
        { pollutant: 'pm2_5', value: Math.round(aqi * 0.45), unit: 'µg/m³', dataType: 'FORECAST', source: 'open-meteo', observedAt: slotTime, fetchedAt: slotTime, location: { name: 'Chennai', lat: 13.08, lon: 80.27 }, attribution: 'CAMS' },
        { pollutant: 'pm10', value: Math.round(aqi * 0.85), unit: 'µg/m³', dataType: 'FORECAST', source: 'open-meteo', observedAt: slotTime, fetchedAt: slotTime, location: { name: 'Chennai', lat: 13.08, lon: 80.27 }, attribution: 'CAMS' },
        { pollutant: 'o3', value: Math.round(aqi * 0.6), unit: 'µg/m³', dataType: 'FORECAST', source: 'open-meteo', observedAt: slotTime, fetchedAt: slotTime, location: { name: 'Chennai', lat: 13.08, lon: 80.27 }, attribution: 'CAMS' },
        { pollutant: 'no2', value: 35, unit: 'µg/m³', dataType: 'FORECAST', source: 'open-meteo', observedAt: slotTime, fetchedAt: slotTime, location: { name: 'Chennai', lat: 13.08, lon: 80.27 }, attribution: 'CAMS' },
      ],
      computedAqi: {
        standard: 'IN_NAQI',
        value: aqi,
        category: aqi <= 50 ? 'Good' : aqi <= 100 ? 'Satisfactory' : aqi <= 200 ? 'Moderate' : 'Poor',
        categoryColor: '#eab308',
        categoryTextColor: '#1f2937',
        dominantPollutant: 'pm2_5',
        subIndices: { pm2_5: aqi },
        method: 'CPCB NAQI 2014',
        dataType: 'FORECAST',
        pollutantCount: 4,
        hasPm: true,
        dataSufficient: true,
      },
      weather: {
        temperature: 28,
        humidity: 65,
        windSpeed: 12,
        precipitation: 0,
      },
    };
  });
}

function makeSampleSnapshot(): AirSnapshot {
  return {
    current: [
      { pollutant: 'pm2_5', value: 64.0, unit: 'µg/m³', dataType: 'MODEL_ESTIMATE', source: 'open-meteo', observedAt: '2026-11-19T14:00', fetchedAt: '2026-11-19T14:05', location: { name: 'Chennai', lat: 13.08, lon: 80.28 }, attribution: 'Open-Meteo CAMS' },
      { pollutant: 'pm10', value: 69.8, unit: 'µg/m³', dataType: 'MODEL_ESTIMATE', source: 'open-meteo', observedAt: '2026-11-19T14:00', fetchedAt: '2026-11-19T14:05', location: { name: 'Chennai', lat: 13.08, lon: 80.28 }, attribution: 'Open-Meteo CAMS' },
      { pollutant: 'co', value: 0.34, unit: 'mg/m³', dataType: 'MODEL_ESTIMATE', source: 'open-meteo', observedAt: '2026-11-19T14:00', fetchedAt: '2026-11-19T14:05', location: { name: 'Chennai', lat: 13.08, lon: 80.28 }, attribution: 'Open-Meteo CAMS' },
      { pollutant: 'no2', value: 11.5, unit: 'µg/m³', dataType: 'MODEL_ESTIMATE', source: 'open-meteo', observedAt: '2026-11-19T14:00', fetchedAt: '2026-11-19T14:05', location: { name: 'Chennai', lat: 13.08, lon: 80.28 }, attribution: 'Open-Meteo CAMS' },
      { pollutant: 'so2', value: 14.0, unit: 'µg/m³', dataType: 'MODEL_ESTIMATE', source: 'open-meteo', observedAt: '2026-11-19T14:00', fetchedAt: '2026-11-19T14:05', location: { name: 'Chennai', lat: 13.08, lon: 80.28 }, attribution: 'Open-Meteo CAMS' },
      { pollutant: 'o3', value: 156.0, unit: 'µg/m³', dataType: 'MODEL_ESTIMATE', source: 'open-meteo', observedAt: '2026-11-19T14:00', fetchedAt: '2026-11-19T14:05', location: { name: 'Chennai', lat: 13.08, lon: 80.28 }, attribution: 'Open-Meteo CAMS' },
    ],
    hourlyForecast: [],
    weather: {
      temperature: 30.6,
      humidity: 45,
      windSpeed: 11.2,
      windDirection: 340,
      precipitation: 0,
      observedAt: '2026-11-19T14:00',
      source: 'open-meteo',
      attribution: 'Open-Meteo Weather',
    },
    computedAqi: {
      standard: 'IN_NAQI',
      value: 182,
      category: 'Moderate',
      categoryColor: '#eab308',
      categoryTextColor: '#1f2937',
      dominantPollutant: 'o3',
      subIndices: { pm2_5: 111, pm10: 70, co: 17, no2: 14, so2: 18, o3: 182 },
      method: 'Computed deterministically',
      dataType: 'MODEL_ESTIMATE',
      pollutantCount: 6,
      hasPm: true,
      dataSufficient: true,
    },
    freshness: 'FRESH',
    dataAge: 'Just now',
    warnings: [],
    sources: [{ name: 'Open-Meteo CAMS', dataType: 'MODEL_ESTIMATE', attribution: 'CC BY 4.0' }],
    fetchedAt: '2026-11-19T14:05:00.000Z',
  };
}

describe('CPCB India NAQI Engine (src/lib/aqi/indiaNaqi)', () => {
  it('computes exact CPCB sub-indices for integer breakpoints', () => {
    assert.equal(calculateSubIndex('pm2_5', 15), 25);
    assert.equal(calculateSubIndex('pm2_5', 60), 100);
    assert.equal(calculateSubIndex('pm2_5', 75), 149);
    assert.equal(calculateSubIndex('pm10', 175), 150);
    assert.equal(calculateSubIndex('co', 0.5), 25);
  });

  it('bridges decimal gaps smoothly without returning null', () => {
    const subLow = calculateSubIndex('pm2_5', 30.4);
    const subHigh = calculateSubIndex('pm2_5', 30.6);
    assert.notEqual(subLow, null);
    assert.notEqual(subHigh, null);
    assert.ok((subLow ?? 0) >= 50 && (subHigh ?? 0) <= 51);
  });

  it('caps concentrations exceeding max range at 500 and rejects invalid numbers', () => {
    assert.equal(calculateSubIndex('pm2_5', 500), 500);
    assert.equal(calculateSubIndex('pm2_5', -1), null);
    assert.equal(calculateSubIndex('pm2_5', Number.NaN), null);
  });

  it('enforces data sufficiency (>=3 pollutants including PM2.5 or PM10)', () => {
    const tooFew = computeIndiaNaqi([
      { pollutant: 'pm2_5', value: 45 },
      { pollutant: 'no2', value: 20 },
    ]);
    assert.equal(tooFew.dataSufficient, false);
    assert.equal(tooFew.value, null);

    const noPm = computeIndiaNaqi([
      { pollutant: 'no2', value: 20 },
      { pollutant: 'so2', value: 15 },
      { pollutant: 'co', value: 0.8 },
    ]);
    assert.equal(noPm.dataSufficient, false);

    const valid = computeIndiaNaqi([
      { pollutant: 'pm2_5', value: 75 },
      { pollutant: 'no2', value: 20 },
      { pollutant: 'co', value: 0.5 },
    ]);
    assert.equal(valid.dataSufficient, true);
    assert.equal(valid.value, 149);
    assert.equal(valid.dominantPollutant, 'pm2_5');
    assert.equal(valid.category, 'Moderate');
    assert.equal(valid.categoryTextColor, '#1f2937');
  });
});

describe('Unit Normalization & Timestamp Alignment', () => {
  it('converts CO from ug/m3 to mg/m3 and handles invalid values safely', () => {
    const co = normalizePollutantValue('co', 767);
    assert.equal(co.displayValue, 0.77);
    assert.equal(co.unit, 'mg/m³');

    const invalid = normalizePollutantValue('pm2_5', -2);
    assert.equal(invalid.displayValue, null);
  });

  it('aligns weather forecast slots by ISO timestamp rather than raw index', () => {
    const aq: OpenMeteoAirQualityResponse = {
      latitude: 13.08,
      longitude: 80.27,
      generationtime_ms: 1,
      utc_offset_seconds: 19800,
      timezone: 'Asia/Kolkata',
      timezone_abbreviation: 'IST',
      elevation: 10,
      hourly_units: {},
      hourly: {
        time: ['2026-11-19T12:00', '2026-11-19T13:00'],
        pm10: [50, 60],
        pm2_5: [30, 40],
        carbon_monoxide: [500, 600],
        nitrogen_dioxide: [20, 25],
        sulphur_dioxide: [10, 12],
        ozone: [40, 45],
        us_aqi: [50, 60],
        european_aqi: [30, 40],
      },
    };
    const weather: OpenMeteoWeatherResponse = {
      latitude: 13.08,
      longitude: 80.27,
      generationtime_ms: 1,
      utc_offset_seconds: 19800,
      timezone: 'Asia/Kolkata',
      timezone_abbreviation: 'IST',
      elevation: 10,
      hourly_units: {},
      hourly: {
        // Starts an hour later; index 0 is 13:00, not 12:00
        time: ['2026-11-19T13:00', '2026-11-19T14:00'],
        temperature_2m: [33.5, 31.0],
        relative_humidity_2m: [55, 60],
        wind_speed_10m: [14, 10],
        wind_direction_10m: [120, 130],
        precipitation: [0, 0],
      },
    };

    const snap = normalizeAirQualitySnapshot(aq, weather, 'Chennai');
    assert.equal(snap.hourlyForecast[0].weather, undefined);
    assert.equal(snap.hourlyForecast[1].weather?.temperature, 33.5);
  });
});

describe('Freshness Policy & Bounded TTL Cache', () => {
  it('classifies FRESH, STALE, EXPIRED, and UNAVAILABLE timestamps', () => {
    const freshIso = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    const staleIso = new Date(Date.now() - 120 * 60 * 1000).toISOString();
    const expiredIso = new Date(Date.now() - 240 * 60 * 1000).toISOString();

    assert.equal(calculateFreshness(freshIso, 'MODEL_ESTIMATE').status, 'FRESH');
    assert.equal(calculateFreshness(staleIso, 'MODEL_ESTIMATE').status, 'STALE');
    assert.equal(calculateFreshness(expiredIso, 'MODEL_ESTIMATE').status, 'EXPIRED');
    assert.equal(calculateFreshness('not-a-date').status, 'UNAVAILABLE');
  });

  it('bounds TtlCache size and evicts oldest entry when capacity is reached', () => {
    const cache = new TtlCache(2);
    cache.set('k1', 'v1', 60_000);
    cache.set('k2', 'v2', 60_000);
    cache.set('k3', 'v3', 60_000);

    assert.equal(cache.size(), 2);
    assert.equal(cache.get('k1'), null);
    assert.equal(cache.get('k2'), 'v2');
    assert.equal(cache.get('k3'), 'v3');
  });
});

describe('AI Validator & Gemini Response Parser', () => {
  it('extracts domain numbers while ignoring policy constants like 2014 and PM2.5', () => {
    const nums = extractNumbers('Under CPCB 2014 and WHO 2021, PM2.5 is 64 and AQI is 182.');
    assert.deepEqual(nums, [64, 182]);
  });

  it('rejects ungrounded numbers and medical diagnoses while accepting grounded prose', () => {
    const allowed = [182, 64, 30.6];
    const fabricated = validateAiOutput('Today PM2.5 reached 412 ug/m3.', allowed);
    assert.equal(fabricated.isValid, false);

    const medical = validateAiOutput('You have asthma so we prescribe medicine.', allowed);
    assert.equal(medical.isValid, false);

    const ok = validateAiOutput('IN NAQI is 182 with PM2.5 at 64 ug/m3 and 30.6 C.', allowed);
    assert.equal(ok.isValid, true);
  });

  it('parses clean or markdown-fenced Gemini JSON objects safely', () => {
    const fenced = parseGeminiJsonObject('```json\n{"headline":"Hello"}\n```');
    assert.equal(fenced?.headline, 'Hello');
    assert.equal(parseGeminiJsonObject('[1,2,3]'), null);
  });
});

describe('API Validation & Sanitization', () => {
  it('validates coordinates strictly and rejects malformed values', () => {
    assert.deepEqual(parseCoordinates('13.08', '80.27'), { lat: 13.08, lon: 80.27 });
    assert.throws(() => parseCoordinates('13.08abc', '80.27'), RequestValidationError);
    assert.throws(() => parseCoordinates('95', '80.27'), RequestValidationError);
  });

  it('sanitizes location names and timezones cleanly', () => {
    assert.equal(sanitizeLocationName('Chennai\u0000\n'), 'Chennai');
    assert.equal(sanitizeTimezone('Asia/Kolkata'), 'Asia/Kolkata');
    assert.equal(sanitizeTimezone('bad tz; rm -rf'), 'auto');
  });

  it('enforces enum allowlists for category, language, activity, chat, and indoor setup', () => {
    assert.equal(parseProfileCategory('CHILD'), 'CHILD');
    assert.throws(() => parseProfileCategory('UNKNOWN'), RequestValidationError);

    assert.equal(parseLanguage('ta'), 'ta');
    assert.throws(() => parseLanguage('fr'), RequestValidationError);

    assert.equal(parseActivity('CYCLING'), 'CYCLING');
    assert.throws(() => parseActivity('SWIMMING'), RequestValidationError);

    assert.throws(() => parseChatQuestion('   '), RequestValidationError);
    assert.throws(() => parseChatQuestion('a'.repeat(1001)), RequestValidationError);

    const setup = parseIndoorSetup({ windowsStatus: 'OPEN' });
    assert.equal(setup.windowsStatus, 'OPEN');
    assert.equal(setup.cookingNearby, DEFAULT_INDOOR_SETUP.cookingNearby);
    assert.throws(() => parseIndoorSetup({ windowsStatus: 'INVALID' }), RequestValidationError);
  });
});

describe('Deterministic Engines (Age Explanations, Best Window, Indoor Advisor)', () => {
  it('produces identical environmental metrics with distinct age-adapted guidance across profiles', () => {
    const snapshot = makeSampleSnapshot();
    const child = generateDeterministicExplanation(snapshot, 'CHILD', 'en');
    const teen = generateDeterministicExplanation(snapshot, 'TEEN', 'en');
    const adult = generateDeterministicExplanation(snapshot, 'ADULT', 'en');
    const senior = generateDeterministicExplanation(snapshot, 'SENIOR', 'en');

    assert.equal(child.whyAdvice.aqiValue, 182);
    assert.equal(senior.whyAdvice.aqiValue, 182);
    const summaries = new Set([child.summary, teen.summary, adult.summary, senior.summary]);
    assert.equal(summaries.size, 4);
  });

  it('ranks best 2-hour window lowest and flags insufficient forecasts honestly', () => {
    const curve = [
      85, 88, 92, 98, 110, 125, 138, 142, 145, 150, 160, 175,
      185, 190, 195, 180, 170, 155, 140, 130, 120, 115, 105, 95,
    ];
    const plan = calculateBestWindows(makeHourlySlots(curve), 'WALKING', 'ADULT', 'en', 'Chennai');
    assert.equal(plan.dataSufficient, true);
    assert.equal(plan.bestWindow?.rank, 1);
    assert.ok((plan.bestWindow?.averageAqi ?? 999) <= (plan.worstWindow?.averageAqi ?? 0));

    const shortPlan = calculateBestWindows(makeHourlySlots([85, 90]), 'WALKING', 'ADULT', 'en', 'Chennai');
    assert.equal(shortPlan.dataSufficient, false);
    assert.equal(shortPlan.bestWindow, null);
  });

  it('enforces mandatory non-sensor notice and multilingual indoor suggestions', () => {
    const enPlan = calculateIndoorGuidance(
      { ...DEFAULT_INDOOR_SETUP, windowsStatus: 'OPEN', cookingNearby: 'YES' },
      185,
      'Moderate',
      'pm2_5',
      'SENIOR',
      'en',
      'Chennai'
    );
    assert.ok(enPlan.disclaimer.includes('does not measure indoor air quality without a compatible sensor'));
    assert.ok(enPlan.suggestions.some((s) => s.category === 'VENTILATION'));
    assert.ok(enPlan.suggestions.some((s) => s.category === 'COOKING_EXHAUST'));

    const taPlan = calculateIndoorGuidance(DEFAULT_INDOOR_SETUP, 150, 'Moderate', 'pm2_5', 'ADULT', 'ta', 'Chennai');
    assert.ok(taPlan.disclaimer.includes('சென்சார் இல்லாமல்'));
  });
});
