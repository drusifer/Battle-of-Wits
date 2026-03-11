# Next Steps

## Immediate Next Action
Wait for Sprint 2 to begin. When Neo implements Characters + GameEngine, run:
- `*qa test all` after each T16–T20
- `*qa review` on GameEngine async state machine (complex — high risk)

## Planned Work for Sprint 2 UAT
- [ ] Create `agents/tools/uat_sprint2.mjs` covering GameEngine state transitions
- [ ] Verify async `whenIdle()` contract is tested (banter never interleaves gameplay)
- [ ] Verify EventBus events fire in correct order
- [ ] Add `make uat2` target

## Waiting On
Mouse to kick off Sprint 2, Neo to implement T16–T20

---
*Last updated: 2026-03-10*
