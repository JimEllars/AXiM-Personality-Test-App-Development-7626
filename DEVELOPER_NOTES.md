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

## Telemetry & Edge Resilience Sprint (Recent Updates)
- **Cloudflare Edge Worker**: Hardened endpoints in `personality-edge-worker/src/index.ts`. Added a health check (`/api/health`) returning timestamp/region. Implemented strict payload size limits (<64KB) for `/api/telemetry` to prevent 413s, returning lightweight structured JSON `{success: true, processed: count}`. Updated worker tests.
- **Telemetry Client**: Replaced `axim_telemetry_offline` with `axim_telemetry_queue` in `telemetry.js` and ensured robust offline buffering. Integrated detailed tracking inside `AssessmentFlow.jsx` to measure velocity (`assessment_advance`) and item dwell time (`likert_selection` with latency).
- **Export Fault Isolation**: Wrapped heavy client operations (PDF generation in `ResultView.jsx` and HTML Canvas generation in `ArchetypeShareCard.jsx`) inside explicit `try/catch` and React `ErrorBoundary` blocks to gracefully emit notifications and telemetry error events instead of crashing the dashboard. Fixed a variable reference error (`safeThetas` to `store.thetaScores`).
- **UI & Accessibility**: Added mobile touch target scaling inside `production-polish.css` to enforce a 44x44px min touch area on viewports < 640px. Updated `LikertInput.jsx` to handle explicit `Enter` and `Space` keyboard traversal triggers.

## Sprint 5 & 6 Deliverables
- Polyfilled/replaced `Array.prototype.at()` in `ThetaTrendCharts.jsx` for universal mobile/WebKit compatibility.
- Wrapped all 8 result subcomponents in dedicated `ErrorBoundary` fallbacks to ensure the main profile header and radar chart never crash.
- Added `tests/ResultView.test.jsx` verifying defensive rendering on null/empty initial states.

## Sprint 2.1 — Production Edge Telemetry Ingestion & Session Hydration Resilience
- **Cloudflare Edge Worker Ingest (`personality-edge-worker`)**:
  - Updated telemetry worker to parse, validate, and respond to incoming event bodies securely.
  - Returns `200` upon success and `400` when validation fails (missing `event`, `sessionId`, `timestamp`, or `metadata`).
  - Added unit tests checking these error paths and schema conditions.
- **Client Telemetry Hardening (`src/services/telemetry.js`)**:
  - Wired offline queuing into `localStorage` leveraging the `axim_telemetry_queue`.
  - Restored payloads automatically whenever `window.addEventListener('online')` fires.
  - Added schema adherence directly to `trackEvent` generation (`sessionId` and `metadata`).
- **Assessment Session Hydration (`src/store/usePersonalityStore.js` & `AssessmentFlow.jsx`)**:
  - Upgraded session store to version `5` integrating keys: `responses`, `currentQuestionIndex`, and `startedAt`.
  - Allowed safe resume flow so users are not blocked navigating away or refreshing during an active assessment.
- **UI Accessibility & Mobile Polish**:
  - Upgraded components and `.likert-option` CSS variables for the 44x44px standard mobile touch target baseline.
  - Enhanced ARIA `radiogroup` navigation semantics with arrow-key keyboard bindings directly applied in `LikertInput.jsx`.

## Telemetry, Dependencies, UI Polish (Latest)
- **Cloudflare Edge Worker Telemetry**: Implemented `POST /api/telemetry` which accepts batched telemetry events, and stores aggregated events in `TELEMETRY_DB` KV namespace. Added a health check returning `200 OK` with worker version, timestamp, and bindings status.
- **Client-Side Telemetry & Beacon Fallback**: Added `beforeunload` event to flush telemetry queue. Added exponential backoff (up to 3 retries) when `fetch` fallback fails, before queuing locally.
- **Code-Splitting Exports**: Deferred loading of `@react-pdf/renderer` inside `ResultView.jsx` dynamically to vastly decrease main bundle chunk size (reducing main payload and decoupling heavy PDF generation scripts). Improved UI state while PDF prepares.
- **State Hydration**: Ensured Zustand's `persist` loads correctly on start and updated the prompt text in `IntroView.jsx` for unfinished assessments to `Resume assessment where you left off?`
- **Accessibility & UI**: Added `Enter` keyboard handler to advance items within `AssessmentFlow.jsx`. Adjusted disabled colors inside `App.css` to improve baseline contrast ratio against dark backgrounds. Added minimum height constraint to question groups to prevent layout layout shifts.
