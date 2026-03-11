---
name: make
description: Invoke project Makefile targets for build, test, lint, install, and other project-defined tasks.
triggers: ["*make"]
---

# Make Skill

## Overview

All project automation runs through `make`. This is the standard way to run tasks — don't invoke tools directly when a Makefile target exists.

## Standard Targets

| Command | Description |
|---------|-------------|
| `make help` | List all available targets |
| `make tldr` | Show TL;DR summaries from all project files (quick orientation) |
| `make install` | Install runtime dependencies |
| `make install-dev` | Install dev/test/lint dependencies |
| `make run` | Run the application |
| `make build` | Build the project |
| `make clean` | Remove build artifacts |

### Testing
| Command | Description |
|---------|-------------|
| `make test` | Run full test suite |
| `make test-unit` | Unit tests only |
| `make test-integration` | Integration tests only |
| `make test FILE=path/to/test.py` | Run a specific test file |
| `make test ARGS="-k pattern"` | Run tests matching a pattern |
| `make test ARGS="-x"` | Stop on first failure |
| `make coverage` | Run tests with coverage report |

### Quality
| Command | Description |
|---------|-------------|
| `make lint` | Run all quality checks |
| `make lint-style` | PEP-8 / style checks |
| `make type-check` | Static type analysis |
| `make dead-code` | Detect unused code |
| `make complexity` | Cyclomatic complexity report |

## Usage

```bash
# See what targets this project defines
make help

# Run a target
make <target>

# Pass extra arguments
make test ARGS="-k my_test -v"
```

## Fallback

If a target does not exist yet, add it to the Makefile — do not call tools directly.

> Always use `make help` first to discover what's available in this project.

## Adding Targets

When adding new automation, always add a Makefile target so all agents and humans use the same entry point:

```makefile
.PHONY: my-task
my-task:  ## Description of what this does
	<command>
```
