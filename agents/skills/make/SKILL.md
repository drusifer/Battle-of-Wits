---
name: make
description: Invoke project Makefile targets for build, test, lint, preview, and other project-defined tasks. All targets route through mkf (build output filter) automatically — output is captured to build/build.out and status is posted to CHAT.md.
triggers: ["*make"]
targets:
  - { cmd: "make test",            description: "Run full test suite" }
  - { cmd: "make test-watch",      description: "Run tests in watch mode" }
  - { cmd: "make test-coverage",   description: "Run tests with coverage report" }
  - { cmd: "make lint",            description: "Run all lint checks (ESLint + format + duplication)" }
  - { cmd: "make lint-fix",        description: "Auto-fix ESLint + Prettier issues" }
  - { cmd: "make lint-format",     description: "Check code formatting (Prettier)" }
  - { cmd: "make lint-format-fix", description: "Auto-fix formatting" }
  - { cmd: "make lint-complexity", description: "Check cyclomatic complexity, nesting depth, function length" }
  - { cmd: "make lint-dead-code",  description: "Detect unused vars, unreachable code, unused expressions" }
  - { cmd: "make lint-security",   description: "Security audit (eval, unsafe regex, non-literal require)" }
  - { cmd: "make lint-structure",  description: "Code smell detection (magic numbers, nesting, eqeq, etc.)" }
  - { cmd: "make lint-duplication",description: "Detect copy-paste duplication (min 8 lines / 50 tokens)" }
  - { cmd: "make uat",             description: "Run Sprint 1 UAT acceptance checks" }
  - { cmd: "make uat2",            description: "Run Sprint 2 UAT acceptance checks" }
  - { cmd: "make uat3",            description: "Run Sprint 3 UAT acceptance checks" }
  - { cmd: "make uat-gui",         description: "Run headless Playwright GUI tests (starts/stops dev server)" }
  - { cmd: "make goblet-preview",  description: "Print COUNT goblet description pairs (default: 10)" }
  - { cmd: "make npm-install",     description: "Install npm dependencies" }
  - { cmd: "make merge-attributes",description: "Merge category JSONs into data/attributes.json" }
  - { cmd: "make tldr",            description: "Show TL;DR summaries from all project files" }
  - { cmd: "make help",            description: "Show all targets with descriptions (bypasses mkf)" }
  - { cmd: "make chat",            description: "Post a message to CHAT.md (bypasses mkf). Usage: make chat MSG='...' [PERSONA='...'] [CMD='...'] [TO='...']" }
  - { cmd: "make preview",         description: "Start dev server on 0.0.0.0, auto-selects port (bypasses mkf, foreground)" }
  - { cmd: "make install",         description: "Copy agents into a project (usage: make install TARGET=/path)" }
---

# Make Skill

## Overview

All project automation runs through `make`. Every target (except `help` and `preview`) is
automatically routed through **mkf** (`scripts/mkf`) — the build output filter. You do not
need to call mkf directly; just run `make <target>`.

## CRITICAL — Do not capture make output into context

**Never** run make with output redirected into the conversation context:

```bash
# WRONG — floods context window, defeats mkf entirely
Bash(make test 2>&1)
Bash(make test V=-vvv 2>&1)

# CORRECT — mkf handles output; only the tail + exit code appear
Bash(make test)
Bash(make test V=-vv)
```

mkf exists specifically to keep build output out of the context window. Piping or capturing the full output (via `2>&1` or shell redirection into a variable) defeats this and bloats the context with hundreds of lines. Always let mkf manage the output — check `build/build.out` directly if you need details after a run.

---

## What mkf does

- Captures all build output to `build/build.out`
- Prints the last 10 lines of output on exit
- Posts build status + tail to `agents/CHAT.md` as persona `make`
- Returns the make exit code — callers can rely on it for pass/fail

## Verbosity

Control how much output appears in your terminal during the run using `V=`:

| Flag | Terminal output |
|------|----------------|
| *(none — default)* | Silent. Exit code only. Full log in `build/build.out`. |
| `V=-v`   | stderr only (npm errors, make errors) |
| `V=-vv`  | stderr + filtered stdout (test failures, `FAIL`, `×`, `Error:`, `npm ERR`) |
| `V=-vvv` | stderr + full stdout (everything) |

```bash
make test                  # silent — exit code + tail on finish
make test V=-v             # show stderr live
make test V=-vv            # show failures/errors only
make test V=-vvv           # show everything live
make lint V=-vv            # lint with failure lines visible
```

## Targets

### Testing
| Command | Description |
|---------|-------------|
| `make test` | Run full test suite (239 tests) |
| `make test-watch` | Run tests in watch mode |
| `make test-coverage` | Run tests with coverage report |

### UAT
| Command | Description |
|---------|-------------|
| `make uat` | Sprint 1 UAT acceptance checks |
| `make uat2` | Sprint 2 UAT acceptance checks |
| `make uat3` | Sprint 3 UAT acceptance checks |

### Lint / Quality
| Command | Description |
|---------|-------------|
| `make lint` | All checks: ESLint + Prettier + duplication |
| `make lint-fix` | Auto-fix ESLint + Prettier |
| `make lint-format` | Prettier check only |
| `make lint-format-fix` | Prettier auto-fix |
| `make lint-complexity` | Cyclomatic complexity, nesting, function length |
| `make lint-dead-code` | Unused vars, unreachable code |
| `make lint-security` | Security audit |
| `make lint-structure` | Code smell detection |
| `make lint-duplication` | Copy-paste duplication |

### Dev / Tooling
| Command | Description |
|---------|-------------|
| `make chat MSG="..." [PERSONA="..."] [CMD="..."] [TO="..."]` | Post a message to `agents/CHAT.md`. **Bypasses mkf.** |
| `make preview` | Dev server on `0.0.0.0`, auto-selects port — prints URL. **Foreground, Ctrl+C to stop. Bypasses mkf.** |
| `make goblet-preview` | Sample goblet description pairs — `make goblet-preview COUNT=20` |
| `make npm-install` | Install npm dependencies |
| `make merge-attributes` | Merge category JSONs → `data/attributes.json` |
| `make tldr` | TL;DR summaries from all `.md` files |
| `make help` | All targets with descriptions. **Bypasses mkf.** |
| `make install` | Install BobProtocol agents into a project — `make install TARGET=/path` |

## Output file

Full build log is always at `build/build.out`. Inspect it after any run:

```bash
cat build/build.out        # full log
tail -20 build/build.out   # last 20 lines
```

## Fallback

If a target does not exist, add it to the Makefile — do not invoke tools directly.
Place real recipes inside the `ifdef MKF_ACTIVE` block so they are captured by mkf.
Targets that must run interactively (foreground servers, watch modes) should be defined
in the `else` block alongside `help` and `preview` to bypass mkf.

## Adding Targets

```makefile
# Inside ifdef MKF_ACTIVE — captured by mkf
my-task: ## Description shown in make help
	<command>
```

```makefile
# Inside else — bypasses mkf (use for interactive/foreground targets)
.PHONY: my-task
my-task: ## Description shown in make help
	<command>
```
