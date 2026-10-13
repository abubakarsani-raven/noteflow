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
              className="group/link inline-flex items-center gap-1.5 rounded-md border border-[#cadad3] bg-[#edf4f1] px-2 py-0.5 font-serif text-[14px] italic font-medium text-[var(--color-moss)] shadow-2xs transition-all hover:border-[var(--color-moss)] hover:bg-[var(--color-moss)] hover:text-white hover:shadow-xs"
            >
              <span className="not-italic text-[11px] opacity-75">§</span>
              <span>{title}</span>
            </Link>
          );
        }

        // 2. Date or Time tokens
        if (
          part.startsWith("@") &&
          (part.includes(",") || part.includes(":") || part.includes("-") && part.length === 11)
        ) {
          const isTime = part.includes(":");
          return (
            <span
              key={index}
              className="inline-flex items-center gap-1 rounded-md border border-[#dfe5eb] bg-[#f1f4f8] px-2 py-0.5 font-mono text-[12px] font-semibold tracking-tight text-[#3b4754] shadow-2xs"
            >
              <span className="text-[10px] opacity-70">{isTime ? "⏰" : "📅"}</span>
              <span>{part.slice(1)}</span>
            </span>
          );
        }

        // 3. Priority / Action tokens
        const lower = part.toLowerCase();

        if (lower === "@important" || lower === "@urgent" || lower === "@priority") {
          return (
            <span
              key={index}
              className="inline-flex items-center gap-1 rounded-md border border-[#f5dfb8] bg-[#fdf6ec] px-2 py-0.5 font-mono text-[12px] font-semibold tracking-tight text-[#8c5208] shadow-2xs"
            >
              <span className="text-[11px]">⚡</span>
              <span>{part.slice(1)}</span>
            </span>
          );
        }

        if (lower === "@todo" || lower === "@task") {
          return (
            <span
              key={index}
              className="inline-flex items-center gap-1 rounded-md border border-[#cbe5dc] bg-[#edf6f3] px-2 py-0.5 font-mono text-[12px] font-semibold tracking-tight text-[#235849] shadow-2xs"
            >
              <span className="text-[11px]">📌</span>
              <span>{part.slice(1)}</span>
            </span>
          );
        }

        if (lower === "@idea" || lower === "@insight") {
          return (
            <span
              key={index}
              className="inline-flex items-center gap-1 rounded-md border border-[#d2def0] bg-[#f0f4fa] px-2 py-0.5 font-mono text-[12px] font-semibold tracking-tight text-[#2b4c7e] shadow-2xs"
            >
              <span className="text-[11px]">💡</span>
              <span>{part.slice(1)}</span>
            </span>
          );
        }

        if (lower === "@follow-up" || lower === "@later") {
          return (
            <span
              key={index}
              className="inline-flex items-center gap-1 rounded-md border border-[#e1d5ec] bg-[#f7f3fa] px-2 py-0.5 font-mono text-[12px] font-semibold tracking-tight text-[#5e3880] shadow-2xs"
            >
              <span className="text-[11px]">🔁</span>
              <span>{part.slice(1)}</span>
            </span>
          );
        }

        // 4. Any other @mention / @tag
        if (part.startsWith("@") && part.length > 1) {
          return (
            <span
              key={index}
              className="inline-flex items-center gap-1 rounded-md border border-[#dfe3e8] bg-[#f5f6f8] px-2 py-0.5 font-mono text-[12px] font-semibold tracking-tight text-[var(--color-ink)] shadow-2xs"
            >
              <span className="text-[11px] text-[var(--color-moss)]">@</span>
              <span>{part.slice(1)}</span>
            </span>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}
