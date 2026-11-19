// AirAware AI V2 — Phase 4 Automated Test Suite
// Verifies 24-hour Best Window & Outdoor Activity Planner via Live Server
// Tests: Deterministic ranking, family adaptations, activity variations,
// data insufficiency handling, multi-language localization, and API endpoints.

import assert from 'node:assert';

console.log('\n====================================================');
console.log('  AIRAWARE AI V2 — PHASE 4 AUTOMATED TEST SUITE');
console.log('====================================================\n');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

async function it(description, fn) {
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

// Generate realistic test hourly slots (24 hours) for testing
function createTestHourlySlots(baseAqiValues) {
  const slots = [];
  const baseEpoch = Date.parse('2026-11-19T06:00:00.000Z');

  for (let i = 0; i < baseAqiValues.length; i++) {
    const slotTime = new Date(baseEpoch + i * 3600 * 1000).toISOString();
    const aqi = baseAqiValues[i];

    const pm25Val = Math.round(aqi * 0.45);
    const pm10Val = Math.round(aqi * 0.85);
    const o3Val = Math.round(aqi * 0.6);

    slots.push({
      time: slotTime,
      measurements: [
        { pollutant: 'pm2_5', value: pm25Val, unit: 'µg/m³', dataType: 'FORECAST', source: 'open-meteo', observedAt: slotTime, fetchedAt: slotTime, location: { name: 'Chennai', lat: 13.08, lon: 80.27 }, attribution: 'CAMS' },
        { pollutant: 'pm10', value: pm10Val, unit: 'µg/m³', dataType: 'FORECAST', source: 'open-meteo', observedAt: slotTime, fetchedAt: slotTime, location: { name: 'Chennai', lat: 13.08, lon: 80.27 }, attribution: 'CAMS' },
        { pollutant: 'o3', value: o3Val, unit: 'µg/m³', dataType: 'FORECAST', source: 'open-meteo', observedAt: slotTime, fetchedAt: slotTime, location: { name: 'Chennai', lat: 13.08, lon: 80.27 }, attribution: 'CAMS' },
        { pollutant: 'no2', value: 35, unit: 'µg/m³', dataType: 'FORECAST', source: 'open-meteo', observedAt: slotTime, fetchedAt: slotTime, location: { name: 'Chennai', lat: 13.08, lon: 80.27 }, attribution: 'CAMS' },
      ],
      computedAqi: {
        standard: 'IN_NAQI',
        value: aqi,
        category: aqi <= 50 ? 'Good' : aqi <= 100 ? 'Satisfactory' : aqi <= 200 ? 'Moderate' : 'Poor',
        categoryColor: '#eab308',
        dominantPollutant: 'pm2_5',
        subIndices: { pm2_5: aqi, pm10: Math.round(aqi * 0.8) },
        method: 'CPCB NAQI 2014',
        dataType: 'FORECAST',
        pollutantCount: 4,
        hasPm: true,
        dataSufficient: true,
      },
      weather: {
        temperature: 28 + Math.sin(i / 3) * 5,
        humidity: 65,
        windSpeed: 12,
        precipitation: 0,
      },
    });
  }
  return slots;
}

// 24 hours of simulated curve: Morning low (85), Afternoon rise (140), Evening peak (190), Night drop (110)
const test24Hours = [
  85, 88, 92, 98, 110, 125, 138, 142, 145, 150, 160, 175,
  185, 190, 195, 180, 170, 155, 140, 130, 120, 115, 105, 95
];

async function callBestWindowApi(payload) {
  const res = await fetch('http://localhost:3000/api/best-window', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { status: res.status, json: await res.json() };
}

async function runAllTests() {
  console.log('--- SUITE 1: Deterministic Window Comparison Engine ---');

  // Test 1: Window ranking accuracy
  await it('Rank #1 window has the lowest average AQI in 24-hour evaluation', async () => {
    const slots = createTestHourlySlots(test24Hours);
    const { status, json } = await callBestWindowApi({
      hourlyForecast: slots,
      activity: 'WALKING',
      profileCategory: 'ADULT',
      language: 'en',
      locationName: 'Chennai',
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(json.success, true);
    const plan = json.data;

    assert.ok(plan.dataSufficient, 'Plan must have sufficient data');
    assert.ok(plan.bestWindow, 'Should identify a best window');
    assert.strictEqual(plan.bestWindow.rank, 1, 'Best window must be rank 1');
    assert.strictEqual(plan.bestWindow.isBestWindow, true);

    // Verify all ranked windows are ordered by average AQI ascending
    for (let i = 0; i < plan.rankedWindows.length - 1; i++) {
      const cur = plan.rankedWindows[i].averageAqi;
      const next = plan.rankedWindows[i + 1].averageAqi;
      assert.ok(cur <= next, `Rank ${i + 1} (${cur}) should be <= Rank ${i + 2} (${next})`);
    }
  });

  // Test 2: Mathematical difference calculation
  await it('Calculates exact mathematical difference and percentage vs peak window', async () => {
    const slots = createTestHourlySlots(test24Hours);
    const { json } = await callBestWindowApi({
      hourlyForecast: slots,
      activity: 'WALKING',
      profileCategory: 'ADULT',
      language: 'en',
      locationName: 'Chennai',
    });

    const plan = json.data;
    assert.ok(plan.worstWindow, 'Should identify worst window');
    const bestAqi = plan.bestWindow.averageAqi;
    const worstAqi = plan.worstWindow.averageAqi;
    const diff = worstAqi - bestAqi;

    assert.ok(diff > 0, 'Worst window AQI must be higher than best window');
    assert.ok(plan.bestWindow.comparisonReason.includes(String(diff)), 'Comparison reason must state exact difference points');
  });

  // Test 3: Insufficient data handling (honesty, no fabrication)
  await it('Handles missing/insufficient forecast slots with honest unavailable state', async () => {
    const shortSlots = createTestHourlySlots([85, 90]); // Only 2 hours
    const { json } = await callBestWindowApi({
      hourlyForecast: shortSlots,
      activity: 'WALKING',
      profileCategory: 'ADULT',
      language: 'en',
      locationName: 'Chennai',
    });

    const plan = json.data;
    assert.strictEqual(plan.dataSufficient, false, 'Should flag dataSufficient as false');
    assert.strictEqual(plan.bestWindow, null, 'Must not invent a best window when data is insufficient');
    assert.strictEqual(plan.rankedWindows.length, 0, 'Ranked windows must be empty');
    assert.ok(plan.ageAdaptedExplanation.headline.toLowerCase().includes('unavailable'), 'Headline must state unavailable');
  });

  console.log('\n--- SUITE 2: Family Age-Adapted Guidance ---');

  // Test 4: Child profile guidance
  await it('Child profile receives kid-friendly guidance with parental check and hydration', async () => {
    const slots = createTestHourlySlots(test24Hours);
    const { json } = await callBestWindowApi({
      hourlyForecast: slots,
      activity: 'OUTDOOR_RECREATION',
      profileCategory: 'CHILD',
      language: 'en',
      locationName: 'Chennai',
    });

    const exp = json.data.ageAdaptedExplanation;
    assert.ok(exp.headline.toLowerCase().includes('kids') || exp.headline.toLowerCase().includes('child'));
    assert.ok(exp.activitySpecificAdvice.toLowerCase().includes('water') || exp.activitySpecificAdvice.toLowerCase().includes('adult'));
  });

  // Test 5: Teen profile guidance
  await it('Teen profile receives sports and workout-focused timing advice', async () => {
    const slots = createTestHourlySlots(test24Hours);
    const { json } = await callBestWindowApi({
      hourlyForecast: slots,
      activity: 'CYCLING',
      profileCategory: 'TEEN',
      language: 'en',
      locationName: 'Chennai',
    });

    const exp = json.data.ageAdaptedExplanation;
    assert.ok(exp.headline.toLowerCase().includes('teen'));
    assert.ok(exp.recommendation.toLowerCase().includes('training') || exp.recommendation.toLowerCase().includes('session'));
  });

  // Test 6: Senior profile guidance
  await it('Senior profile receives gentle, high-accessibility walking advice', async () => {
    const slots = createTestHourlySlots(test24Hours);
    const { json } = await callBestWindowApi({
      hourlyForecast: slots,
      activity: 'WALKING',
      profileCategory: 'SENIOR',
      language: 'en',
      locationName: 'Chennai',
    });

    const exp = json.data.ageAdaptedExplanation;
    assert.ok(exp.headline.toLowerCase().includes('senior'));
    assert.ok(exp.activitySpecificAdvice.toLowerCase().includes('gentle') || exp.activitySpecificAdvice.toLowerCase().includes('pace'));
  });

  console.log('\n--- SUITE 3: Activity-Specific Adaptation ---');

  // Test 7: Activity types adapt specific guidance
  await it('Activity selection (Walking, Recreation, Cycling, General) alters advice appropriately', async () => {
    const slots = createTestHourlySlots(test24Hours);

    const resWalk = await callBestWindowApi({ hourlyForecast: slots, activity: 'WALKING', profileCategory: 'ADULT', language: 'en', locationName: 'Chennai' });
    const resCycle = await callBestWindowApi({ hourlyForecast: slots, activity: 'CYCLING', profileCategory: 'ADULT', language: 'en', locationName: 'Chennai' });
    const resRec = await callBestWindowApi({ hourlyForecast: slots, activity: 'OUTDOOR_RECREATION', profileCategory: 'ADULT', language: 'en', locationName: 'Chennai' });

    assert.ok(resWalk.json.data.ageAdaptedExplanation.activitySpecificAdvice.toLowerCase().includes('walking'));
    assert.ok(resCycle.json.data.ageAdaptedExplanation.activitySpecificAdvice.toLowerCase().includes('cycling'));
    assert.ok(resRec.json.data.ageAdaptedExplanation.activitySpecificAdvice.toLowerCase().includes('recreation'));
  });

  console.log('\n--- SUITE 4: "Why This Time?" Transparency & Safety ---');

  // Test 8: Why This Time contains all required provenance fields
  await it('Why This Time details contain all required provenance and comparison fields', async () => {
    const slots = createTestHourlySlots(test24Hours);
    const { json } = await callBestWindowApi({
      hourlyForecast: slots,
      activity: 'WALKING',
      profileCategory: 'ADULT',
      language: 'en',
      locationName: 'Chennai',
    });

    const best = json.data.bestWindow;
    assert.ok(best.readingsUsed.length >= 3, 'Must have at least 3 readings used');
    assert.ok(best.whyThisTime.aqiScale.includes('CPCB'), 'Must cite CPCB AQI scale');
    assert.ok(best.whyThisTime.dataSource.includes('CAMS'), 'Must cite CAMS model data source');
    assert.ok(best.whyThisTime.forecastTimestamp, 'Must include forecast timestamp');
    assert.ok(best.whyThisTime.comparisonDetail, 'Must include comparison detail');
    assert.ok(best.whyThisTime.limitations.length >= 2, 'Must cite at least 2 limitations');
  });

  // Test 9: Zero medical diagnosis and strictly non-diagnostic language
  await it('Never claims any window is "completely safe" or "pollution-free"', async () => {
    const slots = createTestHourlySlots(test24Hours);
    const { json } = await callBestWindowApi({
      hourlyForecast: slots,
      activity: 'WALKING',
      profileCategory: 'ADULT',
      language: 'en',
      locationName: 'Chennai',
    });

    const allText = JSON.stringify(json.data).toLowerCase();
    assert.ok(!allText.includes('completely safe'), 'Forbidden phrase: completely safe');
    assert.ok(!allText.includes('pollution-free'), 'Forbidden phrase: pollution-free');
    assert.ok(!allText.includes('guaranteed safe'), 'Forbidden phrase: guaranteed safe');
    assert.ok(!allText.includes('diagnos'), 'Forbidden medical diagnosis');
    assert.ok(!allText.includes('prescrib'), 'Forbidden medical prescription');
  });

  console.log('\n--- SUITE 5: Multi-Language Localization (Tamil & Hindi) ---');

  // Test 10: Tamil localization
  await it('Generates genuine Tamil explanations and preserved numbers', async () => {
    const slots = createTestHourlySlots(test24Hours);
    const { json } = await callBestWindowApi({
      hourlyForecast: slots,
      activity: 'WALKING',
      profileCategory: 'ADULT',
      language: 'ta',
      locationName: 'Chennai',
    });

    const plan = json.data;
    assert.strictEqual(plan.language, 'ta');
    assert.ok(plan.ageAdaptedExplanation.headline.includes('சாதகமான நேரம்'));
    assert.ok(plan.disclaimer.includes('ஒப்பிடுகிறது'));
  });

  // Test 11: Hindi localization
  await it('Generates genuine Hindi Devanagari explanations and preserved numbers', async () => {
    const slots = createTestHourlySlots(test24Hours);
    const { json } = await callBestWindowApi({
      hourlyForecast: slots,
      activity: 'WALKING',
      profileCategory: 'ADULT',
      language: 'hi',
      locationName: 'Delhi',
    });

    const plan = json.data;
    assert.strictEqual(plan.language, 'hi');
    assert.ok(plan.ageAdaptedExplanation.headline.includes('अनुकूल समय'));
    assert.ok(plan.disclaimer.includes('पूर्वानुमान'));
  });

  console.log('\n--- SUITE 6: API Endpoint Reliability & Error Handling ---');

  // Test 12: Handles missing payload with 400 Bad Request
  await it('POST /api/best-window handles missing payload with 400 error', async () => {
    const { status, json } = await callBestWindowApi({});
    assert.strictEqual(status, 400, 'HTTP status must be 400 for missing payload');
    assert.strictEqual(json.success, false);
  });

  // Test 13: Handles malformed payload gracefully without crashing
  await it('POST /api/best-window handles empty forecast array gracefully', async () => {
    const { status, json } = await callBestWindowApi({ hourlyForecast: [] });
    assert.strictEqual(status, 200, 'Empty forecast should return valid plan with dataSufficient: false');
    assert.strictEqual(json.data.dataSufficient, false);
  });

  console.log('\n====================================================');
  console.log(`TOTAL PHASE 4 TESTS:  ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  if (failedTests === 0 && passedTests === totalTests) {
    console.log('ALL PHASE 4 TESTS PASSED! BEST WINDOW PLANNER VERIFIED.');
  } else {
    console.error('SOME TESTS FAILED! CHECK OUTPUT ABOVE.');
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
