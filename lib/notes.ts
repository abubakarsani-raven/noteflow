import { db } from "@/lib/firebase";
import { NotAuthorizedError, NotFoundError } from "@/lib/errors";
import type { Note } from "@/types/database";

// Every function here takes userId first. Ownership is enforced in the query,
// not in the UI — see tickets/03-authorization.

function mapDocToNote(doc: FirebaseFirestore.DocumentSnapshot): Note {
  const data = doc.data();
  if (!data) throw new NotFoundError();
  return {
    id: doc.id,
    userId: data.userId,
    title: data.title,
    content: data.content,
    isPinned: Boolean(data.isPinned),
    createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
    updatedAt: data.updatedAt?.toDate ? data.updatedAt.toDate() : new Date(data.updatedAt || Date.now()),
  };
}

export async function listNotes(userId: string, query?: string): Promise<Note[]> {
  const snapshot = await db
    .collection("notes")
    .where("userId", "==", userId)
    .orderBy("isPinned", "desc")
    .orderBy("updatedAt", "desc")
    .get();

  let notes = snapshot.docs.map(mapDocToNote);

  if (query && query.trim()) {
    const q = query.trim().toLowerCase();
    notes = notes.filter(
      (note) =>
        note.title.toLowerCase().includes(q) ||
        note.content.toLowerCase().includes(q)
    );
  }

  return notes;
}

export async function getNote(userId: string, noteId: string): Promise<Note> {
  const doc = await db.collection("notes").doc(noteId).get();
  if (!doc.exists) throw new NotFoundError();

  const data = doc.data();
  if (!data || data.userId !== userId) throw new NotAuthorizedError();

  return mapDocToNote(doc);
}

export async function createNote(
  userId: string,
  data: { title: string; content: string }
): Promise<Note> {
  const docRef = db.collection("notes").doc();
  const now = new Date();

  const newNote: Omit<Note, "id"> = {
    userId,
    title: data.title,
    content: data.content,
    isPinned: false,
    createdAt: now,
    updatedAt: now,
  };

  await docRef.set(newNote);
  return { id: docRef.id, ...newNote };
}

export async function updateNote(
  userId: string,
  noteId: string,
  data: { title?: string; content?: string; isPinned?: boolean }
): Promise<Note> {
  const docRef = db.collection("notes").doc(noteId);
  const doc = await docRef.get();

  if (!doc.exists) throw new NotFoundError();

  const existingData = doc.data();
  if (!existingData || existingData.userId !== userId) throw new NotAuthorizedError();

  const updates: Record<string, unknown> = {
    ...data,
    updatedAt: new Date(),
  };

  await docRef.update(updates);
  const updatedDoc = await docRef.get();
  return mapDocToNote(updatedDoc);
}

export async function deleteNote(userId: string, noteId: string): Promise<void> {
  const docRef = db.collection("notes").doc(noteId);
  const doc = await docRef.get();

  if (!doc.exists) throw new NotFoundError();

  const existingData = doc.data();
  if (!existingData || existingData.userId !== userId) throw new NotAuthorizedError();

  await docRef.delete();
}

export async function togglePin(userId: string, noteId: string): Promise<Note> {
  const note = await getNote(userId, noteId);
  return updateNote(userId, noteId, { isPinned: !note.isPinned });
}
