# Before submitting to PromptWars

Complete these checks on the actual repository and deployment.

## Required

- [ ] Replace the repository `README.md` with the upgraded version.
- [ ] Add `docs/CHALLENGE_ALIGNMENT.md`.
- [ ] Confirm `GEMINI_API_KEY` is configured as a server-side Vercel environment variable if live Gemini responses are expected.
- [ ] Test the deployed dashboard and location search.
- [ ] Test the family profile flow.
- [ ] Test Gemini chat with a valid key.
- [ ] Test the deterministic fallback without a key or with the AI service unavailable, if this can be done safely in a local environment.
- [ ] Test the forecast planner and indoor advisor.
- [ ] Re-run all four documented test commands.
- [ ] Add a real demo video URL to the README after uploading the video.
- [ ] Add real screenshots from the deployed application if you want screenshots in the README.
- [ ] Verify the Vercel deployment uses the commit being submitted.

## GitHub repository settings

Set the repository description to:

AI-powered urban air quality assistant with CPCB-based AQI calculations, CAMS data, age-aware guidance and Gemini explanations.

Set the Website field to:

https://airaware-ai-omega.vercel.app/

Suggested topics:

urban-air-quality, air-quality, air-pollution, generative-ai, google-gemini, nextjs, typescript, environmental-tech

## Accuracy checks

- Do not call CAMS model estimates ground-station measurements.
- Do not claim street-level precision.
- Do not claim indoor AQI measurement without a sensor.
- Do not say Gemini calculates the AQI.
- Do not claim medical diagnosis or guaranteed safe activity windows.
- Do not quote a passing test count unless the current commit passes the tests.
- The repository currently documents an MIT license in README, but confirm that a `LICENSE` file exists before retaining that claim. Add a real license file only if you intend to license the project under those terms.
