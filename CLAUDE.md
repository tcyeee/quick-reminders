# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start development mode with hot reload
npm run build      # Build for production
npm run lint       # Run ESLint
npm run fix-lint   # Run ESLint with auto-fix
npm run publish    # Publish to Raycast Store
```

## Architecture

A Raycast extension with a single `no-view` command. The user types a text string in Raycast; the extension parses prefix modifiers from it and creates a reminder in Apple Reminders via JXA (JavaScript for Automation).

### Source files

```
src/
├── quickly-add-todo.ts   # Entry point: receives LaunchProps, orchestrates parse → add
├── parse-input.ts        # Pure prefix parser, no side effects
└── add-reminder.ts       # JXA integration with @raycast/utils runAppleScript
```

### Prefix syntax (any order, space-separated)

| Prefix | Effect | Apple Reminders value |
|--------|--------|-----------------------|
| `!` / `!!` / `!!!` | Priority low / medium / high | `priority` 9 / 5 / 1 |
| `@[date/time]` | Due date (bare `@` = today) | `dueDate` |
| `/[list]` | Target list (falls back to default list) | `targetList` |
| `#[tag]` | Tag — multiple allowed | `tags` array |

Supported `@` date formats: `@today`, `@tomorrow`, `@10:00`, `@2026-03-16`, `@2026-03-16 15:33`.

### parse-input.ts

`parseInput(raw)` runs a `while` loop that consumes one prefix token per iteration using four regexes (`PRIORITY_PREFIX_RE`, `DATE_PREFIX_RE`, `LIST_PREFIX_RE`, `TAG_PREFIX_RE`). Whatever remains after all prefixes are consumed becomes the `title`. Returns `ParsedInput: { title, priority, dueDate, list, tags }`.

`DATE_PREFIX_RE` handles the `@YYYY-MM-DD HH:MM` case (space inside the token) via an inner non-capturing group.

### add-reminder.ts

Uses `runAppleScript` from `@raycast/utils` (not `@raycast/api`) with `language: "JavaScript"` (JXA). All user-supplied values are passed as `argv` strings — never interpolated into the script — to avoid injection. Tags are set via `reminder.tags` inside a try/catch because the API requires macOS 12+.

## Key constraints

- `runAppleScript` must be imported from `@raycast/utils`, not `@raycast/api`.
- `no-view` mode: no React UI. User feedback via `showHUD` (success) and `showToast` (failure).
- macOS only at runtime despite `platforms` listing Windows in `package.json`.
