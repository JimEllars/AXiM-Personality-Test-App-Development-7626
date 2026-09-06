# Developer Notes

## Sprint 2 Updates
- **Telemetry**: Integrated Cloudflare Workers Analytics Engine telemetry across the `AssessmentFlow` and `usePersonalityStore`. Tracks `screen_view`, `assessment_advance`, `assessment_completed`, and errors via `ErrorBoundary`.
- **PDF Generation**: Verified `@react-pdf/renderer` leverages client-side async processing (`PDFDownloadLink`), keeping the application lightweight without blocking the main UI thread.
- **State Management (Psychometrics)**: Wired `irtEngine.js` directly into `usePersonalityStore.js` `setAnswer` function. Now, `thetaScores` and related metrics calculate on-the-fly and update synchronously with each answer.
- **UI Polish**: Updated `tailwind.config.js` to inherit modern custom CSS variables. Verified `DemographicGateModal` and `IntroView` for responsive readability.
- **Fallbacks**: Verified `ErrorBoundary` cleanly handles React errors and `SafeIcon` handles missing icon references safely.

## Known Issues / Next Steps
- None encountered during this update. The psychometric engine integration successfully handles synchronous local state without performance degradation since the item pool is relatively small (64 items). If item pool expands significantly, we may need to debouce theta calculations or use a Web Worker.

## Production Hardening (Recent Updates)
- **Edge Worker (Cloudflare)**: Hardened `personality-edge-worker` with a graceful 200/202 JSON response for all telemetry & api requests so missing downstream config never crashes frontend routing. Updated CORS config to seamlessly allow localhost dev and prod requests. Deploy with `cd personality-edge-worker && npm run deploy`.
- **Telemetry Payload & Flow Control**: Events are batched via a `navigator.sendBeacon` implementation with a `fetch(..., {keepalive: true})` fallback. Added a maximum batch truncate limit to eliminate oversized payload 413s. Fixed duplicate stage transitions by ensuring state machines enforce strict condition checking.
- **Dynamic Imports & PDF**: Hardcoded Helvetica standard fonts as the base fallback in `@react-pdf/renderer` profiles to eliminate client-side web font loading exceptions entirely.
- **Canvas Polish**: Forced `window.devicePixelRatio` scaling inside `createArchetypeCard` so badge vectors render crisply without anti-aliasing blur on mobile Retina displays.
- **A11y (Accessibility) Polish**: Corrected missing ARIA mappings (`role="radiogroup"`, `role="radio"`, `aria-checked`) across `LikertInput` and `QuestionCluster`. Wired Up/Down/Left/Right arrow keys for keyboard navigation across psychometric items. Enforced a minimum touch target area of 44x44px.

## Telemetry Resilience, UI Updates & Production Hardening
- **Telemetry Resilience**: Updated `telemetry.js` to buffer events in `localStorage` (`axim_telemetry_offline`) when offline or on failure, resuming when `online` event triggers. Handlers moved to `api/telemetry` instead of `api/v1/telemetry`.
- **Edge Worker Updates**: Updated CORS to only allow `https://axim.us.com` and `http://localhost:*`. Corrected status code mapping to 200 responses as required. Added an `api/health` and `/health` route.
- **Routing Base**: Updated `vite.config.js` to ensure the subpath is set to `/personalitytest/`.
- **UI & Accessibility**: Replaced "Jungian archetype" with "personality type" in public copy. Implemented keyboard arrow and numerical navigation (1-5) on `LikertInput` components. Ensured a 44px tap target size minimum across choices.
- **Error Boundaries**: Extended `ErrorBoundary.jsx` to offer a non-destructive "Resume Assessment" option alongside standard reset methods. Added fallback defaults in `usePersonalityStore.js`'s migrate script to gracefully capture `localStorage` corruption parsing errors.
- **Vitest configuration**: Fixed the package.json script for tests to run properly via `vitest run`.

## Example Results Showcase (Sprint 3)
- Implemented `ExampleResultPreview` to showcase the psychometric report directly on the landing page, aiming to increase conversion.
- Highlights continuous spectrum, multi-axis landscape, probabilistic IRT confidence, actionable blueprints, and the PDF dossier.
- Updated `personality-edge-worker` CORS policy to support `.pages.dev` for staging environments, preventing pre-flight blocks.
- Added comprehensive Vitest tests verifying mock data rendering and annotation presence using `jsdom`.

## API Routing & Layout Polish (Sprint 4)
- **Cloudflare Subpath Routing**: Disambiguated `/personalitytest` edge worker paths, allowing identical parsing regardless of origin base paths (`import.meta.env.BASE_URL`).
- **Telemetry Payload Additions**: Appended `timeToComplete`, `transitionLatency`, and `errorCount` parameters for enhanced observability. Bound Edge KV limits to aggregate basic psychometric population counts per-type automatically upon submit.
- **Example Results Showcase Polish**: Augmented `ExampleResultPreview` to list the cognitive function's full name alongside the key (e.g. `Ni · Introverted Intuition`). Adjusted CSS for optimal visual positioning on tablets (`@media max-width: 1024px`) and refined touch targets + A11y focus states for CTA buttons.
- **SSO Welcome Greeting**: Extracted Passport SSO authentication state (`axim_passport_token`) to dynamically render a "Welcome back, [Name]" badge above the hero kicker on the `IntroView`.
