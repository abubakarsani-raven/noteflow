"use client";

import { useEffect, useRef } from "react";

export type MentionItem = {
  id: string;
  category: "date" | "note" | "tag";
  label: string;
  sublabel?: string;
  icon: string;
  insertValue: string;
};

type SmartMentionPopupProps = {
  query: string;
  availableNotes: { id: string; title: string }[];
  selectedIndex: number;
  onSelect: (item: MentionItem) => void;
  onClose: () => void;
  position: { top: number; left: number };
};

export function getMentionItems(notes: { id: string; title: string }[]): MentionItem[] {
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });

  const items: MentionItem[] = [
    {
      id: "date-today",
      category: "date",
      label: "Today's Date",
      sublabel: formatDate(today),
      icon: "📅",
      insertValue: `@${formatDate(today)}`,
    },
    {
      id: "date-time",
      category: "date",
      label: "Current Time",
      sublabel: formatTime(today),
      icon: "⏰",
      insertValue: `@${formatTime(today)}`,
    },
    {
      id: "date-tomorrow",
      category: "date",
      label: "Tomorrow's Date",
      sublabel: formatDate(tomorrow),
      icon: "🗓️",
      insertValue: `@${formatDate(tomorrow)}`,
    },
    {
      id: "date-yesterday",
      category: "date",
      label: "Yesterday's Date",
      sublabel: formatDate(yesterday),
      icon: "📆",
      insertValue: `@${formatDate(yesterday)}`,
    },
    {
      id: "tag-todo",
      category: "tag",
      label: "@todo",
      sublabel: "Action item",
      icon: "📌",
      insertValue: "@todo",
    },
    {
      id: "tag-important",
      category: "tag",
      label: "@important",
      sublabel: "High priority marker",
      icon: "⚡",
      insertValue: "@important",
    },
    {
      id: "tag-idea",
      category: "tag",
      label: "@idea",
      sublabel: "Brainstorm or insight",
      icon: "💡",
      insertValue: "@idea",
    },
    {
      id: "tag-followup",
      category: "tag",
      label: "@follow-up",
      sublabel: "Needs checking later",
      icon: "🔁",
      insertValue: "@follow-up",
    },
  ];

  // Add notes references
  notes.forEach((note) => {
    items.push({
      id: `note-${note.id}`,
      category: "note",
      label: note.title,
      sublabel: "Reference note",
      icon: "§",
      insertValue: `[[${note.title}]]`,
    });
  });

  return items;
}

export function SmartMentionPopup({
  query,
  availableNotes,
  selectedIndex,
  onSelect,
  position,
}: SmartMentionPopupProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const allItems = getMentionItems(availableNotes);
  const q = query.toLowerCase().trim();

  const filteredItems = allItems.filter(
    (item) =>
      item.label.toLowerCase().includes(q) ||
      (item.sublabel && item.sublabel.toLowerCase().includes(q))
  );

  useEffect(() => {
    if (containerRef.current) {
      const activeElement = containerRef.current.querySelector('[data-selected="true"]');
      if (activeElement) {
        activeElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (filteredItems.length === 0) {
    return (
      <div
        ref={containerRef}
        style={{ top: `${position.top}px`, left: `${position.left}px` }}
        className="absolute z-50 w-72 rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-3 text-xs text-[var(--color-muted)] shadow-xl ring-1 ring-black/5"
      >
        No matching dates, tags, or notes found for &ldquo;{query}&rdquo;
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
      className="absolute z-50 max-h-76 w-84 overflow-y-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-1.5 shadow-xl ring-1 ring-black/5"
    >
      <div className="flex items-center justify-between px-2.5 py-1 text-[11px] font-semibold tracking-wider text-[var(--color-muted)] uppercase">
        <span>Smart Commands</span>
        <span className="font-mono text-[10px] text-[var(--color-moss)]">special tokens</span>
      </div>

      <div className="space-y-1">
        {filteredItems.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          const isNote = item.category === "note";
          const isDate = item.category === "date";

          return (
            <button
              key={item.id}
              type="button"
              data-selected={isSelected}
              onMouseDown={(e) => {
                e.preventDefault(); // Don't steal focus from textarea
                onSelect(item);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left transition-all ${
                isSelected
                  ? "bg-[var(--color-paper)] ring-1 ring-[var(--color-line)]"
                  : "hover:bg-[var(--color-paper)]"
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-surface)] text-sm shadow-2xs border border-[var(--color-line)]/50">
                {item.icon}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p
                    className={`truncate text-sm font-medium ${
                      isNote
                        ? "font-serif italic text-[var(--color-moss)]"
                        : item.label.startsWith("@")
                        ? "font-mono text-[13px] font-semibold text-[var(--color-ink)]"
                        : "text-[var(--color-ink)]"
                    }`}
                  >
                    {item.label}
                  </p>
                </div>
                {item.sublabel && (
                  <p className="truncate text-xs text-[var(--color-muted)] font-sans">
                    {item.sublabel}
                  </p>
                )}
              </div>

              {/* Token Pill Preview */}
              <div className="shrink-0 text-right">
                <span
                  className={`inline-block rounded-md px-1.5 py-0.5 text-[11px] ${
                    isNote
                      ? "font-serif italic bg-[#edf4f1] text-[var(--color-moss)] border border-[#cadad3]"
                      : isDate
                      ? "font-mono bg-[#f1f4f8] text-[#3b4754] border border-[#dfe5eb]"
                      : "font-mono bg-[#fdf6ec] text-[#8c5208] border border-[#f5dfb8]"
                  }`}
                >
                  {item.insertValue}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-1.5 border-t border-[var(--color-line)] px-2.5 pt-1.5 text-[10px] text-[var(--color-muted)] flex items-center justify-between">
        <span>
          <kbd className="rounded border px-1">↑</kbd> <kbd className="rounded border px-1">↓</kbd> navigate
        </span>
        <span>
          <kbd className="rounded border px-1">Enter</kbd> insert
        </span>
      </div>
    </div>
  );
}
