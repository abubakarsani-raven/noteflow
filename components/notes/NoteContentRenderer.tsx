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

  // Regex to match:
  // 1. [[Note Title]] -> Note references
  // 2. @(date or time like @Oct 13, 2026 or @07:22 AM or @todo or @important or @idea)
  const regex = /(\[\[[^\]]+\]\]|@(important|todo|idea|follow-up|goal|[A-Z][a-z]{2}\s\d{1,2},\s\d{4}|\d{1,2}:\d{2}\s(?:AM|PM))\b)/g;

  const parts = displayContent.split(regex);

  return (
    <div className={`leading-relaxed ${className}`}>
      {parts.map((part, index) => {
        if (!part) return null;

        // Note reference [[Title]]
        if (part.startsWith("[[") && part.endsWith("]]")) {
          const title = part.slice(2, -2).trim();
          return (
            <Link
              key={index}
              href={`/dashboard?q=${encodeURIComponent(title)}`}
              className="inline-flex items-center gap-1 rounded-md bg-[var(--color-paper)] px-1.5 py-0.5 font-medium text-[var(--color-moss)] border border-[var(--color-line)] text-xs transition-colors hover:bg-[var(--color-moss)] hover:text-white"
            >
              <span>📝</span>
              <span>{title}</span>
            </Link>
          );
        }

        // Smart Tags
        if (part === "@important") {
          return (
            <span
              key={index}
              className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-medium text-[var(--color-amber)] border border-amber-200"
            >
              ⚡ important
            </span>
          );
        }

        if (part === "@todo") {
          return (
            <span
              key={index}
              className="inline-flex items-center gap-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-xs font-medium text-[var(--color-moss)] border border-emerald-200"
            >
              📌 todo
            </span>
          );
        }

        if (part === "@idea") {
          return (
            <span
              key={index}
              className="inline-flex items-center gap-0.5 rounded-md bg-blue-50 px-1.5 py-0.5 text-xs font-medium text-blue-700 border border-blue-200"
            >
              💡 idea
            </span>
          );
        }

        if (part === "@follow-up") {
          return (
            <span
              key={index}
              className="inline-flex items-center gap-0.5 rounded-md bg-purple-50 px-1.5 py-0.5 text-xs font-medium text-purple-700 border border-purple-200"
            >
              🔁 follow-up
            </span>
          );
        }

        // Date / Time mention (starts with @)
        if (part.startsWith("@") && (part.includes(",") || part.includes(":"))) {
          const isTime = part.includes(":");
          return (
            <span
              key={index}
              className="inline-flex items-center gap-1 rounded-md bg-[var(--color-paper)] px-1.5 py-0.5 text-xs font-medium text-[var(--color-muted)] border border-[var(--color-line)]"
            >
              <span>{isTime ? "⏰" : "📅"}</span>
              <span>{part.slice(1)}</span>
            </span>
          );
        }

        return <span key={index}>{part}</span>;
      })}
    </div>
  );
}
