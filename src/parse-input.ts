// Reminders AppleScript priority values: 0=none, 1=high, 5=medium, 9=low
export type ReminderPriority = 0 | 1 | 5 | 9;

export interface ParsedInput {
  title: string;
  priority: ReminderPriority;
  dueDate: Date | null;
  list: string | null;
  tags: string[];
}

const PRIORITY_MAP: Record<string, ReminderPriority> = {
  "!!!": 1,
  "!!": 5,
  "!": 9,
};

// Matches: @today @tomorrow @10:00 @2026-03-16 @2026-03-16 15:33 or bare @
const DATE_PREFIX_RE = /^@(today|tomorrow|\d{1,2}:\d{2}|\d{4}-\d{2}-\d{2}(?:\s+\d{1,2}:\d{2})?)?(?:\s+|$)/;
const PRIORITY_PREFIX_RE = /^(!{1,3})(?:\s+|$)/;
const LIST_PREFIX_RE = /^\/(\S+)(?:\s+|$)/;
const TAG_PREFIX_RE = /^#(\S+)(?:\s+|$)/;

function parseDueDateStr(dateStr: string): Date {
  const now = new Date();

  if (!dateStr || dateStr === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  if (dateStr === "tomorrow") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  }

  // @10:00 — today at specific time
  const timeOnly = dateStr.match(/^(\d{1,2}):(\d{2})$/);
  if (timeOnly) {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), +timeOnly[1], +timeOnly[2]);
  }

  // @2026-03-16 15:33
  const dateTime = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{1,2}):(\d{2})$/);
  if (dateTime) {
    return new Date(+dateTime[1], +dateTime[2] - 1, +dateTime[3], +dateTime[4], +dateTime[5]);
  }

  // @2026-03-16
  const dateOnly = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (dateOnly) {
    return new Date(+dateOnly[1], +dateOnly[2] - 1, +dateOnly[3]);
  }

  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

export function parseInput(raw: string): ParsedInput {
  let rest = raw.trim();
  let priority: ReminderPriority = 0;
  let dueDate: Date | null = null;
  let list: string | null = null;
  const tags: string[] = [];

  // Each iteration consumes one prefix token; loop until no more prefixes found.
  let m: RegExpMatchArray | null;
  let changed = true;
  while (changed) {
    changed = false;

    if ((m = rest.match(PRIORITY_PREFIX_RE))) {
      priority = PRIORITY_MAP[m[1]] ?? 0;
      rest = rest.slice(m[0].length).trimStart();
      changed = true;
    } else if ((m = rest.match(DATE_PREFIX_RE))) {
      dueDate = parseDueDateStr((m[1] ?? "today").trim());
      rest = rest.slice(m[0].length).trimStart();
      changed = true;
    } else if ((m = rest.match(LIST_PREFIX_RE))) {
      list = m[1];
      rest = rest.slice(m[0].length).trimStart();
      changed = true;
    } else if ((m = rest.match(TAG_PREFIX_RE))) {
      tags.push(m[1]);
      rest = rest.slice(m[0].length).trimStart();
      changed = true;
    }
  }

  return { title: rest, priority, dueDate, list, tags };
}
