# Implementation Plan: Codebase Refactoring

## Overview

Pure structural refactoring of the vocal-school Next.js 15 application. No user-facing changes. The plan follows the dependency order: foundational types first, then the db layer, then Server Actions, then components, and dead-code removal last. All implementation is in TypeScript.

---

## Tasks

- [x] 1. Foundation — shared types, constants, and utilities
  - [x] 1.1 Define `ActionResult<T>` in `src/app/actions/types.ts`
    - Replace `VerifyPhoneCodeResult` with `type ActionResult<T = void> = { success: true; data: T } | { success: false; error: string }`
    - Keep `QuizAnswers` and `SendEmailProps` interfaces in the same file
    - _Requirements: 16.1_

  - [x] 1.2 Create `src/lib/ui-constants.ts` with shared `formInputCls`
    - Export `formInputCls` string constant (the CSS class list currently duplicated in `InstructorProfile` and `InstructorManager`)
    - _Requirements: 12.1_

  - [x] 1.3 Add formatter functions to `src/lib/format.ts`
    - Move `formatters.date`, `formatters.dateTime`, `formatters.balance`, `formatters.lessonCount` from `client-balance.tsx` into `format.ts` as named exports: `formatDate`, `formatDateTime`, `formatBalance`, `formatLessonCount`
    - Update the existing `formatDate(date: Date)` signature to accept `string | null` for consistency
    - _Requirements: 11.1, 11.3_

  - [ ]* 1.4 Write property tests for formatter functions (Property 5)
    - **Property 5: Formatter functions handle null and valid inputs**
    - **Validates: Requirements 11.1, 11.2**
    - For every call to `formatDate`, `formatDateTime`, `formatBalance`, `formatLessonCount` with any valid input or `null`: must return a non-empty string and never throw; when input is `null`, must return `'Не указано'`
    - Use `fast-check` with at least 100 iterations per property

- [x] 2. Rename app types and convert fields to camelCase in `src/lib/types.ts`
  - [x] 2.1 Rename `InstructorRow` → `Instructor`; convert all fields to camelCase; delete `InstructorDbRow`
    - New shape: `id, name, specialty, feature, experience, bio, image, video, sortOrder, slug, presentationVideo, performanceVideos: string[], techniques: string[]`
    - Note: field `feature` keeps its name (no DB rename)
    - _Requirements: 17.1, 17.6, 18.1_

  - [x] 2.2 Rename `UserRow` → `AppUser`; convert all fields to camelCase; change `phone_verified: 0|1` → `phoneVerified: boolean` and `email_verified: 0|1` → `emailVerified: boolean`; update `UserUpdateData` accordingly
    - New shape mirrors Prisma `User` model fields exactly
    - _Requirements: 14.1, 14.4, 17.2, 18.1_

  - [x] 2.3 Rename `NewsRow` → `NewsArticle` and `ProgramRow` → `Program`; convert all fields to camelCase
    - `NewsArticle`: `id, title, summary, content, coverUrl, views, publishedAt`
    - `Program`: `id, slug, title, shortDescription, fullDescription, packages, lessonDuration, programDuration, features, isPopular, sortOrder, createdAt, updatedAt`
    - _Requirements: 17.3, 17.4, 18.1_

