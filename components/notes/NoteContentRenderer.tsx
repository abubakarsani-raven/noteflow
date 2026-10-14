import Link from "next/link";
import React from "react";

type NoteContentRendererProps = {
  content: string;
  className?: string;
  truncate?: boolean;
};

export function NoteContentRenderer({
  content,
  className = "",
  truncate = false,
}: NoteContentRendererProps) {
  const displayContent = truncate && content.length > 180 ? `${content.slice(0, 180)}…` : content;

  // Pattern matches:
  // 1. [[Note Title]] -> Note cross-references
  // 2. @Date / Time patterns: e.g. @Oct 13, 2026 or @7:29 AM or @2026-10-13
  // 3. Any @tag or @mention: e.g. @todo, @important, @idea, @follow-up, @project, @user
  const regex = /(\[\[[^\]]+\]\]|@[A-Z][a-z]{2}\s\d{1,2},\s\d{4}|@\d{1,2}:\d{2}\s(?:AM|PM)|@\d{4}-\d{2}-\d{2}|@[a-zA-Z0-9_-]+)/g;

  const parts = displayContent.split(regex);

  return (
    <div className={`leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        // 1. Note cross-reference: [[Note Title]]
        if (part.startsWith("[[") && part.endsWith("]]")) {
          const title = part.slice(2, -2).trim();
          return (
            <Link
              key={index}
              href={`/dashboard?q=${encodeURIComponent(title)}`}
              className="rounded-xs bg-[#e9f2ee] px-1.5 py-0.5 font-serif text-[0.95em] italic font-medium text-[var(--color-moss)] transition-colors hover:underline hover:bg-[#dcebe5]"
            >
              [[{title}]]
            </Link>
          );
        }

        // 2. Date or Time tokens
        if (
          part.startsWith("@") &&
          (part.includes(",") || part.includes(":") || (part.includes("-") && part.length === 11))
        ) {
          return (
            <mark
              key={index}
              className="rounded-xs bg-[#f2ede4] px-1.5 py-0.5 font-mono text-[0.9em] font-medium tracking-tight text-[#473e34] select-text"
            >
              {part}
            </mark>
          );
        }

        // 3. Priority / Action / Category tokens
        const lower = part.toLowerCase();

        if (lower === "@important" || lower === "@urgent" || lower === "@priority") {
          return (
            <mark
              key={index}
              className="rounded-xs bg-[#fdf0d8] px-1.5 py-0.5 font-mono text-[0.9em] font-medium tracking-tight text-[#8c5208] select-text"
            >
              {part}
            </mark>
          );
        }

        if (lower === "@todo" || lower === "@task") {
          return (
            <mark
              key={index}
              className="rounded-xs bg-[#e5f4ee] px-1.5 py-0.5 font-mono text-[0.9em] font-medium tracking-tight text-[#1e5847] select-text"
            >
              {part}
            </mark>
          );
        }

        if (lower === "@idea" || lower === "@insight") {
          return (
            <mark
              key={index}
              className="rounded-xs bg-[#e8eef8] px-1.5 py-0.5 font-mono text-[0.9em] font-medium tracking-tight text-[#244b7d] select-text"
            >
              {part}
            </mark>
          );
        }

        if (lower === "@follow-up" || lower === "@later") {
          return (
            <mark
              key={index}
              className="rounded-xs bg-[#f1ebf7] px-1.5 py-0.5 font-mono text-[0.9em] font-medium tracking-tight text-[#573677] select-text"
            >
              {part}
            </mark>
          );
        }

        // 4. Any other @mention / @tag
        if (part.startsWith("@") && part.length > 1) {
          return (
            <mark
              key={index}
              className="rounded-xs bg-[#edeae4] px-1.5 py-0.5 font-mono text-[0.9em] font-medium tracking-tight text-[var(--color-ink)] select-text"
            >
              {part}
            </mark>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}
