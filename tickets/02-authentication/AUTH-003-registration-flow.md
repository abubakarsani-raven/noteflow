# AUTH-003 — Registration flow

**Area:** Authentication
**Depends on:** AUTH-002
**Blocks:** AUTH-007
**Size:** M
**Spec reference:** §6.1, §13.2, §19

## Goal

A visitor creates an account from `/signup` and arrives on their empty dashboard,
already signed in.

## Context

Uniqueness is enforced on registration: check for existing email in the `users` collection
to return a friendly error message on the email field, and guard creation in a transaction
to catch race conditions where two requests register the same address at once. Surface
a clean user-facing error message rather than an unhandled exception.

## Execution steps

1. Add `signUpSchema` to `lib/validations.ts`: name, email, password, confirmPassword, with a `refine` for the match.
2. Write `registerAction` in `lib/actions/auth-actions.ts` as a Server Action returning `ActionState`.
3. In the action: parse with Zod, return field errors on failure, check for an existing email in Firestore, hash, create the user.
4. Sign the new user in immediately with `signIn("credentials", { ..., redirectTo: "/dashboard" })`.
5. Build `components/SignUpForm.tsx` as a client component using `useActionState`, with labelled inputs and inline errors.
6. Catch duplicate email conditions and surface "An account already exists with this email."
7. Test: valid signup, mismatched passwords, weak password, duplicate email, blank fields.

## Files touched

- `app/(auth)/signup/page.tsx`, `components/SignUpForm.tsx`, `lib/actions/auth-actions.ts`, `lib/validations.ts`

## Acceptance criteria

- [ ] A valid signup creates a user and lands on `/dashboard` already authenticated.
- [ ] A duplicate email shows the message on the email field and creates nothing.
- [ ] Mismatched passwords show the error on the confirm field.
- [ ] Errors do not clear the name and email the user already typed.
- [ ] The submit button disables while the request is in flight.

## Out of scope

- Email verification, captcha, terms checkbox.
