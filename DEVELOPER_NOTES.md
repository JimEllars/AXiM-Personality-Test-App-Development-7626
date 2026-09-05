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
- **Edge Worker (Cloudflare)**: Introduced \`personality-edge-worker\` for edge ingestion of telemetry and assessment payload handling. Develop locally with \`wrangler dev\`.
- **Telemetry Payload**: Events are batched via a \`navigator.sendBeacon\` implementation (with a \`fetch\` fallback) avoiding page latency. Queue length triggers at 15 items or a 10s timeout limit. Payload contains \`event\`, \`timestamp\`, \`url\`, \`userAgent\`, and custom properties.
- **Dynamic Imports**: Used \`Suspense\` and \`React.lazy()\` to defer the heavy loading of \`@react-pdf/renderer\`. The archetype card share functions are dynamically imported on-demand to improve load speed.
- **Offline Resilience**: Zustand storage now maintains a \`pendingSync\` array that queues up API failures. A listener on \`window.online\` triggers automatic replays so no progress or session result is lost on network interruption.
- **Charts**: Fortified \`RadarProfileChart.jsx\` and \`TrendLineChart.jsx\` against empty or \`NaN\` inputs yielding graceful empty states.
