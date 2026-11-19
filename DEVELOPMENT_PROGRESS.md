# AirAware AI V2 — Development Progress

> **Product:** AirAware AI V2 — "Air for Every Age"  
> **Tagline:** "Same air. Different people. Personal answers."  
> **Current Status:** Phase 1 (Architecture), Phase 2 (Real-Time Ingestion), Phase 3 (Family Air Profiles & Age-Adaptive AI Assistant), Phase 4 (Best Window & Outdoor Activity Planner), & Phase 5 (Indoor Air Advisor) COMPLETED & VERIFIED.

---

## 1. Phase 3 Objectives & Achievements

Phase 3 implements the core thesis of AirAware AI: **"One verified air reading interpreted through multiple age-adapted lenses."** In strict accordance with the project's non-negotiable rules, the underlying environmental data ($\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{CO}$, $\text{NO}_2$, $\text{SO}_2$, $\text{O}_3$, temperature, humidity, wind, and calculated CPCB NAQI) remains **strictly identical across every profile**. Only the language, tone, cognitive accessibility, and lifestyle guidance adapt.

### Key Capabilities Completed:
1. **Family Air Profiles Manager (`ProfileManager.tsx`)**:
   - Four distinct age categories:
     - **Child:** Under 12 years (friendly, protective, parent-consultation advice).
     - **Teen:** 13–17 years (conversational, sports, cycling, commuting).
     - **Adult:** 18–59 years (informative, key pollutant impacts, practical exposure moderation).
     - **Senior:** 60+ years (high contrast, readable text, gentle morning walk timing).
   - Full CRUD: Add member, edit name/category, remove member, select active member.
   - Pre-seeded with a default family (*Aarav, Priya, Rajesh, Grandma Lakshmi*) for immediate out-of-the-box utility.
   - **Privacy-first:** Profiles are stored exclusively in the browser's `localStorage`. No accounts required, no medical diagnoses or personal health history collected.

2. **Dedicated Family Dashboard Section (`FamilyDashboard.tsx`)**:
   - **"What does today's air mean for my family?"**
   - Renders 4 individual age-adapted cards side-by-side with caution level badges (Low, Moderate, High, Very High).
   - Prominently displays the consistent environmental reading badge (*"Same 182 AQI Base"*).
   - Each card features a dedicated **"Why am I seeing this?"** transparency trigger.

3. **"Why This Advice?" Transparency Panel (`WhyAdviceModal.tsx`)**:
   - Provides unvarnished provenance for every recommendation across **4 mandatory categories**:
     1. **Measured:** Explicitly states if ground monitoring sensors are nearby (marked as *Model Estimate Active*).
     2. **Model Estimate:** Details Copernicus CAMS atmospheric chemistry simulation (~40 km grid) via Open-Meteo under CC BY 4.0.
     3. **Forecast:** References 24-hour hourly forward projections.
     4. **General Guidance:** Cites deterministic CPCB 2014 health breakpoints and WHO 2021 air quality guidelines.
   - Discloses clear **data limitations** (regional model, weather variations, indoor differences).

4. **Multi-Language Localization Engine (`translations.ts`)**:
   - Native support for **English (`en`)**, **Tamil (`ta` - தமிழ்)**, and **Hindi (`hi` - हिन्दी)**.
   - Applies across UI headers, buttons, quick selects, age-adapted explanations, and the AI chat assistant.
   - Never mistranslates numeric concentrations, units, or chemical formulas ($PM_{2.5}$, $O_3$, $\mu g/m^3$).

5. **Secure Gemini AI Integration & Grounded Fallback Engine (`gemini.ts` & `validator.ts`)**:
   - Server-side route handler `/api/explain` and `/api/chat`.
   - **Output Validator (`validator.ts`)**: Checks that every number in the LLM response exists in the verified input data; immediately flags and rejects ungrounded or hallucinated numbers.
   - **Strict Medical Boundaries**: Rejects any clinical diagnoses, disease claims, or unqualified "safe/unsafe" assertions.
   - **Deterministic Fallback Engine (`deterministicExplanations.ts`)**: Operates seamlessly when Gemini API key is not configured, timed out, or rate-limited. High-quality, grounded responses in all 3 languages.

