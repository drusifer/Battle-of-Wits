# Current Task

**Status:** In Progress — Tech Debt Sprint planning complete, handing off to Neo/Oracle
**Assigned to:** Morpheus
**Started:** 2026-03-12

## Task Description
Plan tech debt sprint for post-Sprint-3 cleanup.

## Progress
- [x] Reviewed Sprint 3 CHAT.md for flagged items
- [x] Audited main.js restart flow → found P1 bug (TD1)
- [x] Audited ARCH.md → found 3 stale sections (TD2a/b/c)
- [x] Audited GobletDisplay.enable() → found dead code (TD3)
- [x] Written plan to agents/morpheus.docs/TECH_DEBT_SPRINT.md
- [x] Posted to CHAT.md
- [ ] Neo: implement TD1 fix + tests
- [ ] Oracle: patch ARCH.md (TD2a/b/c)
- [ ] Neo: clean up TD3

## Key Finding — TD1 is a Real Bug
`main.js` restart handler calls `destroy()` on UI components before `engine.restart()`, permanently removing their EventBus subscriptions. Second game plays silently (empty chat, no status bar, no goblets). The restart path should call `clear()`/`reset()`/`hide()` only — `destroy()` is for SPA teardown, not in-lifecycle reset.

## Blockers
None.

---
*Last updated: 2026-03-12 by Morpheus*
