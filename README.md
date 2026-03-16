# Quickly Add to Reminders

Quickly add tasks to Apple Reminders without opening the Reminders app.

## Usage

Type a task title in Raycast and it will be added to Apple Reminders instantly.

**Example:** `完成软件的登录功能` → adds a reminder titled "完成软件的登录功能"

You can prefix the task with one or more modifiers (separated by spaces) to control priority, due date, list, and tags. The extension pre-fetches your Reminders lists and tags for autocomplete.

## Prefixes

| Prefix | Description | Example |
|--------|-------------|---------|
| `!` / `!!` / `!!!` | Set priority (low / medium / high) | `!! Buy groceries` |
| `@[date/time]` | Set due date (defaults to today) | `@tomorrow Fix bug` |
| `/[list]` | Add to a specific list (defaults to default list) | `/Develop Refactor auth` |
| `#[tag]` | Apply a tag (defaults to none, supports multiple) | `#work #urgent Submit report` |

### Supported Date Formats

- `@2026-03-16`
- `@2026-03-16 15:33`
- `@10:00`
- `@tomorrow`
- `@today` (default when `@` is omitted)