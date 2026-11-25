# PromptWars Challenge 6 — Urban Air Quality Assistant

## Project

**AirAware AI V2 — Same air. Different people. Personal answers.**

- Live application: https://airaware-ai-omega.vercel.app/
- Public source: https://github.com/yakash03/airaware-ai

## Challenge understanding

An urban air-quality assistant should do more than display a pollution number. It should help people understand available air-quality information, interpret it responsibly, and use it as context for everyday decisions.

AirAware AI addresses this by combining air-quality model data, weather context, deterministic Indian AQI calculations, age-aware explanations, and a grounded conversational assistant.

## Problem addressed

Many AQI experiences provide a single number and a generic message. This can leave users unsure about:
- What the pollutant values represent.
- Whether the data is measured or model-estimated.
- How current conditions may relate to common activities.
- How to interpret the information for different age groups.
- What limitations apply to the displayed data.

## Solution

AirAware AI presents environmental information through a transparent pipeline:

1. Retrieve air-quality, weather and location data from Open-Meteo services.
2. Normalize pollutant values, units, timestamps and provenance.
3. Calculate India's National AQI using deterministic CPCB 2014 breakpoint logic.
4. Compare available hourly forecast conditions for the activity planner.
5. Present the same underlying environmental snapshot through age-aware profile explanations.
6. Use Google Gemini 2.0 Flash for natural-language explanations when configured.
7. Validate generated responses and use deterministic explanations when the AI service is unavailable or its output cannot be accepted.

## Feature-to-challenge mapping

| Challenge dimension | Implemented feature | Evidence location |
|---|---|---|
| Urban air-quality awareness | Air-quality dashboard and pollutant display | `src/` application implementation |
| AQI interpretation | CPCB India NAQI calculation | `src/lib/aqi/` as described in `ARCHITECTURE.md` |
| Weather context | Open-Meteo weather integration | `src/lib/providers/` as described in `ARCHITECTURE.md` |
| Location context | Location search and geocoding | `src/lib/providers/` and application UI |
| Personalized assistance | Child, teen, adult and senior profiles | Family profile components and `localStorage` logic |
| Generative AI | Gemini-powered chat and explanation routes | `/api/chat`, `/api/explain`, and AI service modules |
| Grounding and reliability | Output validation and deterministic fallback | `validator.ts`, `deterministicExplanations.ts` as documented |
| Activity planning | Comparative 24-hour forecast window | `/api/best-window` and planner UI |
| Indoor guidance | General household guidance with explicit no-sensor notice | `/api/indoor-advisor` and indoor advisor UI |
| Inclusion | English, Tamil, Hindi and accessibility controls | Translation and accessibility modules |

> Evidence paths above reflect the repository's architecture and README documentation. Evaluators should verify the current implementation in source code and the live deployment.

## What is generative AI used for?

**Service:** Google Gemini 2.0 Flash.

Gemini is used for natural-language conversational explanations and responses to user questions about the environmental context supplied by the application. It helps make technical pollutant and AQI information easier to understand and can adapt the explanation to the selected profile and language context.

Gemini is not used to:
- Create or fabricate environmental measurements.
- Calculate CPCB AQI values.
- Define official pollutant breakpoints.
- Decide the numerical ranking of forecast windows.
- Claim to diagnose or predict an individual's medical condition.

The application documents a response-validation layer and deterministic fallback explanations for cases where Gemini is unavailable or output does not satisfy application constraints.

## Data sources

- Open-Meteo Air Quality API, using CAMS-based atmospheric model data.
- Open-Meteo Weather API.
- Open-Meteo Geocoding API.
- CPCB National Air Quality Index methodology (2014).
- WHO Global Air Quality Guidelines (2021) as a general reference.

## Responsible-use boundaries

- Air-quality values sourced from CAMS are regional model estimates, not readings from a sensor at the user's exact location.
- Forecasts are estimates and can change.
- The application does not measure indoor air quality without compatible hardware.
- Recommendations are general environmental guidance, not medical diagnosis or individualized clinical advice.
- Family profiles are documented as browser-local data.

## Suggested live demonstration sequence

Use the actual deployed application and show each feature working:

1. Open the dashboard and select a location.
2. Point out the pollutant values, AQI category, timestamp and model-estimate provenance.
3. Open family profiles and compare how the explanation changes while the environmental snapshot remains the same.
4. Ask the AI assistant a question about a pollutant or current conditions.
5. Show the language option, if available in the deployed build.
6. Open the 24-hour activity planner and explain that it compares forecast conditions rather than guaranteeing safety.
7. Open indoor guidance and point out the explicit no-indoor-sensor limitation.

Do not claim a feature is working in the submitted deployment unless it has been tested in that deployment.

## Evaluation summary

AirAware AI's central contribution is the combination of **urban air-quality information, deterministic AQI interpretation, age-aware communication, and grounded generative-AI explanations** in one web application. Its emphasis on data provenance and limitations is intentional: users should understand both the information and how much confidence to place in it.
