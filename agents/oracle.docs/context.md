> TL;DR: Oracle's knowledge map — SYMBOL_INDEX and DOCUMENTATION_INDEX rebuilt post Sprint 1, LESSONS.md created (L01–L07), all stale agent state files updated.

## Recent Decisions

- **2026-03-10 (Sprint 1 groom):** Full doc audit and groom after Sprint 1 completion. Rebuilt SYMBOL_INDEX.md (was wrong project), updated DOCUMENTATION_INDEX.md, created LESSONS.md, updated all stale agent state files.

## Key Findings

- **SYMBOL_INDEX.md was wrong project:** Contained Python NFC provisioner symbols. Completely rebuilt for Battle of Wits JS.
- **Stale state files:** neo.docs/context.md, neo.docs/current_task.md, mouse.docs/sprint_log.md, mouse.docs/context.md — all were template/pre-Sprint-1 state. Updated.
- **LESSONS.md created:** L01–L07 capturing all Sprint 1 engineering gotchas.
- **DOCUMENTATION_INDEX.md:** Rebuilt from scratch — project-specific, includes make targets, source map, sprint status.

## Important Notes

Key documents for onboarding:
1. `agents/cypher.docs/PRD.md` — what we're building
2. `agents/morpheus.docs/ARCH.md` — how it's designed
3. `agents/oracle.docs/LESSONS.md` — what to watch out for
4. `agents/oracle.docs/SYMBOL_INDEX.md` — what's in src/
5. `task.md` — sprint status
6. `agents/DOCUMENTATION_INDEX.md` — this index

Single Source of Truth hierarchy:
- PRD > ARCH > DECISIONS > code comments

---
*Last updated: 2026-03-10 by Oracle*
