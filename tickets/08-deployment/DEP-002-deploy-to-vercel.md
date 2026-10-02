# DEP-002 — Deploy to Vercel

**Area:** Deployment
**Depends on:** DEP-001
**Blocks:** DEP-003
**Size:** M
**Spec reference:** §15, §18 Phase 6

## Goal

`main` builds and deploys automatically, and the live URL serves the app.

## Context

Vercel builds serverless functions for each route. The build command runs `next build`, and production
environment variables (including Firebase Admin credentials and `AUTH_SECRET`) must be supplied so
the app builds and boots cleanly without missing configurations.

## Execution steps

1. Import the GitHub repository into Vercel and select the production branch.
2. Set the build command to `next build`.
3. Confirm the environment variables from DEP-001 are present for Production and Preview.
4. Set `AUTH_URL` to the real deployed URL.
5. Deploy, then read the build log for warnings, not just the success line.
6. Open a pull request and confirm a preview deployment builds with its own environment.

## Files touched

- `package.json`, Vercel project settings

## Acceptance criteria

- [ ] `main` deploys automatically on push.
- [ ] The build succeeds with `next build`.
- [ ] The live URL serves the landing page over HTTPS.
- [ ] Preview deployments build successfully.
- [ ] No secret appears in the build log.

## Out of scope

- Custom domain and CDN configuration.