6. **Profile-Based Chat Assistant ("Ask AirAware AI" - `AskAirAwareChat.tsx`)**:
   - Interactive Q&A interface tailored to the active profile's age and selected language.
   - Suggested quick prompts (*"What does PM2.5 mean?", "Why does Ozone peak in the afternoon?", "Explain today in Tamil"*).
   - Grounded strictly in the live environmental snapshot.

7. **Accessibility & Display Toolbar (`AccessibilityToolbar.tsx`)**:
   - Language switch buttons (English, தமிழ், हिन्दी).
   - Text size scaling: Normal (`A`), Large (`A+`), Extra Large (`A++`).
   - High Contrast mode toggle (instant high contrast dark/light styling).
   - Senior mode automatically activates high contrast and larger text.

---

## 2. Files Created and Modified

```
airaware-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── air/route.ts                # Real-time air quality snapshot API
│   │   │   ├── chat/route.ts               # Profile-grounded chat API (NEW)
│   │   │   ├── explain/route.ts            # Age-adaptive explanation API (NEW)
│   │   │   ├── location/route.ts           # Geocoding search API
│   │   │   └── weather/route.ts            # Meteorological forecast API
│   │   ├── layout.tsx                      # Root layout with AirAware metadata
│   │   └── page.tsx                        # Main dashboard integrating Phase 2 & 3
│   ├── components/
│   │   ├── chat/
│   │   │   └── AskAirAwareChat.tsx         # "Ask AirAware AI" interface (NEW)
│   │   ├── dashboard/
│   │   │   ├── AccessibilityToolbar.tsx    # Language & text size controls (NEW)
│   │   │   ├── AqiOverviewCard.tsx         # CPCB NAQI card with dominant pollutant
│   │   │   ├── FamilyDashboard.tsx         # "What does today's air mean for my family?" (NEW)
│   │   │   ├── HourlyForecastTimeline.tsx  # 24h scrollable forecast timeline
│   │   │   ├── LocationSearch.tsx          # Geocoding autocomplete & quick picks
│   │   │   ├── PollutantGrid.tsx           # 6 criteria pollutant cards
│   │   │   ├── ScaleExplanationModal.tsx   # CPCB vs US AQI comparison guide
│   │   │   ├── WeatherOverview.tsx         # Temperature, humidity, wind conditions
│   │   │   └── WhyAdviceModal.tsx          # 4-pillar transparency panel (NEW)
│   │   ├── profiles/
│   │   │   └── ProfileManager.tsx          # Family member CRUD & selection (NEW)
│   │   └── ui/
│   │       └── Icons.tsx                   # Native zero-dependency SVG icons
│   └── lib/
│       ├── ai/
│       │   ├── gemini.ts                   # Gemini client & grounded fallback (NEW)
│       │   └── validator.ts                # Strict number & medical assertion validator (NEW)
│       ├── aqi/
│       │   ├── breakpoints.ts              # Official CPCB NAQI breakpoint tables
│       │   └── indiaNaqi.ts                # Deterministic CPCB AQI calculator
│       ├── cache/
│       │   └── ttlCache.ts                 # Server-side in-memory TTL cache
│       ├── config/
│       │   └── index.ts                    # Endpoints, timeouts, TTLs, and thresholds
│       ├── errors/
│       │   └── providerError.ts            # Typed error handling
│       ├── freshness/
│       │   └── policy.ts                   # Freshness threshold checks
│       ├── i18n/
│       │   └── translations.ts             # Centralized EN, TA, HI dictionary (NEW)
│       ├── normalize/
│       │   ├── toMeasurement.ts            # AirSnapshot normalizer
│       │   └── units.ts                    # CO µg/m³ -> mg/m³ conversion
│       ├── providers/
│       │   ├── openMeteoAir.ts             # Open-Meteo Air Quality client
│       │   ├── openMeteoGeo.ts             # Open-Meteo Geocoding client
│       │   └── openMeteoWeather.ts         # Open-Meteo Weather client
│       ├── rules/
│       │   └── deterministicExplanations.ts# Pure deterministic age rules in 3 languages (NEW)
│       └── types/
│           └── index.ts                    # Extended TypeScript models for Phase 3
├── tests/
│   ├── phase3_tests.mjs                    # 13 Phase 3 automated tests (NEW)
│   └── run_tests.mjs                       # 19 Phase 2 unit & integration tests
└── DEVELOPMENT_PROGRESS.md                 # Updated documentation
```

