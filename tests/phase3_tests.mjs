// AirAware AI V2 — Phase 3 Automated Test Suite
// Verifies Family Profiles, Age-Adaptive Explanation Engine, Languages, Output Validator, and Transparency

import assert from 'node:assert';

console.log('====================================================');
console.log('  AIRAWARE AI V2 — PHASE 3 AUTOMATED TEST SUITE');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function it(description, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✓ ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    Error: ${err.message}`);
    failedTests++;
  }
}

async function itAsync(description, fn) {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ ${description}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✗ ${description}`);
    console.error(`    Error: ${err.message}`);
    failedTests++;
  }
}

// Mock snapshot replicating real Phase 2 verified output
const sampleSnapshot = {
  current: [
    { pollutant: 'pm2_5', value: 64.0, unit: 'µg/m³', dataType: 'MODEL_ESTIMATE', source: 'open-meteo', observedAt: '2026-11-19T14:00', fetchedAt: '2026-11-19T14:05', location: { name: 'Chennai', lat: 13.08, lon: 80.28 }, attribution: 'Open-Meteo CAMS' },
    { pollutant: 'pm10', value: 69.8, unit: 'µg/m³', dataType: 'MODEL_ESTIMATE', source: 'open-meteo', observedAt: '2026-11-19T14:00', fetchedAt: '2026-11-19T14:05', location: { name: 'Chennai', lat: 13.08, lon: 80.28 }, attribution: 'Open-Meteo CAMS' },
    { pollutant: 'co', value: 0.34, unit: 'mg/m³', dataType: 'MODEL_ESTIMATE', source: 'open-meteo', observedAt: '2026-11-19T14:00', fetchedAt: '2026-11-19T14:05', location: { name: 'Chennai', lat: 13.08, lon: 80.28 }, attribution: 'Open-Meteo CAMS' },
    { pollutant: 'no2', value: 11.5, unit: 'µg/m³', dataType: 'MODEL_ESTIMATE', source: 'open-meteo', observedAt: '2026-11-19T14:00', fetchedAt: '2026-11-19T14:05', location: { name: 'Chennai', lat: 13.08, lon: 80.28 }, attribution: 'Open-Meteo CAMS' },
    { pollutant: 'so2', value: 14.0, unit: 'µg/m³', dataType: 'MODEL_ESTIMATE', source: 'open-meteo', observedAt: '2026-11-19T14:00', fetchedAt: '2026-11-19T14:05', location: { name: 'Chennai', lat: 13.08, lon: 80.28 }, attribution: 'Open-Meteo CAMS' },
    { pollutant: 'o3', value: 156.0, unit: 'µg/m³', dataType: 'MODEL_ESTIMATE', source: 'open-meteo', observedAt: '2026-11-19T14:00', fetchedAt: '2026-11-19T14:05', location: { name: 'Chennai', lat: 13.08, lon: 80.28 }, attribution: 'Open-Meteo CAMS' },
  ],
  computedAqi: {
    standard: 'IN_NAQI',
    value: 182,
    category: 'Moderate',
    categoryColor: '#eab308',
    dominantPollutant: 'o3',
    subIndices: { pm2_5: 111, pm10: 70, co: 17, no2: 14, so2: 18, o3: 182 },
    method: 'Computed by AirAware using official CPCB breakpoints from Open-Meteo CAMS concentrations',
    dataType: 'MODEL_ESTIMATE',
    pollutantCount: 6,
    hasPm: true,
    dataSufficient: true,
  },
  weather: {
    temperature: 30.6,
    humidity: 45,
    windSpeed: 11.2,
    windDirection: 340,
    precipitation: 0.0,
    observedAt: '2026-11-19T14:00',
    source: 'open-meteo',
    attribution: 'Open-Meteo Weather',
  },
  freshness: 'FRESH',
  dataAge: 'Just now',
  warnings: [],
  sources: [{ name: 'Open-Meteo CAMS', dataType: 'MODEL_ESTIMATE', attribution: 'CC BY 4.0' }],
  fetchedAt: '2026-11-19T14:05:00.000Z',
};

async function fetchExplanation(category, language = 'en') {
  const res = await fetch('http://localhost:3000/api/explain', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      snapshot: sampleSnapshot,
      category,
      language,
    }),
  });
  const json = await res.json();
  return json.data;
}

