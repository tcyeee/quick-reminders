# AGENTS.md

Guidance for AI agents (Codex, Copilot, etc.) working in this repository.

## Project overview

Raycast extension with two commands that add tasks to Apple Reminders:

1. **`quickly-add-todo`** (no-view) — inline command-line style; user supplies a prefixed string as a Raycast argument.
2. **`add-reminder-view`** (view) — List-based form with a search bar as the text input and a live-parsed preview below; supports autocomplete for list names and dates.

## Source map

| File | Role |
|------|------|
| `src/quickly-add-todo.ts` | Command 1 entry point — reads `LaunchProps.arguments.text`, calls `parseInput` → `addReminder` |
| `src/add-reminder-view.tsx` | Command 2 — `<List>` view with controlled `searchText`; autocomplete + parsed preview |
| `src/parse-input.ts` | Pure parsing — `parseInput()`, `reconstructInput()`, `ParsedInput` interface |
| `src/add-reminder.ts` | Reminders integration — EventKit ObjC bridge via `runAppleScript` |
| `src/get-reminder-lists.ts` | Fetches Reminders list names via JXA for dropdown/autocomplete |

## Extending the parser

Only touch `parse-input.ts`:

1. Add the field to `ParsedInput`.
2. Define a regex constant (`/^PREFIX_PATTERN(?:\s+|$)/`).
3. Add an `else if` branch in the `while (changed)` loop in `parseInput`.
4. Handle the new field in `reconstructInput`.

## Extending the Reminders integration

Only touch `add-reminder.ts`. The EventKit ObjC script receives data through `argv[]` — never interpolate user values into the script string. Add new `argv` positions and update the JXA function body and the TypeScript `runAppleScript` call together.

## Critical API notes

- `runAppleScript` comes from `@raycast/utils`, **not** `@raycast/api`.
- The script uses `language: "JavaScript"` (JXA) with `ObjC.import('EventKit')`.
- **ObjC no-arg methods are property access, not function calls**: `$.EKEventStore.new` ✓ / `$.EKEventStore.new()` ✗. Calling them as functions causes `TypeError: Object is not a function`.
- **Date-only reminders**: pass year/month/day via `dueDateParts` (`"YYYY,M(0-based),D"`); the JXA script sets `NSDateComponents` without `hour`/`minute` so Reminders treats it as all-day (no red overdue warning). Do not pass a timestamp for date-only — even midnight triggers the overdue warning.
- **Tags cannot be set** via any Apple scripting or EventKit API. The `#tag` prefix is parsed into `ParsedInput.tags` but is never passed to `add-reminder.ts`. Do not attempt to implement this.

## Autocomplete logic (add-reminder-view.tsx)

List and date autocomplete uses greedy regex to find the **last** occurrence of a token anywhere in `text`:

```
list  /.*(\/\S*)/   → lastListToken
date  /.*(@\S*)/    → lastDateToken
```

On selection the token is spliced out of its current position and the completed prefix is prepended to the front of the string. An existing prefix of the same type at the front is replaced. This means `/` or `@` can be typed anywhere — the result always ends up at the front.

## Do not

- Interpolate user input into JXA/ObjC script strings.
- Call ObjC no-arg methods with `()` (causes runtime crash).
- Attempt tag support — it does not exist in Apple's scripting APIs.
- Add React `<Form>` components to the view command — it uses `<List>` intentionally for search-bar-based autocomplete.