---

## 3. Explanation Architecture & Age Adaptation

The system receives a validated `AirSnapshot` and outputs age-adapted explanations based on verified CPCB categories and WHO guidelines:

| Profile | Target Age | Communication Tone | Core Guidance Focus |
|---|---|---|---|
| **Child** | Under 12 | Simple vocabulary, friendly, protective | Checks with parents, suggests indoor fun during high pollution |
| **Teen** | 13–17 | Conversational, relatable, practical | Workout planning, commute timing, hydration during sports |
| **Adult** | 18–59 | Informative, analytical, objective | Key pollutant penetration ($PM_{2.5}$ / $O_3$), routine exercise tolerance |
| **Senior** | 60+ | Short sentences, high contrast, gentle | Safe walking hours, avoiding dusty roads, indoor comfort |

---

## 4. Testing & Validation Results

### Phase 3 Test Suite (`tests/phase3_tests.mjs`)
```
====================================================
  AIRAWARE AI V2 — PHASE 3 AUTOMATED TEST SUITE
====================================================

--- SUITE 1: Age-Adaptive Explanation Engine ---
  ✓ Underlying environmental data is strictly identical across all 4 age categories
  ✓ Child mode uses friendly, protective language with parental check guidance
  ✓ Teen mode focuses on sports, workouts, and commuting
  ✓ Adult mode provides informative atmospheric context and general health caution
  ✓ Senior mode emphasizes gentle morning walks and clean, short phrasing

--- SUITE 2: Multi-Language Support (EN, TA, HI) ---
  ✓ Tamil explanation contains natural Tamil script and preserves verified numbers
  ✓ Hindi explanation contains natural Devanagari script and preserves verified numbers

--- SUITE 3: Strict AI Output Validator Logic ---
  ✓ Rejects text containing ungrounded / hallucinated numbers
  ✓ Rejects text containing forbidden medical diagnoses or disease claims
  ✓ Accepts text containing only grounded numbers and permitted phrasing

--- SUITE 4: "Why am I seeing this?" Transparency Panel ---
  ✓ Why Advice contains all 4 data pillars and explicit CPCB rule citations

--- SUITE 5: Live Server Endpoints ---
  ✓ POST /api/chat provides grounded answer to "What does PM2.5 mean?"
  ✓ POST /api/chat answers in Tamil when requested

====================================================
TOTAL PHASE 3 TESTS:  13 | PASSED: 13 | FAILED: 0
ALL PHASE 3 TESTS PASSED! FAMILY PROFILES & AI ENGINE VERIFIED.
```

---

## 5. Privacy, Ethics & Disclaimers

1. **Zero Medical Diagnoses**: The system explicitly avoids clinical diagnoses, disease assessments, or statements like "you have asthma" or "this air is guaranteed safe".
2. **Local Profile Storage**: Household member profiles are stored only on the user's browser device (`localStorage`). No profile data is transmitted to external tracking services.
3. **Data Anonymization**: When calling external LLM endpoints, user names, household identifiers, and specific street addresses are stripped; only the age category and environmental readings are transmitted.

---

## 6. Instructions to Run the Application

```bash
# 1. Navigate to project root
cd C:\Users\LENOVO\.gemini\antigravity\scratch\airaware-ai

# 2. Run automated test suites (Phase 2, Phase 3, Phase 4)
node tests/run_tests.mjs
node tests/phase3_tests.mjs
node tests/phase4_tests.mjs

# 3. Build optimized production bundle
npm run build

# 4. Start production server
npm run start -- -p 3000

# 5. Open in browser:
# http://localhost:3000
```