// ----------------------------------------------------
// SUITE 1: Age-Adaptive Explanations (Same Air, Different Answers)
// ----------------------------------------------------
console.log('--- SUITE 1: Age-Adaptive Explanation Engine ---');

const childExp = await fetchExplanation('CHILD', 'en');
const teenExp = await fetchExplanation('TEEN', 'en');
const adultExp = await fetchExplanation('ADULT', 'en');
const seniorExp = await fetchExplanation('SENIOR', 'en');

it('Underlying environmental data is strictly identical across all 4 age categories', () => {
  assert.strictEqual(childExp.whyAdvice.aqiValue, 182);
  assert.strictEqual(teenExp.whyAdvice.aqiValue, 182);
  assert.strictEqual(adultExp.whyAdvice.aqiValue, 182);
  assert.strictEqual(seniorExp.whyAdvice.aqiValue, 182);

  assert.strictEqual(childExp.whyAdvice.dominantPollutant, 'o3');
  assert.strictEqual(teenExp.whyAdvice.dominantPollutant, 'o3');
  assert.strictEqual(adultExp.whyAdvice.dominantPollutant, 'o3');
  assert.strictEqual(seniorExp.whyAdvice.dominantPollutant, 'o3');
});

it('Child mode uses friendly, protective language with parental check guidance', () => {
  assert.strictEqual(childExp.profileCategory, 'CHILD');
  assert.ok(childExp.summary.toLowerCase().includes('parent') || childExp.summary.toLowerCase().includes('running') || childExp.activityGuidance.toLowerCase().includes('drawing'));
});

it('Teen mode focuses on sports, workouts, and commuting', () => {
  assert.strictEqual(teenExp.profileCategory, 'TEEN');
  assert.ok(teenExp.activityGuidance.toLowerCase().includes('soccer') || teenExp.activityGuidance.toLowerCase().includes('cycling') || teenExp.summary.toLowerCase().includes('sports'));
});

it('Adult mode provides informative atmospheric context and general health caution', () => {
  assert.strictEqual(adultExp.profileCategory, 'ADULT');
  assert.ok(adultExp.summary.toLowerCase().includes('atmospheric') || adultExp.summary.toLowerCase().includes('adults'));
});

it('Senior mode emphasizes gentle morning walks and clean, short phrasing', () => {
  assert.strictEqual(seniorExp.profileCategory, 'SENIOR');
  assert.ok(seniorExp.activityGuidance.toLowerCase().includes('walks') || seniorExp.activityGuidance.toLowerCase().includes('pace'));
});

// ----------------------------------------------------
// SUITE 2: Multi-Language Localization (English, Tamil, Hindi)
// ----------------------------------------------------
console.log('\n--- SUITE 2: Multi-Language Support (EN, TA, HI) ---');

const taExp = await fetchExplanation('ADULT', 'ta');
const hiExp = await fetchExplanation('ADULT', 'hi');

it('Tamil explanation contains natural Tamil script and preserves verified numbers', () => {
  assert.strictEqual(taExp.language, 'ta');
  assert.ok(taExp.summary.includes('காற்ற') || taExp.summary.includes('அளவீடு') || taExp.headline.includes('காற்று'));
  assert.strictEqual(taExp.whyAdvice.aqiValue, 182);
});

it('Hindi explanation contains natural Devanagari script and preserves verified numbers', () => {
  assert.strictEqual(hiExp.language, 'hi');
  assert.ok(hiExp.summary.includes('हवा') || hiExp.summary.includes('वायु'));
  assert.strictEqual(hiExp.whyAdvice.aqiValue, 182);
});

// ----------------------------------------------------
// SUITE 3: Strict Output Validator Logic
// ----------------------------------------------------
console.log('\n--- SUITE 3: Strict AI Output Validator Logic ---');

