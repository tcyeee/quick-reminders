import { LaunchProps, showHUD, showToast, Toast } from "@raycast/api";
import { parseInput } from "./parse-input";
import { addReminder } from "./add-reminder";
import { saveTagsToHistory } from "./tag-history";

export default async function Command(props: LaunchProps<{ arguments: { text: string } }>) {
  const raw = props.arguments.text.trim();

  const parsed = parseInput(raw);

  if (!parsed.title) {
    await showToast({ style: Toast.Style.Failure, title: "Task title cannot be empty" });
    return;
  }

  await addReminder(parsed);
  if (parsed.tags.length > 0) await saveTagsToHistory(parsed.tags);
  await showHUD(`Added: ${parsed.title}`);
}
