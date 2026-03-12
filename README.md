# Battle of Wits

> TL;DR: Vanilla JS browser game — solve riddles, collect oblique clues from Vizzini's taunts, deduce the safe goblet. No frameworks. Sprint 1 (logic core) complete; Sprint 2 (characters + engine) next.

> A browser-based puzzle game inspired by the iconic battle of wits scene from *The Princess Bride*.

Play as the Dread Pirate Roberts in a high-stakes intellectual duel against Vizzini. Solve riddles, collect oblique clues from Vizzini's taunts, and deduce which goblet is safe to drink from.

---

## Quick Start

```bash
npm install          # or: make npm-install
make test            # run 74-test unit suite
make uat             # run 71-check UAT acceptance suite
make lint            # ESLint + Prettier + duplication check
```

---

## Project Status

| Sprint | Goal | Status |
|--------|------|--------|
| Sprint 1 | Logic core (Deck, GobletManager, RiddleManager, GameSimulator) | ✅ Complete |
| Sprint 2 | Characters + async GameEngine + data expansion | 📋 Planned |
| Sprint 3 | Full browser UI — parchment theme | 📋 Planned |

---

## Architecture

The core primitive is a universal `Deck` class. Everything — riddles, goblet attributes, dialogue, reactions — is drawn from Deck instances.

```
Deck (draw-without-replacement, crypto.getRandomValues())
  └── Deck of Decks (AttributeDeck → category decks → variant objects)
        └── GobletManager assembles RoundContext per round
              └── GameEngine drives async state machine
                    └── ChatUI renders with typing delays
```

Key constraints:
- **No frameworks** — Vanilla JS/ES6 modules only
- **`Math.random()` banned** — all randomness via `crypto.getRandomValues()`
- **Vizzini never names the goblet** — clues are oblique adjectives only
- **Anti-contradiction rule** — no attribute variant shared between two goblets

See [`agents/morpheus.docs/ARCH.md`](agents/morpheus.docs/ARCH.md) for full architecture.

---

## Documentation

| Doc | Purpose |
|-----|---------|
| [`agents/DOCUMENTATION_INDEX.md`](agents/DOCUMENTATION_INDEX.md) | Full doc index + make targets |
| [`agents/cypher.docs/PRD.md`](agents/cypher.docs/PRD.md) | Product requirements |
| [`agents/morpheus.docs/ARCH.md`](agents/morpheus.docs/ARCH.md) | Architecture |
| [`agents/oracle.docs/LESSONS.md`](agents/oracle.docs/LESSONS.md) | Engineering gotchas (read before Sprint 2) |
| [`agents/oracle.docs/SYMBOL_INDEX.md`](agents/oracle.docs/SYMBOL_INDEX.md) | All classes + functions |
| [`task.md`](task.md) | Sprint task board |

---

## Tech Stack

- **Language:** JavaScript ES6+ Modules
- **Runtime:** Browser (Vanilla — no frameworks)
- **Testing:** Vitest
- **Linting:** ESLint v10 (flat config) + Prettier + jscpd
- **Randomness:** `crypto.getRandomValues()` exclusively
