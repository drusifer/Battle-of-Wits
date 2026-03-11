## Recent Decisions

- **2026-03-10 (Sprint 1 complete):** Sprint 1 fully delivered — 15/15 tasks, 74 unit tests, 71 UAT checks, all lint gates clean. Code quality tooling added (ESLint, Prettier, jscpd).
- **2026-03-10 (Sprint 2 planned):** T16–T29 detailed. 14 tasks. Backlog carry-over (T16) + characters (T17–T22) + EventBus+GameEngine (T23–T26) + data expansion (T27–T29). Sprint 3 renumbered T30–T35.

## Key Findings

- **Sprint 1 velocity: 15/15 tasks** — delivered in one session.
- **Sprint DoD metric (GameSimulator):** winRate=75% (correct), variantCollisions=0, uniqueClueLines=250.
- **Quality gates now in Makefile:** `make test`, `make uat`, `make lint` — all must pass before Sprint 2 DoD.
- **Data files are a risk:** UAT found 3 content defects in Sprint 1. Data expansion tasks (T27, T28) must each be gated by `make uat`.
- **Sprint 2 DoD:** GameEngine completes full headless 2-round cycle with all characters wired. 150+ tests. 100+ riddles. 20+ attribute categories × 8+ variants.

## Important Notes

- Task board: `task.md`
- Sprint log: `agents/mouse.docs/sprint_log.md`
- Architecture reference: `agents/morpheus.docs/ARCH.md`
- PRD reference: `agents/cypher.docs/PRD.md`
- Lessons: `agents/oracle.docs/LESSONS.md`

---
*Last updated: 2026-03-10 (Oracle grooming)*
