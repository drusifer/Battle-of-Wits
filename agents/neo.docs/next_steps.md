# Next Steps

## Immediate Next Action
Wait for `*chat @mouse *sm plan Sprint 2` to kick off.

## On Sprint 2 Start
1. Read `agents/morpheus.docs/ARCH.md` Character Architecture section
2. Read `agents/oracle.docs/LESSONS.md` before writing any new code
3. Start T16: `src/characters/Character.js` base class
4. Then subclasses: Vizzini, Buttercup, Gramps, Boy
5. T17 EventBus before GameEngine (T18)

## Key Reminders
- Always parenthesise ternary before ===: `(x ? 'a' : 'b') === y`
- `withFrequency()` returns a Deck, not an array
- Characters get round Decks injected per round — they don't own them permanently
- GameEngine must `await chatUI.whenIdle()` before each beat

---
*Last updated: 2026-03-10*