---

## 7. Phase 4: Best Window & Outdoor Activity Planner

### Overview
Phase 4 implements a deterministic 24-hour forecast evaluation engine to answer the critical household question: **"When is a comparatively better time to go outside today?"**

Following all core project non-negotiables, this feature operates on genuine 24-hour hourly forecast data from ECMWF/CAMS (Copernicus) via Open-Meteo. It never fabricates forecast readings, never claims any window is "completely safe" or "pollution-free", and provides strictly comparative, age-adapted activity guidance.

### Key Capabilities Completed:
1. **24-Hour Forecast Timeline & Inspector (`BestWindowPlanner.tsx`)**:
   - Section: **"Find a Better Time to Go Outside"** (Phase 4 Live).
   - Evaluates the upcoming 24 hours of hourly CAMS particulate and gas projections.
   - Computes official CPCB India NAQI for every single forecast hour deterministically.
   - Interactive timeline: users can click any hour to view an inspection drawer comparing that hour against the best window.

2. **Deterministic Best Window Comparison Engine (`bestWindowRules.ts`)**:
   - Groups forecast hours into continuous candidate periods (e.g., 2-hour intervals).
   - Ranks candidate periods by average CPCB NAQI, peak particulate concentrations ($PM_{2.5}, PM_{10}$), and photochemical peak patterns ($O_3$).
   - Rank #1 window is highlighted as the **"Comparatively Most Favorable Window"**.
   - Mathematically calculates the exact reduction in AQI points and percentage compared to the peak pollution window.

3. **Family-Aware & Activity-Specific Guidance**:
   - Integrates with Phase 3 profiles (Child, Teen, Adult, Senior).
   - Four selectable general activities:
     - **Walking (🚶)**: Focuses on morning/evening walk timings and avoiding heavy traffic corridors.
     - **Outdoor Recreation / Play (⚽)**: Directs children and families to lower-ozone, lower-particulate windows with parent consultation and hydration reminders.
     - **Cycling (🚴)**: Advises on bike commutes and workouts away from high-traffic nitrogen dioxide and carbon monoxide corridors.
     - **General Outdoor (🌤️)**: Daily errands and general exposure moderation.
   - Non-medical: Explicitly disclaims personal physical fitness or clinical risk assessment.

4. **"Why This Time?" Transparency Modal (`WhyTimeModal.tsx`)**:
   - Displays all 6 required transparency and provenance fields:
     1. Exact forecast pollutant readings used ($PM_{2.5}, PM_{10}, O_3, NO_2, SO_2, CO$).
     2. AQI standard (India National AQI CPCB 2014, 0–500 scale).
     3. Data source (Copernicus CAMS via Open-Meteo under CC BY 4.0).
     4. Forecast timestamp.
     5. Exact mathematical comparison detail against the 24-hour peak.
     6. Explicit forecast limitations and uncertainties (~40 km regional model grid, diurnal boundary shifts).
   - Unconditional safety disclaimer: Does not guarantee zero pollution or completely safe air.

5. **Gemini & Grounded AI Explainer (`windowExplainer.ts` & `/api/best-window`)**:
   - Server route `POST /api/best-window` accepts hourly forecasts, active profile, selected activity, and language.
   - Computes deterministic ranking in the backend.
   - Safe Gemini 2.0 Flash integration adds conversational commentary without ever altering rankings or numbers.
   - Validated by `validator.ts`; seamless deterministic fallback when offline or unconfigured.

6. **Multi-Language Localization (English, Tamil, Hindi)**:
   - Dynamic real-time switching between English, Tamil (`தமிழ்`), and Hindi (`हिन्दी`).
   - Translates section headers, activity options, age-tailored guidance, and disclaimers.

