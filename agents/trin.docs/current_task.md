# Current Task: GUI UAT for SPRINT3_Feedback Fixes

**Status:** Complete pending `npm install` + `npx playwright install chromium`
**Assigned:** 2026-03-12

## Done

- [x] `FAST_MODE` check added to `ChatUI.js` `typingDelay()` — returns 0 when `window.FAST_MODE=true`
- [x] 1 new unit test: `ChatUI — FAST_MODE` — verifies delay collapses to 0ms (delay=0 flushes with 1ms fake timer advance)
- [x] `@playwright/test` added to `package.json` devDependencies
- [x] `playwright.config.js` created — headless chromium, baseURL localhost:5173, webServer lifecycle
- [x] `tests/gui/sprint3_feedback.spec.js` — 4 GUI tests (T-GUI-1 through T-GUI-4)
- [x] `make uat-gui` target added to Makefile
- [x] `make test` — 240/240 green (was 239)

## Pending (user action required)

```bash
npm install                        # pulls @playwright/test
npx playwright install chromium    # downloads headless browser (~150MB)
make uat-gui                       # runs the 4 GUI tests
```

## Test Pyramid Summary

| Layer | Count | Tool |
|---|---|---|
| Unit | 240 | vitest |
| Component UAT | 47+69+71 | uat_sprint1/2/3.mjs |
| GUI (new) | 4 | Playwright/chromium |

GUI tests cover only real-DOM UX contracts not testable at lower layers.
FAST_MODE=true injected by Playwright collapses all typing delays to 0ms.

---
*Last updated: 2026-03-12 by Trin*
