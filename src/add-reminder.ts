import { runAppleScript } from "@raycast/utils";
import { ParsedInput } from "./parse-input";

// Uses JXA (JavaScript for Automation) for richer Reminders API access.
const JXA_SCRIPT = `
function run(argv) {
  var title      = argv[0];
  var priority   = parseInt(argv[1]);
  var dueDateMs  = argv[2];          // ms timestamp string, or ""
  var listName   = argv[3];          // list name, or ""

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

  // NOTE: Apple has never exposed tags in the Reminders scripting dictionary.
  // tagNames is not a valid property — tag support via JXA/AppleScript does not exist.
  app.make({ new: "reminder", at: targetList, withProperties: reminderProps });
}
`;

export async function addReminder({ title, priority, dueDate, list, tags }: ParsedInput): Promise<void> {
  await runAppleScript(JXA_SCRIPT, [title, String(priority), dueDate ? String(dueDate.getTime()) : "", list ?? "", tags.join(",")], {
    language: "JavaScript",
  });
}