7. **Test Suite Verification (`tests/phase4_tests.mjs`)**:
   - 13 automated tests covering window ranking, mathematical differences, insufficient data honesty, 4 family profiles, 4 activities, transparency fields, safety rules, Tamil/Hindi translations, and API reliability.
   - 13/13 Phase 4 tests passed (Total project test suite: 45 passed, 0 failed).

---

## 8. Phase 5: Indoor Air Advisor & Family Living Space

### Overview
Phase 5 addresses indoor home air quality without dedicated indoor hardware. In strict compliance with the project's non-negotiable rules, AirAware AI **never fabricates indoor air measurements or claims to have an indoor sensor**.

Instead, it transparently couples **verified outdoor atmospheric readings** (CAMS model estimates via Open-Meteo) with **user-reported, non-sensitive room characteristics** to generate practical, deterministic indoor hygiene and ventilation strategies.

### Mandatory Non-Sensor Notice
Displayed prominently in both the UI and API payload:
> *"These are general indoor-air suggestions based on available outdoor data and your answers. AirAware AI does not measure indoor air quality without a compatible sensor."*

### Key Capabilities Completed:
1. **Practical, Non-Sensitive Questionnaire (`IndoorSetupForm.tsx`)**:
   - Gathers 6 non-invasive living space attributes:
     - Room natural ventilation (`YES`, `NO`, `PARTIAL`).
     - Window operational habit (`OPEN`, `CLOSED`, `TIME_DEPENDENT`).
     - Proximity to active cooking / kitchen (`YES`, `NO`, `OCCASIONALLY`).
     - Presence of visible dust or smoke (`YES`, `NO`, `SOMETIMES`).
     - Air purifier availability (`YES`, `NO`).
     - Proximity to busy roads or transit corridors (`YES`, `NO`).
   - Every question is optional and can be skipped without degrading general guidance.
   - Zero medical or sensitive health history requested.
   - Privacy: Stored strictly in browser `localStorage` (`airaware_indoor_setup_v1`) and editable/clearable at any time.

2. **Deterministic Indoor Guidance Engine (`indoorAdvisorRules.ts`)**:
   - **Ventilation & Infiltration**: Warns against keeping windows open during high outdoor pollution periods (CPCB NAQI > 120); encourages fresh air flush when outdoor conditions are Good/Satisfactory (NAQI ≤ 100).
   - **Cooking Aerosol Control**: Advises mechanical exhaust hood operation and isolating living areas during high-heat frying/cooking.
   - **Road Traffic Buffer**: Recommends keeping road-facing windows buffered during diurnal rush hours (08:00–10:00, 17:00–20:00) when $NO_2$ and fine traffic soot peak.
   - **Particulate Management**: Promotes wet mopping and damp microfiber wiping over dry sweeping (which re-suspends coarse $PM_{10}$ into breathing zones).
   - **Purifier Strategy**: Guides positioning in high-occupancy bedrooms and keeping room apertures sealed during active filtration.
   - **General Baseline**: Discourages indoor incense or mosquito coil burning (which emit high $PM_{2.5}$).

3. **Family Profile Age-Adaptation**:
   - **Child (< 12 — *Aarav*)**: Emphasizes damp floor wiping for ground play, staying away from frying oil smoke, and keeping bedroom air clean.
   - **Teen (13–17 — *Priya*)**: Study-room ventilation timing during clean outdoor forecast windows to sustain alertness.
   - **Adult (18–59 — *Rajesh*)**: Kitchen exhaust management, filter maintenance, and balancing indoor $CO_2$ vs. outdoor dust.
   - **Senior (60+ — *Grandma Lakshmi*)**: Avoiding cold drafts and dust agitation; prioritizing quiet courtyard windows over road-facing exposures.

4. **"Why This Suggestion?" Transparency Modal (`WhySuggestionModal.tsx`)**:
   - Details exact inputs:
     - Outdoor Air Context (IN NAQI, category, dominant pollutant).
     - User Space Setup.
     - Environmental Reasoning.
     - **What AirAware AI Cannot Determine**: Transparently admits unknown air change rates (ACH), room volume, and unmonitored indoor gas concentrations.
     - Non-sensor notice.

