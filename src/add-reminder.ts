import { runAppleScript } from "@raycast/utils";
import { ParsedInput } from "./parse-input";

// Uses JXA (JavaScript for Automation) for richer Reminders API access.
const JXA_SCRIPT = `
function run(argv) {
  var title        = argv[0];
  var priority     = parseInt(argv[1]);
  var dueDateMs    = argv[2];  // ms timestamp, or ""
  var dueDateParts = argv[3];  // "YYYY,M,D" for date-only, or ""
  var listName     = argv[4];  // list name, or ""

  var app = Application("Reminders");

  var reminderProps = { name: title, priority: priority };
  if (dueDateParts) {
    var p = dueDateParts.split(",");
    reminderProps.dueDate = new Date(parseInt(p[0]), parseInt(p[1]), parseInt(p[2]));
  } else if (dueDateMs) {
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

export async function addReminder({ title, priority, dueDate, dueDateHasTime, list, tags }: ParsedInput): Promise<void> {
  const dueDateMs = dueDate && dueDateHasTime ? String(dueDate.getTime()) : "";
  const dueDateParts =
    dueDate && !dueDateHasTime
      ? `${dueDate.getFullYear()},${dueDate.getMonth()},${dueDate.getDate()}`
      : "";

  await runAppleScript(JXA_SCRIPT, [title, String(priority), dueDateMs, dueDateParts, list ?? "", tags.join(",")], {
    language: "JavaScript",
  });
}
