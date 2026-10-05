import bcrypt from "bcryptjs";
import { db } from "../lib/firebase";

async function main() {
  console.log("Seeding Firestore database...");

  const email = "demo@noteflow.app";
  const password = await bcrypt.hash("Password123!", 12);
  const now = new Date();

  // Find or create demo user
  const userSnapshot = await db
    .collection("users")
    .where("email", "==", email)
    .limit(1)
    .get();

  let userId: string;

  if (userSnapshot.empty) {
    const userRef = db.collection("users").doc();
    userId = userRef.id;
    await userRef.set({
      id: userId,
      name: "Demo User",
      email,
      password,
      createdAt: now,
      updatedAt: now,
    });
    console.log(`Created demo user: ${email} (ID: ${userId})`);
  } else {
    const userDoc = userSnapshot.docs[0];
    userId = userDoc.id;
    await userDoc.ref.update({
      password,
      updatedAt: now,
    });
    console.log(`Updated existing demo user: ${email} (ID: ${userId})`);
  }

  // Create demo notes if they don't already exist
  const existingNotesSnapshot = await db
    .collection("notes")
    .where("userId", "==", userId)
    .get();

  if (existingNotesSnapshot.empty) {
    const note1Ref = db.collection("notes").doc();
    await note1Ref.set({
      id: note1Ref.id,
      userId,
      title: "Welcome to NoteFlow",
      content:
        "NoteFlow is your private space for thoughts, ideas, and lists. Pinned notes stay at the top of your dashboard for quick access.",
      isPinned: true,
      createdAt: now,
      updatedAt: now,
    });

    const note2Ref = db.collection("notes").doc();
    await note2Ref.set({
      id: note2Ref.id,
      userId,
      title: "Meeting Notes: Sprint Planning",
      content:
        "Discussed Q4 roadmap priorities and migrated the database architecture to Firebase and Cloud Firestore.",
      isPinned: false,
      createdAt: now,
      updatedAt: now,
    });

    console.log("Created 2 demo notes (1 pinned).");
  } else {
    console.log(`User already has ${existingNotesSnapshot.size} notes; skipping note creation.`);
  }

  console.log("Seeding completed successfully.");
}

main().catch((err) => {
  console.error("Seeding failed:", err);
  process.exit(1);
});
