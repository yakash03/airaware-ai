// AirAware AI V2 — Phase 5 Automated Test Suite
// Verifies Indoor Air Advisor, questionnaire handling, deterministic rules,
// age adaptation, transparency modals, non-sensor disclaimers, and API endpoints.

import assert from 'node:assert';

console.log('\n====================================================');
console.log('  AIRAWARE AI V2 — PHASE 5 AUTOMATED TEST SUITE');
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

async function callIndoorAdvisorApi(payload) {
  const res = await fetch('http://localhost:3000/api/indoor-advisor', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return { status: res.status, json: await res.json() };
}

async function runAllTests() {
  console.log('--- SUITE 1: Deterministic Indoor Rule Engine ---');

  // Test 1: High outdoor pollution + open windows
  await it('High outdoor AQI + open windows generates window closing suggestion', async () => {
    const { status, json } = await callIndoorAdvisorApi({
      setup: {
        naturallyVentilated: 'YES',
        windowsStatus: 'OPEN',
        cookingNearby: 'NO',
        visibleDustOrSmoke: 'NO',
        airPurifierAvailable: 'NO',
        roadFacingArea: 'NO',
      },
      outdoorAqi: 185,
      outdoorCategory: 'Moderate',
      dominantPollutant: 'pm2_5',
      profileCategory: 'ADULT',
      language: 'en',
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(json.success, true);
    const plan = json.data;

    const winSug = plan.suggestions.find((s) => s.category === 'VENTILATION');
    assert.ok(winSug, 'Must include ventilation suggestion');
    assert.ok(winSug.title.toLowerCase().includes('close') || winSug.advice.toLowerCase().includes('closed'));
    assert.strictEqual(winSug.priority, 'HIGH');
  });

  // Test 2: Low outdoor pollution + closed windows
  await it('Low outdoor AQI + closed windows generates fresh air flush suggestion', async () => {
    const { json } = await callIndoorAdvisorApi({
      setup: {
        naturallyVentilated: 'YES',
        windowsStatus: 'CLOSED',
        cookingNearby: 'NO',
        visibleDustOrSmoke: 'NO',
        airPurifierAvailable: 'NO',
        roadFacingArea: 'NO',
      },
      outdoorAqi: 45,
      outdoorCategory: 'Good',
      dominantPollutant: 'pm2_5',
      profileCategory: 'ADULT',
      language: 'en',
    });

    const plan = json.data;
    const winSug = plan.suggestions.find((s) => s.category === 'VENTILATION');
    assert.ok(winSug, 'Must include ventilation suggestion');
    assert.ok(winSug.advice.toLowerCase().includes('open') || winSug.title.toLowerCase().includes('fresh air'));
  });

  // Test 3: Cooking activity nearby
  await it('Cooking activity nearby triggers kitchen exhaust and smoke isolation advice', async () => {
    const { json } = await callIndoorAdvisorApi({
      setup: {
        naturallyVentilated: null,
        windowsStatus: null,
        cookingNearby: 'YES',
        visibleDustOrSmoke: null,
        airPurifierAvailable: null,
        roadFacingArea: null,
      },
      outdoorAqi: 110,
      outdoorCategory: 'Moderate',
      dominantPollutant: 'o3',
      profileCategory: 'ADULT',
      language: 'en',
    });

    const plan = json.data;
    const cookSug = plan.suggestions.find((s) => s.category === 'COOKING_EXHAUST');
    assert.ok(cookSug, 'Must include cooking exhaust suggestion');
    assert.ok(cookSug.advice.toLowerCase().includes('exhaust') || cookSug.advice.toLowerCase().includes('hood'));
    assert.strictEqual(cookSug.priority, 'HIGH');
  });

  // Test 4: Road-facing traffic area
  await it('Road-facing room triggers rush-hour traffic buffer advice', async () => {
    const { json } = await callIndoorAdvisorApi({
      setup: {
        naturallyVentilated: null,
        windowsStatus: null,
        cookingNearby: null,
        visibleDustOrSmoke: null,
        airPurifierAvailable: null,
        roadFacingArea: 'YES',
      },
      outdoorAqi: 150,
      outdoorCategory: 'Moderate',
      dominantPollutant: 'no2',
      profileCategory: 'ADULT',
      language: 'en',
    });

    const plan = json.data;
    const roadSug = plan.suggestions.find((s) => s.category === 'ROAD_EXPOSURE');
    assert.ok(roadSug, 'Must include road exposure suggestion');
    assert.ok(roadSug.advice.toLowerCase().includes('rush hour') || roadSug.advice.toLowerCase().includes('vehicular'));
    assert.strictEqual(roadSug.priority, 'HIGH');
  });

  // Test 5: Visible dust or smoke
  await it('Visible dust or smoke triggers damp wiping and wet mopping advice over dry sweeping', async () => {
    const { json } = await callIndoorAdvisorApi({
      setup: {
        naturallyVentilated: null,
        windowsStatus: null,
        cookingNearby: null,
        visibleDustOrSmoke: 'YES',
        airPurifierAvailable: null,
        roadFacingArea: null,
      },
      outdoorAqi: 120,
      outdoorCategory: 'Moderate',
      dominantPollutant: 'pm10',
      profileCategory: 'ADULT',
      language: 'en',
    });

    const plan = json.data;
    const dustSug = plan.suggestions.find((s) => s.category === 'DUST_MANAGEMENT');
    assert.ok(dustSug, 'Must include dust management suggestion');
    assert.ok(dustSug.advice.toLowerCase().includes('damp') || dustSug.advice.toLowerCase().includes('wet mopping'));
  });

  // Test 6: Air purifier available
  await it('Air purifier triggers room-specific positioning and closed window advice', async () => {
    const { json } = await callIndoorAdvisorApi({
      setup: {
        naturallyVentilated: null,
        windowsStatus: null,
        cookingNearby: null,
        visibleDustOrSmoke: null,
        airPurifierAvailable: 'YES',
        roadFacingArea: null,
      },
      outdoorAqi: 180,
      outdoorCategory: 'Moderate',
      dominantPollutant: 'pm2_5',
      profileCategory: 'ADULT',
      language: 'en',
    });

    const plan = json.data;
    const purSug = plan.suggestions.find((s) => s.category === 'PURIFIER_USAGE');
    assert.ok(purSug, 'Must include purifier suggestion');
    assert.ok(purSug.advice.toLowerCase().includes('closed') && purSug.advice.toLowerCase().includes('purifier'));
  });

  console.log('\n--- SUITE 2: Skipped Questions & Missing Data ---');

  // Test 7: Handles completely skipped questions
  await it('Handles completely skipped questions gracefully with baseline general suggestions', async () => {
    const { status, json } = await callIndoorAdvisorApi({
      setup: {
        naturallyVentilated: null,
        windowsStatus: null,
        cookingNearby: null,
        visibleDustOrSmoke: null,
        airPurifierAvailable: null,
        roadFacingArea: null,
      },
      outdoorAqi: 150,
      outdoorCategory: 'Moderate',
      dominantPollutant: 'pm2_5',
      profileCategory: 'ADULT',
      language: 'en',
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(json.data.hasSetup, false);
    assert.ok(json.data.suggestions.length >= 1, 'Should at least provide general practice suggestion');
  });

  // Test 8: Missing outdoor AQI handling
  await it('Handles missing outdoor AQI honestly without crashing or inventing numbers', async () => {
    const { status, json } = await callIndoorAdvisorApi({
      setup: { cookingNearby: 'YES' },
      outdoorAqi: null,
      outdoorCategory: null,
      dominantPollutant: null,
      profileCategory: 'ADULT',
      language: 'en',
    });

    assert.strictEqual(status, 200);
    assert.strictEqual(json.data.outdoorAqi, null);
    assert.ok(json.data.suggestions.length >= 1);
  });

  console.log('\n--- SUITE 3: Family Age Adaptation ---');

  // Test 9: Child profile guidance
  await it('Child profile receives kid-focused protection and damp floor wiping advice', async () => {
    const { json } = await callIndoorAdvisorApi({
      setup: { visibleDustOrSmoke: 'YES', cookingNearby: 'YES' },
      outdoorAqi: 160,
      outdoorCategory: 'Moderate',
      dominantPollutant: 'pm2_5',
      profileCategory: 'CHILD',
      language: 'en',
    });

    const cook = json.data.suggestions.find((s) => s.category === 'COOKING_EXHAUST');
    assert.ok(cook.ageGuidance.toLowerCase().includes('kids') || cook.ageGuidance.toLowerCase().includes('children'));
  });

  // Test 10: Senior profile guidance
  await it('Senior profile receives gentle draft avoidance and bedroom protection advice', async () => {
    const { json } = await callIndoorAdvisorApi({
      setup: { windowsStatus: 'OPEN', roadFacingArea: 'YES' },
      outdoorAqi: 175,
      outdoorCategory: 'Moderate',
      dominantPollutant: 'pm2_5',
      profileCategory: 'SENIOR',
      language: 'en',
    });

    const win = json.data.suggestions.find((s) => s.category === 'VENTILATION');
    assert.ok(win.ageGuidance.toLowerCase().includes('draft') || win.ageGuidance.toLowerCase().includes('bedroom'));
  });

  console.log('\n--- SUITE 4: Zero Fake Sensors & Non-Diagnostic Rule ---');

  // Test 11: Mandatory Non-Sensor Transparency Notice
  await it('Mandatory non-sensor notice is explicitly present in plan disclaimer', async () => {
    const { json } = await callIndoorAdvisorApi({
      setup: { windowsStatus: 'OPEN' },
      outdoorAqi: 150,
      outdoorCategory: 'Moderate',
      dominantPollutant: 'pm2_5',
      profileCategory: 'ADULT',
      language: 'en',
    });

    const disclaimer = json.data.disclaimer;
    assert.ok(disclaimer.includes('does not measure indoor air quality without a compatible sensor'));
  });

  // Test 12: Zero fabricated indoor measurements or sensor claims
  await it('Never invents indoor AQI, indoor PM2.5, or fake sensor readings', async () => {
    const { json } = await callIndoorAdvisorApi({
      setup: {
        naturallyVentilated: 'YES',
        windowsStatus: 'OPEN',
        cookingNearby: 'YES',
        visibleDustOrSmoke: 'YES',
        airPurifierAvailable: 'YES',
        roadFacingArea: 'YES',
      },
      outdoorAqi: 180,
      outdoorCategory: 'Moderate',
      dominantPollutant: 'pm2_5',
      profileCategory: 'ADULT',
      language: 'en',
    });

    const allText = JSON.stringify(json.data).toLowerCase();
    assert.ok(!allText.includes('indoor aqi is'), 'Must not claim indoor AQI reading');
    assert.ok(!allText.includes('indoor pm2.5 is'), 'Must not claim indoor PM2.5 reading');
    assert.ok(!allText.includes('measured indoor'), 'Must not claim measured indoor data');
    assert.ok(!allText.includes('completely safe'), 'Must not claim completely safe');
    assert.ok(!allText.includes('diagnos'), 'No medical diagnoses');
  });

  console.log('\n--- SUITE 5: Multilingual Localization (Tamil & Hindi) ---');

  // Test 13: Tamil localization
  await it('Generates authentic Tamil indoor suggestions and non-sensor disclaimer', async () => {
    const { json } = await callIndoorAdvisorApi({
      setup: { cookingNearby: 'YES', windowsStatus: 'OPEN' },
      outdoorAqi: 165,
      outdoorCategory: 'Moderate',
      dominantPollutant: 'pm2_5',
      profileCategory: 'ADULT',
      language: 'ta',
    });

    const plan = json.data;
    assert.strictEqual(plan.language, 'ta');
    assert.ok(plan.disclaimer.includes('சென்சார் இல்லாமல்'));
    const cook = plan.suggestions.find((s) => s.category === 'COOKING_EXHAUST');
    assert.ok(cook.title.includes('சமையல்'));
  });

  // Test 14: Hindi localization
  await it('Generates authentic Hindi Devanagari indoor suggestions and non-sensor disclaimer', async () => {
    const { json } = await callIndoorAdvisorApi({
      setup: { cookingNearby: 'YES', windowsStatus: 'OPEN' },
      outdoorAqi: 165,
      outdoorCategory: 'Moderate',
      dominantPollutant: 'pm2_5',
      profileCategory: 'ADULT',
      language: 'hi',
    });

    const plan = json.data;
    assert.strictEqual(plan.language, 'hi');
    assert.ok(plan.disclaimer.includes('इनडोर सेंसर के बिना'));
    const cook = plan.suggestions.find((s) => s.category === 'COOKING_EXHAUST');
    assert.ok(cook.title.includes('रसोई'));
  });

  console.log('\n====================================================');
  console.log(`TOTAL PHASE 5 TESTS:  ${totalTests} | PASSED: ${passedTests} | FAILED: ${failedTests}`);
  if (failedTests === 0 && passedTests === totalTests) {
    console.log('ALL PHASE 5 TESTS PASSED! INDOOR ADVISOR VERIFIED.');
  } else {
    console.error('SOME TESTS FAILED! CHECK OUTPUT ABOVE.');
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
