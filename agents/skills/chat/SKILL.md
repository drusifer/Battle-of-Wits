---
name: chat
description: Post messages to the team chat log (agents/CHAT.md). Use to communicate between personas, log progress updates, and coordinate handoffs.
triggers: ["*msg", "*chat log"]
---

# Chat Skill

## Overview

The `chat` skill posts structured messages to `agents/CHAT.md`, the shared team communication log. All personas use this to coordinate work and hand off tasks.

## Usage

```bash
python agents/tools/chat.py "<message>" --persona <Name> --cmd <command> [--to <recipient>]
```

### Arguments

| Argument | Flag | Default | Description |
|----------|------|---------|-------------|
| message | positional | required | Message content |
| persona | `--persona` / `-p` | `$USER` | Who is sending (e.g. `Neo`, `Trin`) |
| cmd | `--cmd` / `-c` | `chat` | Command prefix (auto-prefixed with `*`) |
| to | `--to` / `-t` | `all` | Recipient persona name |

### Output Format

```
[DATETIME] [**Persona**]->[**recipient**] *cmd*:

 message
```

## Examples

### Log a user request
```bash
python agents/tools/chat.py "fix the bug in parser.py" --persona User --cmd "request"
```

### Post a persona response
```bash
python agents/tools/chat.py "Fixed bug in parser.py line 42" --persona Neo --cmd "swe fix" --to Trin
```

### Assign work to another persona
```bash
python agents/tools/chat.py "@Trin please verify the fix in parser.py" --persona Neo --cmd "handoff" --to Trin
```

## When to Post

- **ENTRY**: After reading CHAT.md to acknowledge context
- **WORK**: After completing each significant step
- **HANDOFF**: When switching to another persona — assign the next task explicitly
- **EXIT**: Before saving state files

## Reading the Chat Log

Always read `agents/CHAT.md` (newest messages at the END) before starting work:

```
Read agents/CHAT.md  # last 10-20 messages for context
```
