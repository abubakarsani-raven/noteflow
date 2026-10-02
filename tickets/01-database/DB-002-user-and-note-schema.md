# DB-002 — User and Note schema and indexes

**Area:** Database
**Depends on:** DB-001
**Blocks:** AUTH-001, AUTHZ-001, DEP-001
**Size:** M
**Spec reference:** §14

## Goal

The `users` and `notes` Firestore document schemas and composite query indexes exist exactly as the spec describes,
with data validation and the compound indexing the dashboard query needs.

## Context

In Cloud Firestore, data is organized into top-level `users` and `notes` collections. Notes contain long body text,
stored as strings with no arbitrary length limitations. The dashboard query filters by `userId == x` and sorts by
`isPinned desc` and `updatedAt desc` (owner's notes, pinned first, newest first) — in Firestore, this requires
a composite index defined in `firestore.indexes.json` so queries execute efficiently without missing-index errors.
Unlike relational databases with database-level cascading foreign keys, account deletion cascades (deleting a user's
notes when the user is deleted) are handled via batch writes or helper functions in the data access layer.
Email uniqueness is enforced before creating user documents.

## Execution steps

1. Define TypeScript document types and Zod schemas for `User`: `id` (string), `name` (string), `email` (string, unique), `password` (string hash), `createdAt` (timestamp), `updatedAt` (timestamp).
2. Define TypeScript document types and Zod schemas for `Note`: `id` (string), `userId` (string), `title` (string), `content` (string), `isPinned` (boolean, default `false`), `createdAt` (timestamp), `updatedAt` (timestamp).
3. Configure `firestore.indexes.json` with the composite index on the `notes` collection: `userId` (ASCENDING), `isPinned` (DESCENDING), and `updatedAt` (DESCENDING).
4. Implement cascade deletion helper that queries and deletes all notes for a user in a batch when a user account is deleted.
5. Create Firestore security rules in `firestore.rules` enforcing user-level isolation and document validation.
6. Verify schemas and compound queries against the Firestore emulator or Firebase console.

## Files touched

- `types/database.ts`, `firestore.indexes.json`, `firestore.rules`, `lib/validations.ts`

## Acceptance criteria

- [ ] Both document models match the field specifications in §14.
- [ ] `email` uniqueness is enforced during user registration.
- [ ] `content` stores long text with no practical length constraint.
- [ ] The composite index for `[userId, isPinned, updatedAt]` is defined in `firestore.indexes.json`.
- [ ] Deleting a user deletes all associated notes for that user.

## Out of scope

- Tags and categories: §22 Version 2.
