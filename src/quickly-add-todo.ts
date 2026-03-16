import { LaunchProps, showHUD, showToast, Toast } from "@raycast/api";
import { parseInput } from "./parse-input";
import { addReminder } from "./add-reminder";

export default async function Command(props: LaunchProps<{ arguments: { text: string } }>) {
  const raw = props.arguments.text.trim();

  const parsed = parseInput(raw);

  if (!parsed.title) {
    await showToast({ style: Toast.Style.Failure, title: "Task title cannot be empty" });
    return;
  }

  await addReminder(parsed);
  await showHUD(`Added: ${parsed.title}`);
}
