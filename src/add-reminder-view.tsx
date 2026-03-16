import { Form, ActionPanel, Action, showHUD, popToRoot, showToast, Toast } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { useState } from "react";
import { parseInput, reconstructInput, ReminderPriority } from "./parse-input";
import { addReminder } from "./add-reminder";
import { getReminderLists } from "./get-reminder-lists";

const PRIORITY_OPTIONS: { value: string; title: string }[] = [
  { value: "0", title: "None" },
  { value: "9", title: "!  Low" },
  { value: "5", title: "!!  Medium" },
  { value: "1", title: "!!!  High" },
];

export default function AddReminderView() {
  const [rawText, setRawText] = useState("");
  const { data: lists = [] } = useCachedPromise(getReminderLists);

  // All form-field values are derived from rawText — single source of truth.
  const parsed = parseInput(rawText);

  function applyChange(patch: Partial<typeof parsed>) {
    setRawText(reconstructInput({ ...parsed, ...patch }));
  }

  async function handleSubmit() {
    if (!parsed.title.trim()) {
      await showToast({ style: Toast.Style.Failure, title: "Task title cannot be empty" });
      return;
    }
    await addReminder(parsed);
    await showHUD(`Added: ${parsed.title}`);
    await popToRoot();
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Add to Reminders" onSubmit={handleSubmit} />
        </ActionPanel>
      }
    >
      {/* Top: free-text input; prefixes are parsed in real time */}
      <Form.TextArea
        id="raw"
        title="Task"
        placeholder="!! @tomorrow /List Task title"
        value={rawText}
        onChange={setRawText}
      />

      <Form.Separator />

      {/* Bottom: interactive parsed fields — editing any field rewrites the text above */}
      <Form.Dropdown
        id="priority"
        title="Priority"
        value={String(parsed.priority)}
        onChange={(val) => applyChange({ priority: Number(val) as ReminderPriority })}
      >
        {PRIORITY_OPTIONS.map((opt) => (
          <Form.Dropdown.Item key={opt.value} value={opt.value} title={opt.title} />
        ))}
      </Form.Dropdown>

      <Form.Dropdown
        id="list"
        title="List"
        value={parsed.list ?? ""}
        onChange={(val) => applyChange({ list: val || null })}
      >
        <Form.Dropdown.Item value="" title="Default List" />
        {lists.map((l) => (
          <Form.Dropdown.Item key={l} value={l} title={l} />
        ))}
      </Form.Dropdown>

      <Form.DatePicker
        id="dueDate"
        title="Due Date"
        value={parsed.dueDate}
        onChange={(date) =>
          applyChange({
            dueDate: date,
            dueDateHasTime: date ? date.getHours() !== 0 || date.getMinutes() !== 0 : false,
          })
        }
      />
    </Form>
  );
}
