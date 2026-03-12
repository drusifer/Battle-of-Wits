> TL;DR: Oracle's knowledge map — SYMBOL_INDEX and DOCUMENTATION_INDEX rebuilt post Sprint 1, T28 completed expanding attributes to 21 categories / 168 variants. Sprint 2 follow-up documentation closed 2026-03-11. Sprint 3 UI layer implemented and reviewed 2026-03-11.

## Recent Decisions

- **2026-03-11 (Sprint 3 review):** UI layer (ChatUI, StatusBar, GobletDisplay, main.js) implemented and tests passing. LESSONS.md updated to L01–L18 (new lessons: DOM mock pattern, ESM import-after-patch, let-hoisting for circular closure, whenIdle() stub, ARCH UI gaps). ARCH.md UI section updated with HTML contracts, AVATARS map, goblet:chosen payload shape, whenIdle() stub note.
- **2026-03-11 (Sprint 2 follow-up):** ARCH.md accuracy check completed by Morpheus — all 5 stale items fixed (Gramps signature, EventBus off(), goblets:described event, hint formula, data/ layout). LESSONS.md updated to L01–L13. task.md synced with T16–T29 marked complete.
- **2026-03-10 (T28):** Moved attribute data to modular files in `data/attributes/` to manage scale. Added `merge-attributes` to Makefile.

## Key Findings

- **Sprint 3 UI:** All three UI classes use JS private fields, EventBus auto-subscription pattern, and pure DOM manipulation — no frameworks.
- **DOM Mock Pattern:** `ChatUI.test.js` hand-rolls a minimal DOM mock. `global.document` is patched before dynamic `await import()` of UI modules — required because ESM caching would otherwise load modules before the global is live.
- **T31 Gap:** `whenIdle()` is a stub (resolves immediately). Typing animation is deferred. Risk: silent if T31 is skipped.
- **HTML Contract:** `GobletDisplay` requires `.goblet-desc` child inside each goblet button. Not previously in ARCH — now added.
- **Modular Attributes:** Large JSON files are easier to manage when split by category. `DataIntegrity.test.js` now gates the merged output.
- **ARCH Accuracy:** Sprint 3 ARCH.md UI section is now accurate and implementation-verified as of 2026-03-11.

## Important Notes

1. Run `make merge-attributes` after editing files in `data/attributes/`.
2. `DataIntegrity.test.js` checks for schema and content minimums.
3. ARCH.md accuracy check is now part of Sprint DoD (L13). Run a 10-minute diff at sprint end to prevent doc drift.
4. LESSONS.md contains L01–L18. Read before starting Sprint 4.
5. When adding a new character: update `AVATARS` in `src/ui/ChatUI.js` and add to `data/conversations.json` reactions map.