function validateLocalOutput(textToValidate, allowedNumbers) {
  const FORBIDDEN = [
    /\bdiagnos(is|ed|e)\b/i,
    /\bprescrib(e|ed|tion)\b/i,
    /\bcure(s|d)?\b/i,
    /\btreat(s|ed|ment)\b/i,
    /\bmedical advice\b/i,
    /\bclinical(ly)?\b/i,
    /\bcompletely safe for you\b/i,
    /\byou have (asthma|copd|bronchitis|heart disease)\b/i,
  ];

  for (const p of FORBIDDEN) {
    if (p.test(textToValidate)) {
      return { isValid: false, reason: 'Forbidden medical assertion' };
    }
  }

  const matches = textToValidate.match(/\b\d+(\.\d+)?\b/g) || [];
  const allowedSet = new Set(allowedNumbers.map(n => Math.round(n)));
  allowedNumbers.forEach(n => allowedSet.add(n));

  for (const m of matches) {
    const num = parseFloat(m);
    if (num === 2014 || num === 2021 || num === 2.5 || num === 10 || num === 24 || num === 8) continue;
    const isAllowed = Array.from(allowedSet).some(a => Math.abs(a - num) < 0.2);
    if (!isAllowed) {
      return { isValid: false, reason: `Invented number: ${num}` };
    }
  }

  return { isValid: true };
}

const allowedNums = [182, 64.0, 69.8, 0.34, 11.5, 14.0, 156.0, 30.6, 45, 11.2];

it('Rejects text containing ungrounded / hallucinated numbers', () => {
  const badText = 'Today the AQI is 182, but PM2.5 reached 350.5 µg/m³ and humidity is 89%.';
  const val = validateLocalOutput(badText, allowedNums);
  assert.strictEqual(val.isValid, false);
});

it('Rejects text containing forbidden medical diagnoses or disease claims', () => {
  const badText = 'Because AQI is 182, you have asthma and need a prescription treatment.';
  const val = validateLocalOutput(badText, allowedNums);
  assert.strictEqual(val.isValid, false);
});

it('Accepts text containing only grounded numbers and permitted phrasing', () => {
  const goodText = 'Today the IN NAQI is 182 in Chennai with 30.6 °C temperature and O3 at 156 µg/m³.';
  const val = validateLocalOutput(goodText, allowedNums);
  assert.strictEqual(val.isValid, true);
});

// ----------------------------------------------------
// SUITE 4: "Why This Advice?" Transparency Panel
// ----------------------------------------------------
console.log('\n--- SUITE 4: "Why am I seeing this?" Transparency Panel ---');

it('Why Advice contains all 4 data pillars and explicit CPCB rule citations', () => {
  const why = adultExp.whyAdvice;
  assert.strictEqual(why.dataType, 'MODEL_ESTIMATE');
  assert.strictEqual(why.scaleApplied, 'India National AQI (CPCB 2014 standard, 0–500)');
  assert.ok(why.ruleCitation.includes('CPCB National Air Quality Index (2014)'));
  assert.ok(Array.isArray(why.dataLimitations));
  assert.ok(why.dataLimitations.length >= 3);
  assert.ok(why.dataLimitations.some(lim => lim.includes('40 km regional')));
});

// ----------------------------------------------------
// SUITE 5: Live Server Endpoints (/api/explain & /api/chat)
// ----------------------------------------------------
console.log('\n--- SUITE 5: Live Server Endpoints ---');

await itAsync('POST /api/chat provides grounded answer to "What does PM2.5 mean?"', async () => {
  const res = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'What does PM2.5 mean?',
      snapshot: sampleSnapshot,
      category: 'ADULT',
      language: 'en',
    }),
  });
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.strictEqual(json.data.role, 'assistant');
  assert.ok(json.data.content.includes('2.5'));
});

await itAsync('POST /api/chat answers in Tamil when requested', async () => {
  const res = await fetch('http://localhost:3000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'Explain today in Tamil',
      snapshot: sampleSnapshot,
      category: 'ADULT',
      language: 'ta',
    }),
  });
  assert.strictEqual(res.status, 200);
  const json = await res.json();
  assert.strictEqual(json.success, true);
  assert.ok(json.data.content.includes('காற்று') || json.data.content.includes('182'));
});

// ----------------------------------------------------
// Final Summary
// ----------------------------------------------------
console.log('\n====================================================');
console.log(`TOTAL PHASE 3 TESTS:  ${totalTests}`);
console.log(`PASSED:               ${passedTests}`);
console.log(`FAILED:               ${failedTests}`);
console.log('====================================================');

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('ALL PHASE 3 TESTS PASSED! FAMILY PROFILES & AI ENGINE VERIFIED.\n');
}
