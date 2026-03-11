> TL;DR: Trin's Sprint 1 QA knowledge — UAT at agents/tools/uat_sprint1.mjs (make uat), 3 data defects fixed, lint caught real operator-precedence bug, 3 test coverage gaps logged for Sprint 2.

## Recent Decisions

- UAT script lives at `agents/tools/uat_sprint1.mjs`, run via `make uat`
- `Deck.withFrequency()` returns a **Deck**, not an array — sample draws to verify null ratio
- banter.outro_* entries are arrays-of-arrays (scene variants); min 3 variants required

## Key Findings

- **Duplicate riddle answer**: `riddles.json` had "fire" twice (lines 52 and 88 originally) — fixed to "ember"
- **Thin outro arrays**: `outro_win` and `outro_lose` had only 1 scene variant — expanded to 3
- **Win rate baseline**: 75% (not 50%) is correct for this 2-chance game design (P=0.5 + 0.5×0.5)
- **Math.random**: Zero runtime usage confirmed — comments and test labels only

## Important Notes

Sprint 1 UAT: 71/71 checks passed. Issues found and fixed in data files, not in engine code.
UAT covers: data integrity, Deck primitive, normalize, GobletManager, RiddleManager, GameSimulator batch, factory independence.
The unit test suite (74 tests) does NOT cover data file content quality — UAT does.

- **Lint targets**: eslint (flat config `eslint.config.js`), prettier (`.prettierrc`), jscpd (`.jscpdrc`). All via `make lint` or individual `make lint-*` targets.
- **False positives to be aware of**: `security/detect-object-injection` fires on all bracket notation including Fisher-Yates shuffle and `Object.entries()` loops — these are safe, mark with eslint-disable-next-line
- **Operator precedence gotcha**: `Deck.coinFlip() ? 'left' : 'right' === ctx.safe` is WRONG — evaluates as ternary first, then `===`. Always parenthesise: `(Deck.coinFlip() ? 'left' : 'right') === ctx.safe`
- Lint caught this real bug during refactoring — win rate jumped to 93.6%

---
*Last updated: 2026-03-10 by Trin*
