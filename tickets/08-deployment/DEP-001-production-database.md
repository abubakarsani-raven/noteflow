# DEP-001 — Production database and environment

**Area:** Deployment
**Depends on:** DB-002, FND-005
**Blocks:** DEP-002
**Size:** S
**Spec reference:** §18 Phase 6

## Goal

A production Firebase project and Cloud Firestore database exist with rules and indexes deployed, and
production secrets are set where the app can read them.

## Context

Production gets its own `AUTH_SECRET`, never the development one. Similarly, production uses dedicated
Firebase project credentials (`FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`), separate from
any local emulator or testing environment. Security rules (`firestore.rules`) and compound indexes
(`firestore.indexes.json`) must be deployed using the Firebase CLI so production queries perform and
data remains secure.

## Execution steps

1. Create the production Firebase project in the Google Cloud / Firebase console in the region closest to your users.
2. Enable Cloud Firestore in production mode.
3. Generate a service account private key for the Firebase Admin SDK in project settings.
4. Generate a fresh `AUTH_SECRET` with `npx auth secret`.
5. Set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `AUTH_SECRET`, and `AUTH_URL` in the Vercel project's production environment.
6. Deploy the Firestore security rules and composite indexes: `npx firebase deploy --only firestore:rules,firestore:indexes`.
7. Confirm the Firestore database is accessible and security rules prevent unauthorised direct client writes.

## Files touched

- `.env.example`, `README.md`, `firestore.rules`, `firestore.indexes.json`, Vercel project settings

## Acceptance criteria

- [ ] The production Cloud Firestore instance has security rules and indexes applied.
- [ ] Production Firebase credentials and secrets differ from development ones.
- [ ] Composite indexes are deployed and operational.
- [ ] No production credential or service account key is committed.

## Out of scope

- Automated database backups and point-in-time recovery; note GCP/Firebase retention policies.
