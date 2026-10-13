import { requireUser } from "@/lib/session";
import { listNotes } from "@/lib/notes";
import { NoteForm } from "@/components/notes/NoteForm";

export default async function NewNotePage() {
  const user = await requireUser();
  const notes = await listNotes(user.id);
  const availableNotes = notes.map((n) => ({ id: n.id, title: n.title }));

  return (
    <>
      <h1 className="display text-2xl font-medium tracking-tight">New note</h1>
      <NoteForm mode="create" availableNotes={availableNotes} />
    </>
  );
}
