import Link from "next/link";
import type { Note } from "@/types/database";
import { NoteContentRenderer } from "@/components/notes/NoteContentRenderer";

export function NoteCard({ note }: { note: Note }) {
  const formattedDate = note.updatedAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Link
      href={`/notes/${note.id}`}
      className="group relative flex flex-col justify-between rounded-xl border border-[var(--color-line)] bg-[var(--color-surface)] p-5 shadow-2xs transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--color-muted)] hover:shadow-md"
    >
      <div>
        <div className="flex items-start justify-between gap-3">
          <h3 className="display text-lg font-medium leading-snug text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-moss)]">
            {note.title}
          </h3>
          {note.isPinned && (
            <span
              aria-label="Pinned note"
              title="Pinned"
              className="mt-1 flex h-2 w-2 shrink-0 rounded-full bg-[var(--color-amber)] ring-4 ring-amber-50"
            />
          )}
        </div>

        <div className="mt-2.5 line-clamp-3 text-sm text-[var(--color-muted)] leading-relaxed">
          <NoteContentRenderer content={note.content} truncate={true} interactiveLinks={false} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-[var(--color-line)]/60 pt-3 text-xs text-[var(--color-muted)]">
        <time dateTime={note.updatedAt.toISOString()}>{formattedDate}</time>
        <span className="opacity-0 transition-opacity group-hover:opacity-100 font-medium text-[var(--color-moss)]">
          Read note →
        </span>
      </div>
    </Link>
  );
}
