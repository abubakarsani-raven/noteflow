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
import { NoteContentRenderer } from "@/components/notes/NoteContentRenderer";
import { getCaretCoordinates } from "@/lib/caret";
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
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Smart @ mention state
  const [mentionState, setMentionState] = useState<{
    isOpen: boolean;
    query: string;
    startIndex: number;
    selectedIndex: number;
    position: { top: number; left: number };
  }>({
    isOpen: false,
    query: "",
    startIndex: -1,
    selectedIndex: 0,
    position: { top: 40, left: 20 },
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  function updateMentionPosition(textarea: HTMLTextAreaElement, atIndex: number) {
    const coords = getCaretCoordinates(textarea, atIndex);
    // Position menu directly underneath the cursor with padding
    const top = Math.min(coords.top + coords.height + 6, textarea.clientHeight - 40);
    const left = Math.max(10, Math.min(coords.left, textarea.clientWidth - 330));
    return { top, left };
  }

  function handleContentChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const newContent = e.target.value;
    const cursorPos = e.target.selectionStart;
    setContent(newContent);

    // Look backwards from cursor for an unclosed '@'
    const textBeforeCursor = newContent.slice(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf("@");

    if (lastAtPos !== -1) {
      const queryText = textBeforeCursor.slice(lastAtPos + 1);
      const prevChar = lastAtPos > 0 ? textBeforeCursor[lastAtPos - 1] : " ";

      if ((prevChar === " " || prevChar === "\n") && !queryText.includes("\n")) {
        const position = updateMentionPosition(e.target, lastAtPos);
        setMentionState({
          isOpen: true,
          query: queryText,
          startIndex: lastAtPos,
          selectedIndex: 0,
          position,
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
        (item.sublabel && item.sublabel.toLowerCase().includes(q)) ||
        item.insertValue.toLowerCase().includes(q)
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

  const hasSpecialTokens = content.includes("@") || content.includes("[[");

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
          className="mt-1.5 w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-2.5 text-base shadow-2xs transition-colors focus:border-[var(--color-moss)]"
        />
        <FieldError messages={state.fieldErrors?.title} />
      </div>

      {/* Content Section with Tabs */}
      <div className="relative" ref={containerRef}>
        <div className="flex items-center justify-between pb-1">
          <label htmlFor="content" className="text-sm font-medium text-[var(--color-ink)]">
            Content
          </label>

          {/* Clean Segmented Tab Control without emojis */}
          <div className="inline-flex rounded-lg border border-[var(--color-line)] bg-[var(--color-paper)] p-0.5 text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveTab("edit")}
              className={`rounded-md px-3 py-1 transition-all ${
                activeTab === "edit"
                  ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-2xs"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              Write
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`rounded-md px-3 py-1 transition-all ${
                activeTab === "preview"
                  ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-2xs"
                  : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              }`}
            >
              Preview
            </button>
          </div>
        </div>

        {/* Quick Helper Toolbar without emojis */}
        {activeTab === "edit" && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-[var(--color-muted)]">
            <span className="text-[11px] font-medium">Insert:</span>
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
              className="inline-flex items-center rounded-md bg-[#f2ede4] px-2 py-0.5 font-mono text-[11px] font-medium text-[#473e34] transition-all hover:bg-[#e8e2d7]"
            >
              Date
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
              className="inline-flex items-center rounded-md bg-[#f2ede4] px-2 py-0.5 font-mono text-[11px] font-medium text-[#473e34] transition-all hover:bg-[#e8e2d7]"
            >
              Time
            </button>
            <button
              type="button"
              onClick={() => insertShortcut("@todo")}
              className="inline-flex items-center rounded-md bg-[#e5f4ee] px-2 py-0.5 font-mono text-[11px] font-medium text-[#1e5847] transition-all hover:bg-[#d6ece4]"
            >
              @todo
            </button>
            <button
              type="button"
              onClick={() => insertShortcut("@important")}
              className="inline-flex items-center rounded-md bg-[#fdf0d8] px-2 py-0.5 font-mono text-[11px] font-medium text-[#8c5208] transition-all hover:bg-[#f8e5c2]"
            >
              @important
            </button>
            <button
              type="button"
              onClick={() => insertShortcut("@idea")}
              className="inline-flex items-center rounded-md bg-[#e8eef8] px-2 py-0.5 font-mono text-[11px] font-medium text-[#244b7d] transition-all hover:bg-[#dbe5f3]"
            >
              @idea
            </button>
          </div>
        )}

        <div className="relative mt-2">
          {activeTab === "edit" ? (
            <>
              <textarea
                ref={textareaRef}
                id="content"
                name="content"
                rows={13}
                value={content}
                onChange={handleContentChange}
                onKeyDown={handleKeyDown}
                placeholder="Write your note here… (Type @ to open reference menu, or [[ to reference notes)"
                className="w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] px-4 py-3 text-[15px] leading-relaxed shadow-2xs transition-colors focus:border-[var(--color-moss)]"
              />

              {/* Floating Smart @ Mention Popup directly positioned at caret */}
              {mentionState.isOpen && (
                <SmartMentionPopup
                  query={mentionState.query}
                  availableNotes={availableNotes}
                  selectedIndex={mentionState.selectedIndex}
                  onSelect={insertMention}
                  onClose={() => setMentionState((prev) => ({ ...prev, isOpen: false }))}
                  position={mentionState.position}
                />
              )}
            </>
          ) : (
            /* Formatted Preview Mode */
            <div className="min-h-[340px] w-full rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 text-[15px] leading-relaxed shadow-2xs">
              {content.trim() ? (
                <NoteContentRenderer content={content} />
              ) : (
                <p className="italic text-[var(--color-muted)]">No content to preview yet.</p>
              )}
              {/* Keep hidden input for form submission when in preview tab */}
              <input type="hidden" name="content" value={content} />
            </div>
          )}
        </div>

        {/* Live Highlight Strip in edit mode if tokens are present */}
        {activeTab === "edit" && hasSpecialTokens && (
          <div className="mt-2.5 rounded-lg border border-[var(--color-line)] bg-[var(--color-surface)] p-3">
            <div className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-[var(--color-muted)] uppercase tracking-wider">
              <span>Highlighted Text Preview</span>
              <span className="font-mono text-[10px] text-[var(--color-moss)]">formatted</span>
            </div>
            <NoteContentRenderer
              content={content}
              className="text-sm text-[var(--color-ink)] line-clamp-3"
            />
          </div>
        )}

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
