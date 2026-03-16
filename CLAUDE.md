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

This is a [Raycast](https://raycast.com) extension with a single `no-view` command (`src/quickly-add-todo.ts`) that adds tasks directly to Apple Reminders via JXA/AppleScript through Raycast's API.

The command parses a text input string for prefix modifiers before delegating to the Reminders app:

| Prefix | Effect |
|--------|--------|
| `!` / `!!` / `!!!` | Priority (low / medium / high) |
| `@[date/time]` | Due date (`@tomorrow`, `@2026-03-16`, `@10:00`, etc.) |
| `/[list]` | Target Reminders list |
| `#[tag]` | Tag (multiple allowed) |

The remainder after stripping prefixes becomes the reminder title. Lists and tags are pre-fetched from Reminders for autocomplete.

## Key constraints

- macOS only at runtime (Apple Reminders + JXA) — `platforms` in `package.json` also lists Windows but the Reminders integration won't work there.
- No-view mode: the command runs silently and shows a HUD/toast; there is no UI rendered by React.
- Uses `@raycast/api` and `@raycast/utils`; avoid adding heavyweight dependencies.
