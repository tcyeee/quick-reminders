import { LaunchProps, showHUD, showToast, Toast } from "@raycast/api";
import { runAppleScript } from "@raycast/utils";

export default async function Command(props: LaunchProps<{ arguments: { text: string } }>) {
  const title = props.arguments.text.trim();

  if (!title) {
    await showToast({ style: Toast.Style.Failure, title: "Task title cannot be empty" });
    return;
  }

  await runAppleScript(
    `on run argv
      tell application "Reminders"
        make new reminder with properties {name: item 1 of argv}
      end tell
    end run`,
    [title],
  );

  await showHUD(`Added: ${title}`);
}
