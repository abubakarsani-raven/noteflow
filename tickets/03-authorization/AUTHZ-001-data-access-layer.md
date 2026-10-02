# AUTHZ-001 — Ownership-scoped data access layer

**Area:** Authorization
**Depends on:** DB-003, AUTH-001
**Blocks:** AUTHZ-002, AUTHZ-003, NOTE-001 … NOTE-005
**Size:** M
**Spec reference:** §7

## Goal

One module owns every note query, and no function in it can be called without a
user id.

## Context

This is the architectural decision that makes §7 enforceable rather than aspirational.
If pages query Firestore directly, ownership becomes a rule someone has to remember
on every new screen. Routing all access through `lib/notes.ts`, where `userId` is the
first parameter of every function, turns it into something the type system asks for.

The rule for reviewers: a Firestore `notes` query outside `lib/notes.ts` is a bug, even if
it happens to be correct today.

## Execution steps

1. Create `lib/notes.ts` with `listNotes`, `getNote`, `createNote`, `updateNote`, `deleteNote`, `togglePin` — each taking `userId` as its first argument.
2. Scope every query and filter with `userId`; never fetch by `id` alone and compare afterwards in a mutation path.
3. Define `NotAuthorizedError` and `NotFoundError` in `lib/errors.ts` and throw them from the layer rather than returning `null`.
4. Verify document `userId` matches the caller before updates and deletes, treating mismatched ownership as not authorised.
5. Grep the codebase for direct Firestore `notes` calls and confirm the only hits are inside `lib/notes.ts`.
6. Add the rule to the pull-request template checklist.

## Files touched

- `lib/notes.ts`, `lib/errors.ts`, `.github/pull_request_template.md`

## Acceptance criteria

- [ ] Every exported function takes `userId` first and uses it in the query.
- [ ] No direct Firestore note query exists outside `lib/notes.ts`.
- [ ] Write helpers cannot touch a document belonging to another user, even with a valid id.
- [ ] Callers can distinguish "missing" from "not yours" by error type.

## Out of scope

- Sharing notes between users: §22 Version 2.
