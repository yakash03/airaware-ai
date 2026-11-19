# AirAware AI V2 — "Air for Every Age"
> **Tagline:** *"Same air. Different people. Personal answers."*

AirAware AI transforms complex, real-world atmospheric environmental data into personalized, age-adapted interpretations for every member of the family—from children to seniors—using strictly verified data, deterministic calculations, and grounded AI.

---

## 1. Problem Statement & Core Thesis

Most air quality applications display a single, generic numerical Air Quality Index (AQI) number with one-size-fits-all medical warnings. In reality:
- **Same Air**: The actual atmospheric particulate and chemical concentration in a neighborhood is identical for everyone.
- **Different People**: A child playing soccer in a park, a teenager cycling to school, an adult commuting to work, and a senior taking a morning walk experience pollution with radically different physiological sensitivities and daily routines.
- **Personal Answers**: A single verified air quality snapshot is interpreted deterministically through multiple age-adapted lenses, providing tailored, practical advice without generic medical diagnoses.

---

## 2. Non-Negotiable Engineering Rules

1. **REAL DATA ONLY**: Every displayed environmental value comes from a live API or published dataset tagged with data source, data type (`MEASURED`, `MODEL_ESTIMATE`, `FORECAST`), and timestamp. Zero mock, simulated, or placeholder numbers in production code.
2. **RULES DECIDE, AI EXPLAINS**: The LLM never creates a measurement, calculates AQI, determines thresholds, or formulates advisories. Deterministic algorithms decide; Gemini explains.
3. **ZERO SENSOR FABRICATION**: The app does not have an indoor hardware sensor. It never invents indoor AQI or indoor PM2.5 readings.
4. **NO MEDICAL DIAGNOSIS**: Strictly avoids clinical claims, diagnoses, or unconditional "safe/unsafe" assertions. Language uses comparative phrasing (e.g., *"comparatively more favorable based on the forecast"*).
5. **TRANSPARENCY IN ALL RECOMMENDATIONS**: Every card features a "Why Am I Seeing This?" or "Why This Time?" provenance breakdown disclosing data pillars, mathematical rationale, and uncertainty boundaries.
6. **PRIVACY BY DESIGN**: Family profiles and indoor space setups are stored locally on the user's device (`localStorage`). Zero personal demographics transmitted to external cloud trackers.

---

## 3. Key Features

### A. Real-Time Environmental Dashboard
- Live atmospheric chemistry ingestion via Open-Meteo CAMS Global Atmospheric Model (ECMWF, ~40 km resolution) under CC BY 4.0.
- Live criteria pollutants: $\text{PM}_{2.5}$, $\text{PM}_{10}$, $\text{CO}$, $\text{NO}_2$, $\text{SO}_2$, and $\text{O}_3$.
- Deterministic India National AQI (CPCB 2014 linear breakpoints, 0–500 scale) with dominant pollutant identification.
- Real-time weather overlay: temperature, relative humidity, wind speed, wind direction, and precipitation.
- Interactive geocoding search for Indian and global cities with quick-select shortcuts.

### B. Family Air Profiles (CRUD)
- Pre-seeded with a 4-generation household (*Aarav, Priya, Rajesh, Grandma Lakshmi*).
- Four age categories:
  - **Child (< 12 yrs)**: Friendly, protective language, hydration reminders, parent consultation.
  - **Teen (13–17 yrs)**: Sports, workout timing, school commutes, traffic soot avoidance.
  - **Adult (18–59 yrs)**: Professional, objective exposure moderation, commute scheduling.
  - **Senior (60+ yrs)**: High-legibility text, gentle walking timing, courtyard window preference.
- Local browser storage with zero external tracking.

### C. Age-Adaptive AI Assistant ("Ask AirAware AI")
- Grounded conversational Q&A powered by Google Gemini 2.0 Flash with automated output validation (`validator.ts`).
- Instant deterministic fallback engine (`deterministicExplanations.ts`) ensuring 100% functionality without an API key or when offline.
- Multi-language localization in **English (`en`)**, **Tamil (`ta` - தமிழ்)**, and **Hindi (`hi` - हिन्दी)**.

### D. Four-Pillars Transparency Modal ("Why Am I Seeing This?")
Deconstructs guidance into 4 mandatory provenance pillars:
1. **Measured**: Ground monitoring sensor status (avoiding mislabeling).
2. **Model Estimate**: CAMS global atmospheric chemistry reanalysis.
3. **Forecast**: Hourly 24-hour forward projections.
4. **General Guidance**: Deterministic CPCB 2014 and WHO 2021 air quality guidelines.

