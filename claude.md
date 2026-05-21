# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository context

- Repository root: `c:\Users\Munir Yusuf\Desktop\real-support`
- Project: RS Ride frontend. Next.js 15.5.12, TypeScript, Tailwind CSS v4, PWA.
- Branch: `client/dev`
- Last known commit: `83fe0d5` — revert of the unintended One App rebrand.
- Current repo status: untracked `claude.md` only.
- Backend: separate NestJS repo at `c:\Users\Munir Yusuf\Desktop\pssl-backend-nest`.

## What was done yesterday

### 1. Company admin profile edit page
- Added a self-service company profile page for company admins.
- New route: `src/app/company/profile/page.tsx`
- Added a new company nav item in `src/components/DashboardLayout.tsx`.
- The page uses `useRequireAuth()` to ensure a logged-in company user and loads company details via `companyApi.getById(user.id)`.
- Fields surfaced:
  - `companyName`
  - `companyEmail`
  - `phone_number`
  - `description`
- The page shows the current company status badge from `company.status` with labels: `ACTIVE`, `PENDING`, `SUSPEND`, `ONHOLD`.
- Save flow: calls `companyApi.update(user.id, form)` and displays success (`Saved. Changes submitted for approval.`) or error toast.
- This page is inside the company-admin dashboard UI, using `DashboardLayout role="company"`.

### 2. Undo the One App rebrand
- The user explicitly rejected changing the brand name from RS Ride to One App.
- Reverted commit `e44192a` with a new revert commit `83fe0d5`.
- The revert touched UI strings, metadata, manifest, service-worker assets, and copy across marketing pages.
- Confirmed the revert is active on both remotes:
  - `origin/main` → `83fe0d5`
  - `client/client/dev` → `83fe0d5`

### 3. Status of the current work
- Build was successful before the revert.
- The company profile page implementation is complete and on the working branch.
- No additional frontend changes were committed after the revert except this new `claude.md` file.

## Files changed yesterday

- `src/app/company/profile/page.tsx`
- `src/components/DashboardLayout.tsx`
- `src/app/layout.tsx` (revert changes)
- `src/app/page.tsx` (revert changes)
- `src/app/rider/book/page.tsx` (revert changes)
- `src/app/services/page.tsx` (revert changes)
- `src/components/Footer.tsx` (revert changes)
- `src/lib/types.ts` (revert changes)
- Plus other UI/copy files affected by the brand revert.

## How it was done

### Company profile page implementation details
- Existing service: `src/lib/services/company.ts` exports `companyApi.update(id, data)`.
- The new page loads current company data with `companyApi.getById(user.id)` and stores it in local component state.
- It uses standard form controls and updates the payload schema expected by the backend.
- The page uses `useRequireAuth()` from `src/lib/use-require-auth.ts` so the `user` object is available and the company ID is `user.id`.
- Save button uses page-level loading state and shows inline feedback.

### Brand revert details
- The revert restored the official brand to RS Ride and removed the temporary One App copy.
- It also removed any accidental `One App` string insertions introduced by the rebrand commit.
- The key principle: keep all copy as RS Ride and do not reintroduce the One App rebrand.

## How to test the work

### Prerequisites
- Ensure `.env.local` is present locally with valid environment variables.
- Do not commit `.env.local`.
- Confirm backend is reachable via `NEXT_PUBLIC_BACKEND_API`.

### Local validation
1. Run the app:
```powershell
cd "c:\Users\Munir Yusuf\Desktop\real-support"
npm run dev
```
2. Open the company admin dashboard in the browser.
3. Navigate to `/company/profile`.
4. Verify the page loads current company data into the form.
5. Check the visible status badge value.
6. Modify fields such as `companyName`, `companyEmail`, `phone_number`, or `description`.
7. Click save.
8. Confirm the UI shows a successful save message.
9. Confirm the backend call goes to `PATCH /company/updateById/{id}` and returns the updated company object.
10. Confirm the new sidebar link appears under company navigation.

### Regression testing
1. Search for the legacy rebrand strings and confirm no active brand rename:
```powershell
grep -R "One App|one-app|OneApp" src | grep -v "generic phrase"
```
2. Run the production build:
```powershell
npm run build
```
3. Run ESLint if you need additional confidence:
```powershell
npm run lint
```
4. Verify the route still exists and is included in the build output.

### Git verification
1. Confirm the latest commit:
```powershell
git log --oneline -3
```
2. Confirm branch state:
```powershell
git status --short
```
3. Confirm remotes point to `83fe0d5`:
```powershell
git ls-remote origin main
git ls-remote client client/dev
```

## Important constraints
- Do not reintroduce the One App rebrand.
- Do not commit `.env.local`.
- Build output is not a guarantee of type safety because TypeScript and ESLint are ignored during production builds.
- Keep changes limited to the correct app area unless a task explicitly involves `(RSAdmin)/admin`.

## Recommended next actions

### If continuing frontend work
- Review and improve `/company/profile` form validation and error handling.
- Add automated or manual tests for the company profile save flow.
- Inspect the dispatch-related work that is still pending and pick one of these next:
  - Rider budget input and request creation.
  - Driver offer modal with countdown.
  - Public job board page.
  - Searching UI and bid socket listener.

### If continuing audit work
- Verify the company profile page on mobile and desktop.
- Confirm the revert removed all One App brand traces.
- Validate that `src/lib/services/company.ts` still matches backend contract.

## Notes for another AI
- Last user request: "please try to create a very ery comprehensive context file so that the new ai im using can understand exactly what was done yesterday, how it was done and how to test for it." Use this document as the handoff.
- The current work is frontend-first; backend work is in a separate repo but relevant for API contract.
- The brand is RS Ride. If any change touches marketing copy, keep that name.
- The new AI should start by validating the company profile page and the brand revert before adding new feature work.
