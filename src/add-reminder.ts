import { runAppleScript } from "@raycast/utils";
import { ParsedInput } from "./parse-input";

// Uses JXA (JavaScript for Automation) for richer Reminders API access.
const JXA_SCRIPT = `
function run(argv) {
  var title      = argv[0];
  var priority   = parseInt(argv[1]);
  var dueDateMs  = argv[2];          // ms timestamp string, or ""
  var listName   = argv[3];          // list name, or ""
  var tagNames   = argv[4] ? argv[4].split(",").filter(function(t) { return t.length > 0; }) : [];

  var app = Application("Reminders");

  var reminderProps = { name: title, priority: priority };
  if (dueDateMs) {
    reminderProps.dueDate = new Date(parseInt(dueDateMs));
  }

  var targetList = app.defaultList;
  if (listName) {
    var matches = app.lists.whose({ name: listName });
    if (matches.length > 0) targetList = matches[0];
  }

  var reminder = app.Reminder(reminderProps);

  if (tagNames.length > 0) {
    try {
      reminder.tags = tagNames.map(function(name) { return app.Tag({ name: name }); });
    } catch (_) {
      // Tags API unavailable on this macOS version — skip silently.
    }
  }

  targetList.reminders.push(reminder);
}
`;

export async function addReminder({ title, priority, dueDate, list, tags }: ParsedInput): Promise<void> {
  await runAppleScript(JXA_SCRIPT, [title, String(priority), dueDate ? String(dueDate.getTime()) : "", list ?? "", tags.join(",")], {
    language: "JavaScript",
  });
}
