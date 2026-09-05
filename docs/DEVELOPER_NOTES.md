# AXiM Personality Assessment — Developer Notes

## Archetype conversation guide

The results page includes a locally generated conversation guide with three modes:

- **Explain your profile** gives the user language for describing their archetype.
- **Start a discussion** provides prompts for inviting another person's perspective.
- **Reflect privately** turns the result into personal journaling prompts.

Every prompt is derived from the current archetype and strongest function score. Prompts can be copied individually using the browser clipboard API with a legacy fallback.

No responses are stored or transmitted. The guide is a reflection and conversation aid only.

## Theta trend charts

The results page includes a locally generated longitudinal view:

- Shows every saved result snapshot alongside the current result.
- Lets users switch between all eight theta functions.
- Shows the selected function on a `-4` to `+4` scale.
- Shows pattern-match movement on a `0%` to `100%` scale.
- Displays snapshot dates and the latest function movement.
- Uses SVG charts with browser-native point tooltips.
- Keeps chart generation dependency-free and works without a backend.

Trend changes should be interpreted as reflective estimates, not clinical change, diagnostic evidence, or permanent personality change.

## Retake score comparison

The results experience preserves up to five completed result snapshots locally. A new result is archived exactly once when `setResults` receives it, preventing duplicate history entries when the user starts a retake.

The comparison panel:

- Shows the earlier and current archetype.
- Shows pattern-match movement in percentage points.
- Lists each cognitive function's earlier score, current score, and change.
- Supports choosing between multiple saved attempts.
- Displays directional indicators for increasing and decreasing function scores.
- Uses reactive Zustand selectors for current result values.
- Provides a direct retake action from the results page.
- Handles invalid dates and missing historical score values safely.

## Retake behavior

Selecting `Retake assessment` clears the current answers, scores, exercises, and bookmarks while preserving result history. The prior completed result is not added again because it was already stored when the result screen was generated.

The existing `Clear session` action remains destructive and removes the complete local session, including comparison history.

## Persistence

The local Zustand session schema is version 4. Existing sessions migrate safely with normalized result history. At most five snapshots are retained to keep the local session compact.

## Important scoring limitation

The current `confidence` value comes from cosine similarity against Jungian reference vectors. It is presented as a pattern-match indicator, not statistical certainty or classification accuracy.

Score differences should be interpreted as reflective signals rather than evidence of clinical change or a fixed identity.