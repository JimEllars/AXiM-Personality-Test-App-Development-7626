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