### E. 24-Hour Best Window & Outdoor Activity Planner
- Hourly forward scan of CPCB NAQI and pollutant concentrations.
- Identifies the **"Comparatively Most Favorable Window"** (Rank #1) and computes exact mathematical reduction vs. the diurnal peak.
- Activity selection: Walking (🚶), Outdoor Recreation/Play (⚽), Cycling (🚴), General Outdoor (🌤️).
- Interactive 24-hour timeline bar chart with single-click hourly delta inspector.
- Dedicated "Why This Time?" modal itemizing forecast readings, AQI scale, and uncertainty bounds.

### F. Indoor Air Advisor
- Solves home air quality without requiring fake sensor hardware.
- Optional 6-question space setup (natural ventilation, window habits, cooking activity, dust/smoke, air purifier, road exposure).
- Prominent mandatory notice: *"AirAware AI does not measure indoor air quality without a compatible sensor."*
- Actionable strategies: window management during high outdoor pollution, kitchen exhaust isolation, wet mopping over dry sweeping, purifier bedroom positioning.
- "Why This Suggestion?" provenance modal disclosing what AirAware AI cannot determine without indoor hardware.

### G. Accessibility & Inclusive Design
- Font size scaling: Normal (`A`), Large (`A+`), Extra Large (`A++`).
- High-Contrast mode toggle.
- Senior mode automatically activates high contrast and larger text sizing.

---

## 4. Tech Stack

- **Framework**: [Next.js 16.4.6](https://nextjs.org/) (App Router, Turbopack, React 19)
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **AI Engine**: Google Gemini 2.0 Flash (`@google/genai` REST) with strict deterministic fallback
- **Data Providers**: Open-Meteo Air Quality (CAMS/ECMWF), Open-Meteo Forecast, Open-Meteo Geocoding
- **Caching**: Server-side in-memory TTL Cache (15-min air/weather, 24-hr geocoding)
- **Testing**: Node.js automated test suites (59 passing tests)

---

## 5. Getting Started & Local Development

### Prerequisites
- Node.js 18+ or 20+ (tested on Node.js v24)
- npm, pnpm, or yarn

### 1. Clone & Install
```bash
git clone https://github.com/your-username/airaware-ai.git
cd airaware-ai
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
*(Optional)* Add your Gemini API key to `.env.local`:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```
> **Note:** If `GEMINI_API_KEY` is omitted, AirAware AI operates seamlessly with zero degradation using its deterministic rule engine.

### 3. Run Automated Test Suite
```bash
node tests/run_tests.mjs       # Phase 2 tests (19 tests)
node tests/phase3_tests.mjs    # Phase 3 tests (13 tests)
node tests/phase4_tests.mjs    # Phase 4 tests (13 tests)
node tests/phase5_tests.mjs    # Phase 5 tests (14 tests)
```
*Total: 59/59 tests passing.*

### 4. Build & Start Production Server
```bash
npm run build
npm run start -- -p 3000
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Deployment Instructions (Vercel)

AirAware AI is built with the Next.js App Router and is 100% Vercel-ready.

1. Push your repository to GitHub or GitLab.
2. Import the project into [Vercel Dashboard](https://vercel.com/new).
3. Set the Environment Variables:
   - `GEMINI_API_KEY` (Optional, server-side only)
4. Click **Deploy**.
5. Vercel automatically compiles the static pages, server route handlers (`/api/air`, `/api/best-window`, `/api/chat`, `/api/explain`, `/api/indoor-advisor`, `/api/location`, `/api/weather`), and asset optimization.

---

## 7. Data Sources & Official Attribution

- **Air Quality Modeling**: Copernicus Atmosphere Monitoring Service (CAMS) reanalysis and global atmospheric forecasts provided via Open-Meteo under [Creative Commons Attribution 4.0 International (CC BY 4.0)](https://creativecommons.org/licenses/by/4.0/).
- **Weather Forecasts**: Open-Meteo Weather API using DWD ICON and NOAA GFS models under CC BY 4.0.
- **Geocoding Data**: Open-Meteo Geocoding API based on GeoNames.
- **AQI Calculation Methodology**: Central Pollution Control Board (CPCB), Ministry of Environment, Forest and Climate Change, Government of India (National Air Quality Index Report, October 2014).
- **Health Benchmarks**: World Health Organization (WHO) Global Air Quality Guidelines (2021).

---

## 8. Known Data & Sensor Limitations

1. **Regional Model Resolution (~40 km)**: Open-Meteo CAMS data represents regional grid estimates. Local street microclimates (heavy traffic junctions, construction sites, hyper-local biomass burning) may cause localized deviations.
2. **Forecast Uncertainty**: Hourly air quality predictions naturally exhibit greater uncertainty in hours 18–24 compared to near-term projections.
3. **No Indoor Sensor**: AirAware AI does not have hardware sensors installed in user homes. All indoor suggestions are comparative environmental principles and do not constitute indoor gas or particulate measurements.
4. **Non-Medical**: Environmental air quality assessments do not evaluate individual cardiovascular or respiratory clinical fitness.

---

## 9. License

This project is licensed under the MIT License — see the LICENSE file for details.
