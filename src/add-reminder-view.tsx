import { List, ActionPanel, Action, showHUD, showToast, Toast, Color, Icon, useNavigation } from "@raycast/api";
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

function formatDate(date: Date | null, hasTime: boolean): string {
  if (!date) return "—";
  const y = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  if (!hasTime) return `${y}-${mo}-${d}`;
  return `${y}-${mo}-${d} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export default function AddReminderView() {
  const [text, setText] = useState("");
  const { pop } = useNavigation();
  const { data: lists = [] } = useCachedPromise(getReminderLists);

  const parsed = parseInput(text);

  // Detect a partial /xxx token at the END of the input (user still typing the list name).
  // Only activate when the parser also sees a list prefix (parsed.list matches),
  // or when the user just typed "/" with nothing after it yet.
  const partialListMatch = text.match(/(\/\S*)$/);
  const partialListToken = partialListMatch ? partialListMatch[1] : null;
  const listQuery = partialListToken ? partialListToken.slice(1).toLowerCase() : null;

  const showListSuggestions =
    partialListToken !== null &&
    (partialListToken === "/" || (parsed.list !== null && parsed.list === partialListToken.slice(1)));

  const listSuggestions = showListSuggestions
    ? lists.filter(
        (l) => l.toLowerCase().startsWith(listQuery ?? "") && l.toLowerCase() !== (listQuery ?? ""),
      )
    : [];

  function completeList(listName: string) {
    setText(text.replace(/(\/\S*)$/, `/${listName} `));
  }

  // ── Date autocomplete ────────────────────────────────────────────────────────
  const DATE_NAMED = ["today", "tomorrow"];

  const partialDateMatch = text.match(/(@\S*)$/);
  const partialDateToken = partialDateMatch ? partialDateMatch[1] : null;
  const dateQuery = partialDateToken ? partialDateToken.slice(1).toLowerCase() : null;

  const dateSuggestions =
    partialDateToken !== null
      ? DATE_NAMED.filter((d) => d.startsWith(dateQuery ?? "") && d !== dateQuery)
      : [];

  function completeDate(suggestion: string) {
    setText(text.replace(/(@\S*)$/, `@${suggestion} `));
  }

  function applyChange(patch: Partial<typeof parsed>) {
    setText(reconstructInput({ ...parsed, ...patch }));
  }

  async function handleAdd() {
    if (!parsed.title.trim()) {
      await showToast({ style: Toast.Style.Failure, title: "Task title cannot be empty" });
      return;
    }
    await addReminder(parsed);
    await showHUD(`Added: ${parsed.title}`);
    pop();
  }

  // Shared "Add" action — always accessible via ⌘↩ from any item.
  const addAction = (
    <Action
      title="Add to Reminders"
      icon={Icon.Plus}
      shortcut={{ modifiers: ["cmd"], key: "return" }}
      onAction={handleAdd}
    />
  );

  const today = new Date();
  const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

  return (
    <List
      searchText={text}
      onSearchTextChange={setText}
      filtering={false}
      searchBarPlaceholder="!! @tomorrow /List Task title"
    >
      {/* ── List autocomplete (↩ to select, replaces /xxx with /ListName) ── */}
      {listSuggestions.length > 0 && (
        <List.Section title="Complete List Name  ·  ↩ to select">
          {listSuggestions.map((l) => (
            <List.Item
              key={l}
              title={`/${l}`}
              icon={{ source: Icon.CircleFilled, tintColor: Color.Orange }}
              actions={
                <ActionPanel>
                  <Action title={`Use /${l}`} onAction={() => completeList(l)} />
                  {addAction}
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}

      {/* ── Date autocomplete (↩ to select, replaces @xxx with @today / @tomorrow) ── */}
      {dateSuggestions.length > 0 && (
        <List.Section title="Complete Date  ·  ↩ to select">
          {dateSuggestions.map((d) => (
            <List.Item
              key={d}
              title={`@${d}`}
              icon={{ source: Icon.Calendar, tintColor: Color.Blue }}
              actions={
                <ActionPanel>
                  <Action title={`Use @${d}`} onAction={() => completeDate(d)} />
                  {addAction}
                </ActionPanel>
              }
            />
          ))}
        </List.Section>
      )}

      {/* ── Parsed reminder preview (each field is editable via action panel) ── */}
      <List.Section title="Reminder Preview">
        {/* Title */}
        <List.Item
          title={parsed.title || "(enter task title above)"}
          subtitle="Title"
          icon={Icon.Text}
          actions={<ActionPanel>{addAction}</ActionPanel>}
        />

        {/* Priority */}
        <List.Item
          title={PRIORITY_OPTIONS.find((p) => p.value === String(parsed.priority))?.title ?? "None"}
          subtitle="Priority"
          icon={{ source: Icon.Flag, tintColor: parsed.priority ? Color.Red : Color.SecondaryText }}
          actions={
            <ActionPanel>
              <ActionPanel.Section title="Set Priority">
                {PRIORITY_OPTIONS.map(({ value, title }) => (
                  <Action
                    key={value}
                    title={title}
                    onAction={() => applyChange({ priority: Number(value) as ReminderPriority })}
                  />
                ))}
              </ActionPanel.Section>
              {addAction}
            </ActionPanel>
          }
        />

        {/* List */}
        <List.Item
          title={parsed.list ?? "Default List"}
          subtitle="List"
          icon={{ source: Icon.Dot, tintColor: parsed.list ? Color.Orange : Color.SecondaryText }}
          actions={
            <ActionPanel>
              <ActionPanel.Section title="Select List">
                <Action title="Default List" onAction={() => applyChange({ list: null })} />
                {lists.map((l) => (
                  <Action
                    key={l}
                    title={l}
                    icon={{ source: Icon.CircleFilled, tintColor: Color.Orange }}
                    onAction={() => applyChange({ list: l })}
                  />
                ))}
              </ActionPanel.Section>
              {addAction}
            </ActionPanel>
          }
        />

        {/* Due Date */}
        <List.Item
          title={formatDate(parsed.dueDate, parsed.dueDateHasTime)}
          subtitle="Due Date"
          icon={Icon.Calendar}
          actions={
            <ActionPanel>
              <ActionPanel.Section title="Quick Dates">
                <Action
                  title="Today"
                  onAction={() =>
                    applyChange({ dueDate: new Date(today.getFullYear(), today.getMonth(), today.getDate()), dueDateHasTime: false })
                  }
                />
                <Action
                  title="Tomorrow"
                  onAction={() => applyChange({ dueDate: tomorrow, dueDateHasTime: false })}
                />
                <Action title="Clear" onAction={() => applyChange({ dueDate: null, dueDateHasTime: false })} />
              </ActionPanel.Section>
              {addAction}
            </ActionPanel>
          }
        />
      </List.Section>
    </List>
  );
}
