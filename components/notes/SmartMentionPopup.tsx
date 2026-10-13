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
      insertValue: "@todo ",
    },
    {
      id: "tag-important",
      category: "tag",
      label: "@important",
      sublabel: "High priority marker",
      icon: "⚡",
      insertValue: "@important ",
    },
    {
      id: "tag-idea",
      category: "tag",
      label: "@idea",
      sublabel: "Brainstorm or insight",
      icon: "💡",
      insertValue: "@idea ",
    },
    {
      id: "tag-followup",
      category: "tag",
      label: "@follow-up",
      sublabel: "Needs checking later",
      icon: "🔁",
      insertValue: "@follow-up ",
    },
  ];

  // Add notes references
  notes.forEach((note) => {
    items.push({
      id: `note-${note.id}`,
      category: "note",
      label: note.title,
      sublabel: "Reference note",
      icon: "📝",
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
      className="absolute z-50 max-h-72 w-80 overflow-y-auto rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-1.5 shadow-xl ring-1 ring-black/5"
    >
      <div className="px-2.5 py-1 text-[11px] font-semibold tracking-wider text-[var(--color-muted)] uppercase">
        Smart Commands & References
      </div>

      <div className="space-y-0.5">
        {filteredItems.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          return (
            <button
              key={item.id}
              type="button"
              data-selected={isSelected}
              onMouseDown={(e) => {
                e.preventDefault(); // Don't steal focus from textarea
                onSelect(item);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left text-sm transition-colors ${
                isSelected
                  ? "bg-[var(--color-paper)] text-[var(--color-ink)]"
                  : "text-[var(--color-ink)] hover:bg-[var(--color-paper)]"
              }`}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-[var(--color-surface)] text-sm shadow-2xs">
                {item.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{item.label}</p>
                {item.sublabel && (
                  <p className="truncate text-xs text-[var(--color-muted)]">{item.sublabel}</p>
                )}
              </div>
              {isSelected && (
                <span className="text-[11px] font-medium text-[var(--color-muted)]">↵ select</span>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-1.5 border-t border-[var(--color-line)] px-2.5 pt-1.5 text-[10px] text-[var(--color-muted)]">
        Use <kbd className="rounded border px-1">↑</kbd> <kbd className="rounded border px-1">↓</kbd> to navigate, <kbd className="rounded border px-1">Enter</kbd> to insert
      </div>
    </div>
  );
}
