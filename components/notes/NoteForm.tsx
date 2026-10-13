"use client";

import Link from "next/link";
import { useActionState, useState, useRef } from "react";
import { createNoteAction, updateNoteAction } from "@/lib/actions/note-actions";
import { FieldError } from "@/components/FieldError";
import { SubmitButton } from "@/components/ui/SubmitButton";
import {
  SmartMentionPopup,
  getMentionItems,
  type MentionItem,
} from "@/components/notes/SmartMentionPopup";
import type { ActionState } from "@/lib/errors";

const initial: ActionState = { ok: false };
const MAX_TITLE = 120;

type Props = {
  mode: "create" | "edit";
  noteId?: string;
  defaultTitle?: string;
  defaultContent?: string;
  availableNotes?: { id: string; title: string }[];
};

export function NoteForm({
  mode,
  noteId,
  defaultTitle = "",
  defaultContent = "",
  availableNotes = [],
}: Props) {
  const action =
    mode === "edit" && noteId ? updateNoteAction.bind(null, noteId) : createNoteAction;
  const [state, formAction] = useActionState(action, initial);

  const [title, setTitle] = useState(defaultTitle);
  const [content, setContent] = useState(defaultContent);

  // Smart @ mention state
  const [mentionState, setMentionState] = useState<{
    isOpen: boolean;
    query: string;
    startIndex: number;
    selectedIndex: number;
  }>({
    isOpen: false,
    query: "",
    startIndex: -1,
    selectedIndex: 0,
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newContent = e.target.value;
    const cursorPos = e.target.selectionStart;
    setContent(newContent);

    // Look backwards from cursor for an unclosed '@'
    const textBeforeCursor = newContent.slice(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");

    if (lastAtPos !== -1) {
      // Ensure there are no spaces or linebreaks between @ and cursor (or allow short query)
      const queryText = textBeforeCursor.slice(lastAtPos + 1);
      const prevChar = lastAtPos > 0 ? textBeforeCursor[lastAtPos - 1] : " ";

      // Only trigger if @ is at start of line or preceded by whitespace
      if ((prevChar === " " || prevChar === "\n") && !queryText.includes("\n")) {
        setMentionState({
          isOpen: true,
          query: queryText,
          startIndex: lastAtPos,
          selectedIndex: 0,
        });
        return;
      }
    }

    if (mentionState.isOpen) {
      setMentionState((prev) => ({ ...prev, isOpen: false }));
    }
  }

  function insertMention(item: MentionItem) {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const beforeAt = content.slice(0, mentionState.startIndex);
    const afterCursor = content.slice(cursorPos);

    const replacement = `${item.insertValue} `;
    const updatedContent = `${beforeAt}${replacement}${afterCursor}`;

    setContent(updatedContent);
    setMentionState((prev) => ({ ...prev, isOpen: false }));

    // Reset cursor position right after inserted mention
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = beforeAt.length + replacement.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (!mentionState.isOpen) return;

    const allItems = getMentionItems(availableNotes);
    const q = mentionState.query.toLowerCase().trim();
    const filtered = allItems.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        (item.sublabel && item.sublabel.toLowerCase().includes(q))
    );

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setMentionState((prev) => ({
        ...prev,
        selectedIndex: (prev.selectedIndex + 1) % Math.max(1, filtered.length),
      }));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setMentionState((prev) => ({
        ...prev,
        selectedIndex:
          (prev.selectedIndex - 1 + Math.max(1, filtered.length)) % Math.max(1, filtered.length),
      }));
    } else if (e.key === "Enter" || e.key === "Tab") {
      if (filtered.length > 0) {
        e.preventDefault();
        insertMention(filtered[mentionState.selectedIndex] || filtered[0]);
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      setMentionState((prev) => ({ ...prev, isOpen: false }));
    }
  }

  // Quick action shortcut pills
  function insertShortcut(text: string) {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const cursorPos = textarea.selectionStart;
    const before = content.slice(0, cursorPos);
    const after = content.slice(cursorPos);
    const insertText = `${text} `;
    const updated = `${before}${insertText}${after}`;

    setContent(updated);
    setTimeout(() => {
      textarea.focus();
      const newPos = cursorPos + insertText.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  }

  return (
    <form action={formAction} className="mt-6 max-w-2xl space-y-6">
      {/* Title */}
      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="title" className="text-sm font-medium text-[var(--color-ink)]">
            Title
          </label>
          <span className="text-xs text-[var(--color-muted)]">
            {title.length}/{MAX_TITLE}
          </span>
        </div>
        <input
          id="title"
          name="title"
          value={title}
          maxLength={MAX_TITLE}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled note…"
          className="mt-1.5 w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-2.5 text-base shadow-2xs transition-colors focus:border-[var(--color-moss)]"
        />
        <FieldError messages={state.fieldErrors?.title} />
      </div>

      {/* Content */}
      <div className="relative" ref={containerRef}>
        <div className="flex items-center justify-between">
          <label htmlFor="content" className="text-sm font-medium text-[var(--color-ink)]">
            Content
          </label>
          <span className="text-xs text-[var(--color-muted)]">
            Type <span className="font-semibold text-[var(--color-moss)]">@</span> for smart dates, tags & references
          </span>
        </div>

        {/* Quick shortcut pills */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-muted)]">
          <span className="text-[11px] font-medium">Quick insert:</span>
          <button
            type="button"
            onClick={() =>
              insertShortcut(
                `@${new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}`
              )
            }
            className="inline-flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-0.5 text-xs transition-colors hover:border-[var(--color-moss)] hover:text-[var(--color-ink)]"
          >
            📅 Today
          </button>
          <button
            type="button"
            onClick={() =>
              insertShortcut(
                `@${new Date().toLocaleTimeString("en-US", {
                  hour: "numeric",
                  minute: "2-digit",
                  hour12: true,
                })}`
              )
            }
            className="inline-flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-0.5 text-xs transition-colors hover:border-[var(--color-moss)] hover:text-[var(--color-ink)]"
          >
            ⏰ Time
          </button>
          <button
            type="button"
            onClick={() => insertShortcut("@todo")}
            className="inline-flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-0.5 text-xs transition-colors hover:border-[var(--color-moss)] hover:text-[var(--color-ink)]"
          >
            📌 @todo
          </button>
          <button
            type="button"
            onClick={() => insertShortcut("@important")}
            className="inline-flex items-center gap-1 rounded-md border border-[var(--color-line)] bg-[var(--color-surface)] px-2 py-0.5 text-xs transition-colors hover:border-[var(--color-moss)] hover:text-[var(--color-ink)]"
          >
            ⚡ @important
          </button>
        </div>

        <div className="relative mt-2">
          <textarea
            ref={textareaRef}
            id="content"
            name="content"
            rows={14}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            placeholder="Write your note here... (Tip: type @ to reference dates, tags, or other notes)"
            className="w-full rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] px-3.5 py-3 text-[15px] leading-relaxed shadow-2xs transition-colors focus:border-[var(--color-moss)]"
          />

          {/* Smart @ Mention Popup */}
          {mentionState.isOpen && (
            <SmartMentionPopup
              query={mentionState.query}
              availableNotes={availableNotes}
              selectedIndex={mentionState.selectedIndex}
              onSelect={insertMention}
              onClose={() => setMentionState((prev) => ({ ...prev, isOpen: false }))}
              position={{ top: 30, left: 20 }}
            />
          )}
        </div>
        <FieldError messages={state.fieldErrors?.content} />
      </div>

      {state.message && (
        <p role="alert" className="text-sm text-[var(--color-alert)]">
          {state.message}
        </p>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3 pt-2">
        <SubmitButton pendingLabel="Saving note…">Save note</SubmitButton>
        <Link
          href={mode === "edit" && noteId ? `/notes/${noteId}` : "/dashboard"}
          className="rounded-lg px-3 py-2 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
