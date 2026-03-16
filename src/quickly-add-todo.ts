import { LaunchProps, showHUD, showToast, Toast, runAppleScript } from "@raycast/api";

export default async function Command(props: LaunchProps<{ arguments: { text: string } }>) {
  const title = props.arguments.text.trim();

  if (!title) {
    await showToast({ style: Toast.Style.Failure, title: "Task title cannot be empty" });
    return;
  }

  // Escape backslashes and quotes for AppleScript string safety
  const escaped = title.replace(/\\/g, "\\\\").replace(/"/g, '\\"');

  await runAppleScript(`
    tell application "Reminders"
      make new reminder with properties {name: "${escaped}"}
    end tell
  `);

  await showHUD(`Added: ${title}`);
}
