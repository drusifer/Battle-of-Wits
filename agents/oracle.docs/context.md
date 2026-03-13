> TL;DR: Oracle's knowledge map — SYMBOL_INDEX and DOCUMENTATION_INDEX rebuilt post Sprint 1, T28 completed expanding attributes to 21 categories / 168 variants. Sprint 2 follow-up documentation closed 2026-03-11. Sprint 3 UI layer implemented and reviewed 2026-03-11. Root workspace groomed and CHAT.md summarized 2026-03-12.

## Recent Decisions

- **2026-03-12 (Data Structure Expansion - Round End Reactions):** Added new `game:won` and `game:lost` reaction categories to `data/conversations/reactions/*.json` files. These contain 50 variations per character. They specifically account for the narrative that DPR passes out but is revived from his resistance (game:won) or dies from a double dose of iocane (game:lost), and Vizzini dies giving one last zinger.
- **2026-03-12 (Data Structure Expansion - Banter):** Significantly expanded `data/conversations/banter.json` to include 10x more scenes for intro, riddle phase, goblet phase, and win/loss states. Incorporated a sprinkle of humor and emojis (about 30% frequency on new lines) to add character flavor. Fixed a data integrity test failing on 1-line intro scenes by ensuring all scenes have at least 2 lines.
- **2026-03-12 (Data Structure Expansion - Reactions):** Split character reactions into individual JSON files inside `data/conversations/reactions/` (`Vizzini.json`, `Buttercup.json`, `Gramps.json`, `Boy.json`). Expanded each reaction array to 50 items to provide massive variety.
- **2026-03-12 (Build Process Update):** Combined `merge-attributes` and `merge-conversations` into a single `make assemble-all` target in the Makefile to orchestrate data aggregation.

## Key Findings

- **Data Integrity Tests:** `DataIntegrity.test.js` successfully validates the merged output of attributes and conversations regardless of how granular the source JSON files become.
- **Sprint 3 UI:** All three UI classes use JS private fields, EventBus auto-subscription pattern, and pure DOM manipulation — no frameworks. Tests currently have issues with `requestAnimationFrame` not being mocked correctly in node environment.
- **DOM Mock Pattern:** `ChatUI.test.js` hand-rolls a minimal DOM mock. `global.document` is patched before dynamic `await import()` of UI modules.
- **HTML Contract:** `GobletDisplay` requires `.goblet-desc` child inside each goblet button.
- **Modular Attributes:** Large JSON files are easier to manage when split by category. `DataIntegrity.test.js` now gates the merged output.

## Important Notes

1. Run `make assemble-all` after editing files in `data/attributes/` or `data/conversations/`.
2. `DataIntegrity.test.js` checks for schema and content minimums.
3. ARCH.md accuracy check is now part of Sprint DoD (L13). Run a 10-minute diff at sprint end to prevent doc drift.
4. LESSONS.md contains L01–L18. Read before starting Sprint 4.
5. When adding a new character: update `AVATARS` in `src/ui/ChatUI.js` and add to `data/conversations.json` reactions map.