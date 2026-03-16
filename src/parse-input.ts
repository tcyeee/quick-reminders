// Reminders AppleScript priority values: 0=none, 1=high, 5=medium, 9=low
export type ReminderPriority = 0 | 1 | 5 | 9;

export interface ParsedInput {
  title: string;
  priority: ReminderPriority;
}

const PRIORITY_MAP: Record<string, ReminderPriority> = {
  "!!!": 1,
  "!!": 5,
  "!": 9,
};

export function parseInput(raw: string): ParsedInput {
  let rest = raw.trim();
  let priority: ReminderPriority = 0;

  // Loop allows prefixes in any order; each iteration consumes one prefix token.
  let progressed = true;
  while (progressed) {
    progressed = false;

    const priorityMatch = rest.match(/^(!{1,3})(?:\s+|$)/);
    if (priorityMatch) {
      priority = PRIORITY_MAP[priorityMatch[1]] ?? 0;
      rest = rest.slice(priorityMatch[0].length).trimStart();
      progressed = true;
    }
  }

  return { title: rest, priority };
}
