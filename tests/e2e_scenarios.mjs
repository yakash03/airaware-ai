// AirAware AI V2 — End-to-End Scenario Verification Script
// Executes all 6 mandatory user scenarios from Phase 6 against the live production server.

import assert from 'node:assert';

console.log('\n=============================================================');
console.log('  AIRAWARE AI V2 — PHASE 6 MANDATORY E2E SCENARIOS AUDIT');
console.log('=============================================================\n');

let total = 0;
let passed = 0;

async function testScenario(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✓ ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ✗ ${name}`);
    console.error(`    Error: ${err.message}`);
  }
}

async function runScenarios() {
  // SCENARIO 1: New User Flow
  await testScenario('SCENARIO 1: New User — Location Search & Live Data Ingestion', async () => {
    // 1. Search for a location
    const geoRes = await fetch('http://localhost:3000/api/location?q=Bengaluru');
    assert.strictEqual(geoRes.status, 200);
    const geoJson = await geoRes.json();
    assert.ok(geoJson.data && geoJson.data.length > 0, 'Must return geocoded coordinates');
    const loc = geoJson.data[0];

    // 2. Retrieve genuine environmental data
    const airRes = await fetch(`http://localhost:3000/api/air?lat=${loc.latitude}&lon=${loc.longitude}&name=${encodeURIComponent(loc.name)}`);
    assert.strictEqual(airRes.status, 200);
    const airJson = await airRes.json();
    assert.ok(airJson.data.current.length >= 5, 'Must return criteria pollutants');
    assert.strictEqual(airJson.data.computedAqi.standard, 'IN_NAQI');
    assert.ok(airJson.data.computedAqi.value !== null, 'Must have computed India NAQI');
  });

  // SCENARIO 2: Family Profiles & Environmental Invariance
  await testScenario('SCENARIO 2: Family Profiles — Age Adaptation & Identical AQI Base', async () => {
    const airRes = await fetch('http://localhost:3000/api/air?lat=13.08&lon=80.27&name=Chennai');
    const airJson = await airRes.json();
    const snapshot = airJson.data;
    const baseAqi = snapshot.computedAqi.value;

    const categories = ['CHILD', 'TEEN', 'ADULT', 'SENIOR'];
    const explanations = [];

    for (const cat of categories) {
      const expRes = await fetch('http://localhost:3000/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot, profileCategory: cat, language: 'en' }),
      });
      assert.strictEqual(expRes.status, 200);
      const expJson = await expRes.json();
      assert.strictEqual(expJson.data.whyAdvice.aqiValue, baseAqi, 'Underlying AQI MUST remain strictly identical');
      explanations.push(expJson.data.summary);
    }

    // Verify all 4 summaries are distinct and age-adapted
    const uniqueSummaries = new Set(explanations);
    assert.strictEqual(uniqueSummaries.size, 4, 'All 4 age summaries must be distinct');
  });

  // SCENARIO 3: AI Assistant & Multi-Language Chat
  await testScenario('SCENARIO 3: AI Assistant — Grounded Chat & Language Localization', async () => {
    const airRes = await fetch('http://localhost:3000/api/air?lat=13.08&lon=80.27&name=Chennai');
    const airJson = await airRes.json();
    const snapshot = airJson.data;

    // 1. Ask about PM2.5 in English
    const chatEn = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'What does PM2.5 mean for my schedule?',
        snapshot,
        profileCategory: 'ADULT',
        language: 'en',
      }),
    });
    assert.strictEqual(chatEn.status, 200);
    const enJson = await chatEn.json();
    assert.ok(enJson.data.content.toLowerCase().includes('pm2.5') || enJson.data.content.toLowerCase().includes('particles'));

    // 2. Ask in Tamil
    const chatTa = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'இன்றைய காற்று குறித்து கூறுங்கள்',
        snapshot,
        profileCategory: 'CHILD',
        language: 'ta',
      }),
    });
    assert.strictEqual(chatTa.status, 200);
    const taJson = await chatTa.json();
    assert.ok(/[\u0B80-\u0BFF]/.test(taJson.data.content), 'Must contain authentic Tamil characters');
  });

  // SCENARIO 4: Best Window Planner
  await testScenario('SCENARIO 4: Best Window — 24h Comparison & Rank #1 Identification', async () => {
    const airRes = await fetch('http://localhost:3000/api/air?lat=13.08&lon=80.27&name=Chennai');
    const airJson = await airRes.json();
    const hourly = airJson.data.hourlyForecast;

    const winRes = await fetch('http://localhost:3000/api/best-window', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        hourlyForecast: hourly,
        activity: 'CYCLING',
        profileCategory: 'TEEN',
        language: 'en',
        locationName: 'Chennai',
      }),
    });
    assert.strictEqual(winRes.status, 200);
    const winJson = await winRes.json();
    const plan = winJson.data;

    assert.ok(plan.bestWindow, 'Must identify best window');
    assert.strictEqual(plan.bestWindow.rank, 1);
    assert.ok(plan.bestWindow.comparisonReason.includes('IN NAQI'), 'Must compare using CPCB NAQI');
    assert.ok(plan.bestWindow.whyThisTime.limitations.length >= 2, 'Must cite limitations');
  });

  // SCENARIO 5: Indoor Advisor
  await testScenario('SCENARIO 5: Indoor Advisor — Questionnaire, Context & Non-Sensor Enforcement', async () => {
    const airRes = await fetch('http://localhost:3000/api/air?lat=13.08&lon=80.27&name=Chennai');
    const airJson = await airRes.json();
    const aqi = airJson.data.computedAqi.value;

    const indRes = await fetch('http://localhost:3000/api/indoor-advisor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        setup: { windowsStatus: 'OPEN', cookingNearby: 'YES', airPurifierAvailable: 'YES' },
        outdoorAqi: aqi,
        outdoorCategory: airJson.data.computedAqi.category,
        dominantPollutant: airJson.data.computedAqi.dominantPollutant,
        profileCategory: 'ADULT',
        language: 'en',
      }),
    });
    assert.strictEqual(indRes.status, 200);
    const indJson = await indRes.json();
    const plan = indJson.data;

    assert.ok(plan.suggestions.length >= 3);
    assert.ok(plan.disclaimer.includes('does not measure indoor air quality without a compatible sensor'));

    // Verify zero fake numbers
    const serialized = JSON.stringify(plan).toLowerCase();
    assert.ok(!serialized.includes('measured indoor'), 'Forbidden indoor sensor claim');
  });

  // SCENARIO 6: Failure Handling & Graceful Degradation
  await testScenario('SCENARIO 6: Failure Handling — Invalid Coordinates & Empty Forecasts', async () => {
    // 1. Invalid coordinates error
    const errRes = await fetch('http://localhost:3000/api/air?lat=999&lon=999');
    assert.strictEqual(errRes.status, 400, 'Must return 400 Bad Request for out-of-range coordinates');

    // 2. Missing forecast payload
    const emptyWin = await fetch('http://localhost:3000/api/best-window', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hourlyForecast: [] }),
    });
    assert.strictEqual(emptyWin.status, 200);
    const emptyWinJson = await emptyWin.json();
    assert.strictEqual(emptyWinJson.data.dataSufficient, false, 'Must flag dataSufficient as false');

    // 3. Chat with empty message
    const emptyChat = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    assert.strictEqual(emptyChat.status, 400, 'Must return 400 for empty chat payload');
  });

  // SCENARIO 7: Security Headers & Strict Input Validation
  await testScenario('SCENARIO 7: Security Headers & Strict Validation Boundaries', async () => {
    const airRes = await fetch('http://localhost:3000/api/air?lat=13.08abc&lon=80.27');
    assert.strictEqual(airRes.status, 400, 'Must reject malformed decimal coordinates with 400');
    assert.strictEqual(airRes.headers.get('x-frame-options'), 'DENY');
    assert.strictEqual(airRes.headers.get('x-content-type-options'), 'nosniff');

    const badLang = await fetch('http://localhost:3000/api/explain', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ snapshot: { current: [] }, language: 'fr' }),
    });
    assert.strictEqual(badLang.status, 400, 'Must reject unsupported language enum');

    const oversizedChat = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'x'.repeat(1001), snapshot: { current: [] } }),
    });
    assert.strictEqual(oversizedChat.status, 400, 'Must reject oversized chat messages');
  });

  console.log('\n=============================================================');
  console.log(`TOTAL E2E SCENARIOS: ${total} | PASSED: ${passed} | FAILED: ${total - passed}`);
  if (passed === total) {
    console.log('ALL 6 MANDATORY E2E SCENARIOS PASSED WITH 100% SUCCESS.');
  } else {
    process.exit(1);
  }
}

runScenarios().catch((err) => {
  console.error('Fatal scenario failure:', err);
  process.exit(1);
});
