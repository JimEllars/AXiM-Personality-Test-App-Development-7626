# Developer Notes

- `src/services/telemetry.js`: Updated offline queue storage to slice to maximum 50 events to prevent massive local payloads, and wrapped standard `fetch` execution inside a `try-catch` to avoid Unhandled Promise Rejections completely stopping the application. Both synchronous and asynchronous rejections fall back seamlessly to local storage.
- `src/components/ErrorBoundary.jsx` / `src/components/common/ErrorBoundary.jsx`: Ensured `trackError` is correctly fired in `componentDidCatch` to egress structured exceptions back to central KV storage.
- `personality-edge-worker/src/index.ts`: Configured an explicit 30 day (`2592000` seconds) TTL for both telemetry batches and archetype counts stored in KV to strictly prevent unmanaged database inflation at edge.
- UI Inputs: Added missing accessibility focus rings (`focus-visible:ring-offset-2`) onto both `ScenarioCardInput.jsx` and `ReactionDilemmaInput.jsx` preventing visual layout shifts while ensuring absolute keyboard clarity without compromising color contrast. Verified standard ARIA states on all slider inputs.