- [x] 3. ~~Prisma schema migration: rename `feature` → `tagline`~~ — SKIPPED (field name unchanged per Variant A decision
  - ~~3.1 Add `tagline` field to `prisma/schema.prisma`~~ — skipped

- [ ] 4. Refactor `src/lib/db-prisma.ts` — remove conversion layer, adopt new types
  - [ ] 4.1 Remove all `convertPrisma*ToRow` functions and update all db functions to return the renamed camelCase types (`Instructor`, `AppUser`, `NewsArticle`, `Program`)
    - Keep JSON parsing in-place (try/catch returning `[]` on failure) — this is now the only JSON-parsing site
    - Use `feature` (not `tagline`) when mapping the Instructor model
    - _Requirements: 15.1, 15.2, 15.3, 15.4_

  - [ ] 4.2 Simplify `updateUser` — replace the dynamic `fieldMapping` / snake_case→camelCase `replace(...)` logic with a direct Prisma `update` call using camelCase field names from the updated `UserUpdateData` type
    - _Requirements: 14.2, 14.3, 18.3_

  - [ ]* 4.3 Write property tests for JSON parse safety — Instructor (Property 3)
    - **Property 3: JSON parse safety for Instructor fields**
    - **Validates: Requirements 15.3, 15.4**
    - For any string in `performanceVideos` / `techniques` (valid JSON, invalid JSON, empty string, whitespace): the returned `Instructor` must have `Array.isArray(performanceVideos)` and `Array.isArray(techniques)`
    - Use `fast-check`

  - [ ]* 4.4 Write property tests for JSON parse safety — Program (Property 4)
    - **Property 4: JSON parse safety for Program fields**
    - **Validates: Requirements 15.3, 15.4**
    - For any string in `packages` / `features`: the returned `Program` must have `Array.isArray(packages)` and `Array.isArray(features)`
    - Use `fast-check`

- [ ] 5. Checkpoint — type system passes, db layer compiles
  - Run `tsc --noEmit` and confirm zero type errors. Fix any remaining usages of old `*Row` type names in API routes (`src/app/api/v1/`), `src/auth.ts`, and any other files that import from `src/lib/types.ts`.
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. Update existing Server Actions to use `ActionResult<T>` and new types
  - [ ] 6.1 Update `src/app/actions/profile.ts` — change return types to `ActionResult<void>`; update all `UserRow`/`phone_verified`/`email_verified` references to `AppUser`/`phoneVerified`/`emailVerified`
    - Remove local `phone_verified: 0` and `phone_verify_code: null` keys from the `updateData` object — use camelCase equivalents
    - _Requirements: 14.3, 16.2_

  - [ ] 6.2 Update `src/app/actions/crm.ts` — change return type to `ActionResult<ClientBalanceData>`; update `phone_verified !== 1` check to `!phoneVerified`
    - _Requirements: 14.3, 16.2_

  - [ ] 6.3 Update `src/app/actions/sendEmail.ts` — convert `sendEmail`, `sendVerificationEmail`, `sendPasswordResetEmail` from `throw`-on-error to `return ActionResult<void>`
    - _Requirements: 16.2_

  - [ ] 6.4 Update `src/app/actions/programs.ts` — change return types to `ActionResult<{ id: number }>` / `ActionResult<void>` for `createProgramAction`, `updateProgramAction`, `deleteProgramAction`
    - _Requirements: 16.2_

  - [ ]* 6.5 Write property tests for ActionResult success contract (Property 1)
    - **Property 1: ActionResult contract on success path**
    - **Validates: Requirements 4.4, 16.2**
    - For any Server Action called with valid inputs: returned object satisfies `result.success === true` and the action never throws
    - Mock db functions; use `fast-check` to generate valid input shapes

  - [ ]* 6.6 Write property tests for ActionResult error contract (Property 2)
    - **Property 2: ActionResult contract on error path**
    - **Validates: Requirements 4.5, 16.2**
    - For any Server Action with inputs that trigger an error condition: returned object satisfies `result.success === false` and `typeof result.error === 'string'` with `result.error.length > 0`
    - Mock db to throw; use `fast-check`

- [ ] 7. Create new Server Actions for instructor and quiz mutations
  - [ ] 7.1 Create `src/app/actions/instructors.ts`
    - Implement `createInstructorAction(data: Omit<Instructor, 'id'>): Promise<ActionResult<{ id: number }>>`
    - Implement `updateInstructorAction(data: Instructor): Promise<ActionResult<void>>` — calls `updateInstructor`, then `revalidatePath`
    - Implement `deleteInstructorAction(id: number): Promise<ActionResult<void>>` — calls `deleteInstructor`, then `revalidatePath`
    - _Requirements: 4.1, 4.2, 4.4, 4.5, 4.6_

  - [ ] 7.2 Create `src/app/actions/quiz.ts`
    - Implement `submitQuizAction(data: QuizSubmitData): Promise<ActionResult<void>>`
    - Move the email-sending logic from `QuizContext.handleSubmit` into this action; use `sendEmail` internally
    - _Requirements: 4.3, 4.4, 4.5_

- [ ] 8. Centralise shared utilities in non-component files
  - [ ] 8.1 Update `src/app/profile/page.tsx` — remove local `roleLabels` object, import `ROLE_LABELS` from `src/lib/roles.ts`
    - _Requirements: 9.1, 9.2_

  - [ ] 8.2 Update `src/components/sections/client-balance.tsx` — remove local `formatters` object; import `formatDate`, `formatDateTime`, `formatBalance`, `formatLessonCount` from `src/lib/format.ts`; update `ClientBalance` props to use `phoneVerified: boolean` instead of `0|1` comparisons
    - _Requirements: 11.2, 14.3_

- [ ] 9. Add `/profile` route protection to middleware
  - [ ] 9.1 Update `src/middleware.ts` — add `/profile` to `PROTECTED_PATHS`; add `/profile/:path*` and `/profile` to the `matcher` array in `config`
    - _Requirements: 2.1, 2.2, 2.3_

- [ ] 10. Move layout components to `src/components/layout/`
  - [ ] 10.1 Move `src/app/burger-menu.tsx` → `src/components/layout/burger-menu.tsx` and `src/components/mobile-menu.tsx` → `src/components/layout/mobile-menu.tsx`
    - Update the relative import of `BurgerMenu` inside `mobile-menu.tsx`
    - Update all consumers (e.g., `src/components/layout/header.tsx`) to import from `@/components/layout/burger-menu` and `@/components/layout/mobile-menu`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6_

- [ ] 11. Decompose `InstructorProfile` into sub-components
  - [ ] 11.1 Create `src/components/sections/video-placeholder.tsx`
    - Renders the Play icon and «Видео скоро появится» text; no props required
    - _Requirements: 5.2, 5.4, 5.5_

  - [ ] 11.2 Create `src/components/sections/instructor-edit-form.tsx`
    - Props: `{ instructor: Instructor; onSaved: () => void }`
    - Extract the edit `<form>` from `InstructorProfile`; call `updateInstructorAction` on submit; import `formInputCls` from `src/lib/ui-constants.ts`
    - _Requirements: 5.1, 5.3, 4.2, 12.2_

  - [ ] 11.3 Refactor `src/components/sections/instructor-profile.tsx`
    - Remove the inline edit form — mount `InstructorEditForm` when `isEditing` is true
    - Replace empty-video `<div>` blocks with `<VideoPlaceholder />`
    - Remove local `inputCls` constant (now imported from `ui-constants.ts`)
    - _Requirements: 5.3, 5.4, 5.5, 12.2_

- [ ] 12. Decompose `Programs` component
  - [ ] 12.1 Create `src/components/sections/first-lesson-card.tsx`
    - Extract the static «Первое занятие» article from `Programs`; no props needed
    - _Requirements: 6.1_

  - [ ] 12.2 Refactor `src/components/sections/programs.tsx`
    - Replace the inline `createPortal` delete dialog with `AlertDialog` from `src/components/common/alert-dialog/`
    - Remove the local `formatPrice` function; import `formatPrice` from `src/lib/format.ts`
    - Render `<FirstLessonCard />` instead of the inline article block
    - Update `ProgramRow` → `Program` in props type
    - _Requirements: 6.2, 6.3, 8.1_

- [ ] 13. Refactor `QuizContext` — extract analytics hook and use Server Action
  - [ ] 13.1 Create `src/hooks/use-quiz-analytics.ts`
    - Signature: `useQuizAnalytics(step: number, isOpen: boolean, quizAnswers: QuizAnswers): void`
    - Move the `useEffect` block that reads/writes `sessionStorage` and calls `trackEvent` out of `QuizProvider`
    - _Requirements: 7.1, 7.2_

  - [ ] 13.2 Refactor `src/components/modals/quiz-context.tsx`
    - Call `useQuizAnalytics` instead of the inline `useEffect` analytics block
    - Replace `fetch('/api/send-mail', ...)` in `handleSubmit` with `submitQuizAction`
    - Remove the duplicate `formatPhoneNumber` import and use `useContactForm` (or inline the hook) for `formData` / `handleChange`; delete the local `handleChange` function
    - _Requirements: 4.3, 7.2, 10.1, 10.2_

- [ ] 14. Update `InstructorManager` to use Server Actions and shared `formInputCls`
  - [ ] 14.1 Refactor `src/components/sections/instructor-manager.tsx` (or equivalent instructor admin component)
    - Replace `fetch POST/PATCH/DELETE` calls with `createInstructorAction`, `updateInstructorAction`, `deleteInstructorAction`
    - Remove local `inputCls` constant; import `formInputCls` from `src/lib/ui-constants.ts`
    - Replace any inline delete confirmation dialog with `AlertDialog`
    - _Requirements: 4.1, 8.1, 12.3_

- [ ] 15. Update `src/auth.ts` and `src/app/profile/page.tsx` for renamed `AppUser` type and boolean fields
  - [ ] 15.1 Update `src/auth.ts` — replace `UserRow` with `AppUser`; replace all `phone_verified === 1` / `email_verified === 1` comparisons with `phoneVerified` / `emailVerified`
    - _Requirements: 14.3, 17.2_

  - [ ] 15.2 Update `src/app/profile/page.tsx` — replace `UserRow` with `AppUser`; replace `phone_verified` / `email_verified` comparisons with boolean equivalents
    - _Requirements: 14.3, 17.2_

  - [ ] 15.3 Update `src/components/sections/profile/phone-verification.tsx` — replace `UserRow` with `AppUser`; update `phone_verified` comparisons
    - _Requirements: 14.3, 17.2_

- [ ] 16. Apply `ApiResponse<T>` return type to API route handlers
  - [ ] 16.1 Update all route handlers in `src/app/api/v1/` to annotate their return type as `NextResponse<ApiResponse<T>>`, using the existing `ApiResponse` type from `src/types/api.ts`
    - _Requirements: 16.3_

- [ ] 17. Checkpoint — full build and all tests
  - Run `tsc --noEmit` (must produce zero errors).
  - Run the full test suite. Ensure all tests pass, ask the user if questions arise.

- [ ] 18. Dead code removal
  - [ ] 18.1 Delete `src/types/instructor.ts` (stale `Instructor` interface with `bio: ReactNode`)
    - Confirm no remaining imports before deleting
    - _Requirements: 13.1, 13.3_

  - [ ] 18.2 Delete `src/types/program.ts` (stale `Program` interface with `icon: ReactNode`)
    - Confirm no remaining imports before deleting
    - _Requirements: 13.2, 13.3_

- [ ] 19. Final checkpoint
  - Run `tsc --noEmit` and full test suite one more time. Ensure all tests pass, ask the user if questions arise.

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP delivery
- Dependency order is strict: Tasks 1–3 (types + schema) must complete before Task 4 (`db-prisma.ts`), which must complete before Tasks 6–7 (Server Actions), which must complete before Tasks 11–14 (components)
- Tasks 1.2, 1.3, 8.1, 9.1, 10.1 are independent of each other and can proceed in parallel once Task 2 is done
- The `fast-check` library must be installed as a dev dependency before running any property tests: `npm install --save-dev fast-check`
- Photo upload (`/api/v1/instructors/:id/photo`) stays as a REST endpoint — multipart streaming is not supported by Server Actions in the current Next.js version
- The GET wiki endpoint (`/api/v1/wiki`) used inside `InstructorProfile.openEdit` stays as-is (read-only, on-demand)
- Each property test is configured for a minimum of 100 iterations per fast-check `fc.assert`

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "1.3"] },
    { "id": 1, "tasks": ["1.4", "2.1", "2.2", "2.3"] },
    { "id": 2, "tasks": [] },
    { "id": 3, "tasks": ["4.1", "4.2"] },
    { "id": 4, "tasks": ["4.3", "4.4", "6.1", "6.2", "6.3", "6.4", "8.1", "8.2", "9.1", "10.1"] },
    { "id": 5, "tasks": ["6.5", "6.6", "7.1", "7.2"] },
    { "id": 6, "tasks": ["11.1", "12.1", "13.1", "15.1", "15.2", "15.3", "16.1"] },
    { "id": 7, "tasks": ["11.2"] },
    { "id": 8, "tasks": ["11.3", "12.2", "13.2", "14.1"] },
    { "id": 9, "tasks": ["18.1", "18.2"] }
  ]
}
```
