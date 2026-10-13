import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getNote } from "@/lib/notes";
import { NotAuthorizedError, NotFoundError } from "@/lib/errors";
import { NoteActions } from "@/components/notes/NoteActions";
import { NoteContentRenderer } from "@/components/notes/NoteContentRenderer";

export default async function NotePage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;

  let note;
  try {
    note = await getNote(user.id, id);
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof NotAuthorizedError) {
      notFound();
    }
    throw error;
  }

  const formattedDate = note.updatedAt.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

  return (
    <article className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
        >
          ← All notes
        </Link>
        <NoteActions noteId={note.id} isPinned={note.isPinned} />
      </div>

      <header className="mt-6 border-b border-[var(--color-line)] pb-5">
        <div className="flex items-center gap-3">
          <h1 className="display text-3xl font-medium tracking-tight text-[var(--color-ink)]">
            {note.title}
          </h1>
          {note.isPinned && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-[var(--color-amber)] border border-amber-200">
              📌 Pinned
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-[var(--color-muted)]">Updated {formattedDate}</p>
      </header>

      <div className="mt-6 text-[17px] leading-relaxed whitespace-pre-wrap text-[var(--color-ink)]">
        <NoteContentRenderer content={note.content} />
      </div>
    </article>
  );
}
