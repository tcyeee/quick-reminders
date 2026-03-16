import { runAppleScript } from "@raycast/utils";
import { ParsedInput } from "./parse-input";

export async function addReminder({ title, priority }: ParsedInput): Promise<void> {
  await runAppleScript(
    `on run argv
      set taskName to item 1 of argv
      set taskPriority to (item 2 of argv) as integer
      tell application "Reminders"
        make new reminder with properties {name: taskName, priority: taskPriority}
      end tell
    end run`,
    [title, String(priority)],
  );
}
