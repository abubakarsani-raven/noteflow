# DB-001 — Provision Firebase and Firestore

**Area:** Database
**Depends on:** FND-001, FND-005
**Blocks:** DB-002
**Size:** S
**Spec reference:** §15, §18 Phase 3

## Goal

The app connects to Firebase and Cloud Firestore in development.

## Context

Firebase and Cloud Firestore provide a scalable, managed document database for the application.
For local development, the Firebase Local Emulator Suite keeps development fast, offline-friendly,
and cost-effective without polluting cloud projects. The Firebase Admin SDK handles privileged server-side
database operations in Next.js Server Components and Server Actions.

## Execution steps

1. Install `firebase-admin` as a dependency and `firebase-tools` as a dev dependency.
2. Initialize Firebase configuration (`firebase.json`) specifying Cloud Firestore and emulator port settings.
3. Configure environment variables in `.env` (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, and `FIRESTORE_EMULATOR_HOST` for local emulation).
4. Add npm script `npm run db:emulator` to run `firebase emulators:start --only firestore`.
5. Verify the connection by writing and reading a test document via Firebase Admin SDK.
6. Note the Firebase setup and emulator startup command in the README.

## Files touched

- `firebase.json`, `.env`, `.env.example`, `README.md`, `package.json`

## Acceptance criteria

- [ ] Firebase Admin SDK connects to Cloud Firestore (or the local Firestore emulator) without error.
- [ ] Firebase credentials and private keys are kept in `.env` only, never committed to version control.
- [ ] The README explains how to start the local Firestore emulator or connect to Firebase from scratch.

## Out of scope

- The production Firebase and Firestore deployment (DEP-001).
