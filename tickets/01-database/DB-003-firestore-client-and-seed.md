# DB-003 — Firestore client singleton and seed

**Area:** Database
**Depends on:** DB-002
**Blocks:** AUTHZ-001
**Size:** S
**Spec reference:** §15, §18 Phase 3

## Goal

One initialized Firebase Admin and Firestore client instance for the whole app, and a seed script that produces test data in
one command.

## Context

Next.js hot reload re-evaluates modules, so a naive `initializeApp()` call throws an error indicating the default app
already exists. Initializing Firebase Admin with an app check (`getApps().length ? getApp() : initializeApp(...)`)
guarantees a singleton instance is preserved across hot reloads.
When running against the local Firestore emulator, the client points to `FIRESTORE_EMULATOR_HOST`.

## Execution steps

1. Write `lib/firebase.ts` exporting an initialized Firebase Admin `firestore` instance using the singleton pattern.
2. Ensure development connects to the local Firestore emulator when `FIRESTORE_EMULATOR_HOST` is specified.
3. Write `scripts/seed.ts` creating one demo user with a hashed password and two notes, one pinned.
4. Add `npm run db:seed` to `package.json` pointing to `tsx scripts/seed.ts`.
5. Run the seed twice to confirm it is idempotent (using document updates/upserts with deterministic IDs).
6. Verify seeded documents exist in the Firestore emulator UI or Firebase console.

## Files touched

- `lib/firebase.ts`, `scripts/seed.ts`, `package.json`

## Acceptance criteria

- [ ] Editing a file in development does not throw duplicate Firebase app initialization errors.
- [ ] `npm run db:seed` runs multiple times without duplication or constraint errors.
- [ ] The seeded password is a bcrypt hash, not plain text.
- [ ] Seed script generates the demo user and notes in Firestore.

## Out of scope

- Production seeding; the production database starts empty.
