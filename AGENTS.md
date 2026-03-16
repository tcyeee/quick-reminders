# AGENTS.md

Guidance for AI agents (Codex, Copilot, etc.) working in this repository.

## Project overview

Raycast extension (`no-view` mode) that adds tasks to Apple Reminders via JXA without opening the app. The user types a string with optional prefix modifiers; the extension parses them and creates a reminder.

## Source map

| File | Role |
|------|------|
| `src/quickly-add-todo.ts` | Command entry point — reads `LaunchProps.arguments.text`, calls `parseInput` then `addReminder`, shows HUD/toast |
| `src/parse-input.ts` | Pure parsing — exports `parseInput(raw: string): ParsedInput` and the `ParsedInput` interface |
| `src/add-reminder.ts` | Side-effect layer — exports `addReminder(parsed: ParsedInput): Promise<void>` via JXA |
| `package.json` | Defines the command argument (`text`, required, type `text`) |

## Extending the parser

To add a new prefix type, make changes **only in `parse-input.ts`**:

1. Add the field to `ParsedInput`.
2. Define a regex constant (`/^PREFIX_PATTERN(?:\s+|$)/`).
3. Add an `else if` branch inside the `while (changed)` loop in `parseInput`.

The loop processes one token per iteration and handles any prefix order automatically.

## Extending the Reminders integration

Changes go in `add-reminder.ts`. The JXA script string (`JXA_SCRIPT`) receives all data through the `argv` array — do not interpolate user data into the script string. Add new `argv` positions and update both the `runAppleScript` call args and the JXA function body together.

## Critical API notes

- `runAppleScript` comes from `@raycast/utils`, **not** `@raycast/api`. Importing from `@raycast/api` causes a runtime `is not a function` error.
- The JXA script must use `language: "JavaScript"` in the options object.
- Tags (`reminder.tags`) require macOS 12+; wrap in try/catch.
- `no-view` commands show no UI — use `showHUD` for success and `showToast` for errors (both from `@raycast/api`).

## Do not

- Do not interpolate user input into the JXA script string (injection risk).
- Do not switch from JXA back to AppleScript for this script — date handling and list lookup are much harder in AppleScript.
- Do not add React components — this extension intentionally has no view.
