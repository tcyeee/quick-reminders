# Quickly Add to Reminders

Quickly add tasks to Apple Reminders without opening the Reminders app.

## Commands

### Quickly Add Todo (no-view)

Type a task string directly in Raycast — the reminder is created instantly with no extra screen.

**Example:** `!! @tomorrow /Work 完成登录功能` → high-priority reminder due tomorrow in the Work list.

### Add Reminder (form view)

Opens a dedicated form with a free-text input at the top and a live-parsed preview below. Both sides stay in sync: editing the text updates the fields; tapping a field rewrites the text.

- **Priority / List / Due Date** rows are interactive — press ↩ to open actions.
- **List autocomplete**: type `/` anywhere in the text to trigger list suggestions. Press ↩ to select; the completed prefix is moved to the front of the text (e.g. `一个任务/dev` → `/Develop 一个任务`).
- **Date autocomplete**: type `@` anywhere to trigger `@today` / `@tomorrow` suggestions, same front-placement behaviour.
- **Add**: `⌘↩` from any row.

## Prefix syntax

Prefixes can appear in any order and are space-separated. All prefixes are stripped before the remainder becomes the reminder title.

| Prefix | Description | Example |
|--------|-------------|---------|
| `!` / `!!` / `!!!` | Priority — low / medium / high | `!! Buy groceries` |
| `@[date/time]` | Due date (bare `@` defaults to today) | `@tomorrow Fix bug` |
| `/[list]` | Target Reminders list (defaults to default list) | `/Work Refactor auth` |
| `#[tag]` | Tag — parsed but not applied (Apple limitation, see below) | `#work Submit report` |

### Supported date formats

| Format | Example |
|--------|---------|
| Named | `@today` `@tomorrow` |
| Date only | `@2026-03-16` |
| Date + time | `@2026-03-16 15:33` |
| Time only (today) | `@10:00` |

`@today` and `@tomorrow` create **date-only** reminders (no time shown, no overdue warning).

### Tags

Apple has never exposed tag support in the Reminders scripting API. The `#tag` prefix is recognised and parsed but cannot be written to Reminders.