5. **Gemini Integration & Fallback (`indoorExplainer.ts` & `/api/indoor-advisor`)**:
   - Server route `POST /api/indoor-advisor`.
   - Backend deterministic rules calculate recommendations.
   - Gemini 2.0 Flash provides concise family commentary validated by `validator.ts`.
   - Seamless fallback ensures 100% functionality without an API key.

6. **Multi-Language Localization**:
   - Full translation into English (`en`), Tamil (`ta` - தமிழ்), and Hindi (`hi` - हिन्दी).

7. **Test Suite Verification (`tests/phase5_tests.mjs`)**:
   - 14 automated tests covering all questionnaire branches, skipped answers, missing outdoor data, 4 family profiles, non-sensor disclaimers, zero-fabricated-numbers enforcement, and live API endpoints.
   - **Total project test count: 59 passed, 0 failed** (19 Phase 2 + 13 Phase 3 + 13 Phase 4 + 14 Phase 5).

---

## 9. Phase 6: Final Integration, Quality Assurance & Production Handover

### Overview
Phase 6 represents the final hardening, comprehensive testing, security auditing, and deployment preparation of AirAware AI V2.

### Audits & Hardening Completed:
1. **Data Accuracy Audit**:
   - Verified that all criteria pollutants ($\text{PM}_{2.5}, \text{PM}_{10}, \text{CO}, \text{NO}_2, \text{SO}_2, \text{O}_3$) map accurately to official CPCB 2014 breakpoint tables.
   - Unit normalization verified: $\text{CO}$ properly converted from raw $\mu g/m^3$ to national regulatory $mg/m^3$ ($\div 1000$).
   - Data types properly segregated: `MODEL_ESTIMATE` (CAMS simulation), `FORECAST` (hourly projections), and `MEASURED` (benchmarks).
   - Zero mock data or fabricated AQI numbers across any route or component.

2. **AI Reliability & Strict Validation**:
   - Verified that `validator.ts` intercepts all generative outputs.
   - Blocks ungrounded/invented numbers and forbids medical diagnostic claims (`diagnosis`, `prescription`, `cure`, `completely safe`).
   - Pure deterministic fallback engines (`deterministicExplanations.ts`, `bestWindowRules.ts`, `indoorAdvisorRules.ts`) deliver 100% functionality without requiring external LLM API keys.

3. **Security, Privacy & Secrets Protection**:
   - `.env.example` created with sanitized placeholders and zero real secrets.
   - `.gitignore` verified to exclude `.env*`, `.pem`, and build artifacts.
   - All server API keys remain strictly on the backend (`process.env.GEMINI_API_KEY`); zero client bundle exposure.
   - Family profiles and indoor space preferences are stored purely in client-side `localStorage`. Zero user demographics or medical histories collected or stored.

4. **UI/UX Polish & Accessibility**:
   - Minimal, high-contrast, environmental palette with accessible charcoal text.
   - Fluid responsiveness across mobile (<640px), tablet (768px), and desktop (1024px+).
   - Full keyboard accessibility and visible focus indicators.
   - Text scaling: Normal (`A`), Large (`A+`), Extra Large (`A++`).
   - Senior mode auto-activates high-contrast mode and larger text.
   - Full localization in English (`en`), Tamil (`ta`), and Hindi (`hi`).

5. **Automated End-to-End Test Suite Verification**:
   - **Phase 2 (Ingestion & AQI)**: 19/19 tests passed.
   - **Phase 3 (Family Profiles & AI Assistant)**: 13/13 tests passed.
   - **Phase 4 (Best Window Planner)**: 13/13 tests passed.
   - **Phase 5 (Indoor Air Advisor)**: 14/14 tests passed.
   - **Total Automated Tests**: 59/59 passed (100% pass rate).

6. **Production Build & Turbopack Compilation**:
   - `npm run build` compiled all routes statically and dynamically without errors or warnings.
   - Production server operational and verified on `http://localhost:3000`.



