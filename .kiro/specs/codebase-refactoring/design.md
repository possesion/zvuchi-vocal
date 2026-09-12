# Design Document: Codebase Refactoring

## Overview

This document describes the technical design for refactoring the vocal-school Next.js 15 application. The refactoring is purely internal — no user-facing behavior or UI changes. The goals are:

1. Eliminate the manual snake_case ↔ camelCase conversion layer between Prisma and application code
2. Standardize all server mutation results behind a single `ActionResult<T>` type
3. Replace ad-hoc `fetch POST/PATCH/DELETE` mutation calls with Next.js Server Actions
4. Decompose large components (`InstructorProfile`, `Programs`) into focused sub-components
5. Centralize shared utilities (formatters, CSS constants, role labels) to eliminate duplication
6. Remove dead code (`src/types/instructor.ts`, `src/types/program.ts`, `InstructorDbRow`)
7. Consolidate layout components under `src/components/layout/`
8. Add `/profile` route protection to middleware

The codebase is a Next.js 15 App Router project using Prisma with a SQLite adapter (`better-sqlite3`), NextAuth v5, Radix UI Themes, and Tailwind CSS.

---

## Architecture

### Current State

```
Client Component
  └─ fetch('/api/v1/instructors', PATCH)   ← mutation via REST
       └─ Route Handler (src/app/api/v1/)
            └─ db-prisma.ts  (convertPrisma*ToRow)
                 └─ Prisma (camelCase) → *Row (snake_case) → Component
```

### Target State

```
Client Component
  └─ Server Action (src/app/actions/)      ← mutation direct
       └─ db-prisma.ts  (parse JSON only)
            └─ Prisma types (camelCase) → App types (camelCase) → Component

GET data (read-only REST) stays unchanged:
Client Component
  └─ fetch GET /api/v1/wiki                ← wiki terms for instructor edit form
```

Key architectural decisions:

- **Mutations → Server Actions.** Eliminates the round-trip through API routes for writes, removes manual `fetch` boilerplate on the client, and lets Next.js handle serialization and revalidation.
- **GET via REST stays.** The wiki terms endpoint (`/api/v1/wiki`) and CRM balance endpoint are read-only and consumed lazily (on demand); there's no reason to change them.
- **Photo upload stays as fetch.** `uploadInstructorPhotoAction` is a multipart file upload; Server Actions don't support streaming multipart bodies natively in the current Next.js version, so the photo upload endpoint remains a REST route.
- **Types align with Prisma.** Removing the conversion layer means types are defined once (Prisma schema), parsed once (JSON fields in `db-prisma.ts`), and consumed directly in components without field-name mapping.

---

## Components and Interfaces

### 1. `src/lib/types.ts` — Application Types

Old names → new names:

| Old type | New type | Notes |
|---|---|---|
| `InstructorRow` | `Instructor` | All fields camelCase; `feature` renamed to `tagline` |
| `UserRow` | `AppUser` | camelCase fields; `passwordHash` included (internal use) |
| `NewsRow` | `NewsArticle` | camelCase fields |
| `ProgramRow` | `Program` | camelCase fields; `Package` type stays as-is |
| `InstructorDbRow` | _(deleted)_ | Made redundant by Requirement 15 |

The `WikiTermRow` and `WikiCategoryRow` types are not part of this renaming scope — they are used by the wiki module which is not being restructured.

**`Instructor` type (after migration):**
```ts
export interface Instructor {
  id: number
  name: string
  specialty: string
  tagline: string          // renamed from `feature`
  experience: string
  bio: string
  image: string
  video: string
  sortOrder: number
  slug: string
  presentationVideo: string
  performanceVideos: string[]   // parsed in db-prisma, never a raw string in app code
  techniques: string[]          // parsed in db-prisma
}
```

**`AppUser` type (after migration):**
```ts
export interface AppUser {
  id: number
  email: string
  passwordHash: string
  name: string | null
  phone: string | null
  phoneVerified: boolean        // was `phone_verified: 0 | 1`
  phoneVerifyCode: string | null
  phoneCodeExpires: string | null
  role: UserRole
  emailVerified: boolean        // was `email_verified: 0 | 1`
  verificationToken: string | null
  tokenExpiresAt: string | null
  resetToken: string | null
  resetTokenExpires: string | null
  createdAt: string
}
```

**`NewsArticle` type (after migration):**
```ts
export interface NewsArticle {
  id: number
  title: string
  summary: string
  content: string
  coverUrl: string
  views: number
  publishedAt: string
}
```

**`Program` type (after migration):**
```ts
export interface Program {
  id: number
  slug: string
  title: string
  shortDescription: string
  fullDescription: string
  packages: Package[]
  lessonDuration: number
  programDuration: number
  features: string[]
  isPopular: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}
```

`UserUpdateData` is updated to match camelCase fields and `boolean` for phone/email verified.

### 2. `src/app/actions/types.ts` — ActionResult

```ts
export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string }
```

`VerifyPhoneCodeResult` is replaced by `ActionResult`. All existing actions that returned `{ success: boolean; error?: string }` are updated to return `ActionResult<void>`.

Actions that previously threw exceptions (`sendEmail`, `sendVerificationEmail`, `sendPasswordResetEmail`) are converted to return `ActionResult<void>` with the error in the `error` field.

### 3. Server Actions

**New file: `src/app/actions/instructors.ts`**

```ts
'use server'

export async function createInstructorAction(data: Omit<Instructor, 'id'>): Promise<ActionResult<{ id: number }>>
export async function updateInstructorAction(data: Instructor): Promise<ActionResult<void>>
export async function deleteInstructorAction(id: number): Promise<ActionResult<void>>
// Photo upload stays as REST fetch — multipart not supported in Server Actions
```

`updateInstructorAction` replaces the `fetch PATCH /api/v1/instructors/:id` call in `InstructorProfile`.
`createInstructorAction` / `deleteInstructorAction` replace the corresponding `fetch` calls in `InstructorManager`.

**Updated file: `src/app/actions/programs.ts`**

`createProgramAction` and `updateProgramAction` already exist but return `{ success: boolean; error?: string }` — update return type to `ActionResult<{ id: number }>` and `ActionResult<void>` respectively.

**New file: `src/app/actions/quiz.ts`**

```ts
'use server'

export async function submitQuizAction(data: QuizSubmitData): Promise<ActionResult<void>>
```

Replaces `fetch('/api/send-mail', { method: 'POST', ... })` in `QuizContext`.

**Mutation flow contract:**

```
Client calls action(args)
  → action calls db-prisma function
  → on success: revalidatePath(path), return { success: true, data: ... }
  → on error:   return { success: false, error: 'Human-readable message' }
Client checks result.success
  → true: router.refresh() if needed, show success notification
  → false: show result.error via notify()
```

### 4. Component Decomposition

**InstructorProfile split:**

```
src/components/sections/
├── instructor-profile.tsx          — display only, ~100 lines
│                                     Props: { instructor: Instructor, techniqueTerms: WikiTermRow[], isAuthorized: boolean }
├── instructor-edit-form.tsx        — edit form
│                                     Props: { instructor: Instructor, onSaved: () => void }
└── video-placeholder.tsx           — reusable empty state
│                                     Props: none (renders Play icon + "Видео скоро появится")
```

`instructor-profile.tsx` is responsible only for display. When `isAuthorized` is true, it renders an "Edit" button that mounts `InstructorEditForm` in place of the inline form. `InstructorEditForm` calls `updateInstructorAction` and invokes `onSaved()` on success, which triggers `router.refresh()` in the parent.

The `openEdit` fetch to `/api/v1/wiki` stays as-is — it is a read-only GET request loaded on demand.

**Programs split:**

```
src/components/sections/
├── programs.tsx                    — list + delete via AlertDialog
└── first-lesson-card.tsx           — static card, no props needed
```

`programs.tsx` uses `AlertDialog` from `src/components/common/alert-dialog/` for the delete confirmation. The inline `createPortal` modal is removed.

**Quiz analytics hook:**

```
src/hooks/use-quiz-analytics.ts
```

```ts
export function useQuizAnalytics(
  step: number,
  isOpen: boolean,
  quizAnswers: QuizAnswers
): void
```

Encapsulates the `useEffect` that tracks step transitions via `sessionStorage` and `trackEvent`. `QuizProvider` calls this hook instead of containing the analytics logic inline.

### 5. Shared Utilities

**`src/lib/ui-constants.ts`** (new file):

```ts
export const formInputCls =
  'w-full rounded-sm bg-zinc-800 px-3 py-2 text-sm text-white outline-none ring-1 ring-white/10 focus:ring-[var(--color-brand)]'
```

Both `InstructorProfile` and `InstructorManager` import `formInputCls` from here. The local `inputCls` constant in each is removed.

**`src/lib/format.ts`** — additions:

```ts
export function formatDate(dateString: string | null): string
export function formatDateTime(dateString: string | null): string
export function formatBalance(amount: number | null): string
export function formatLessonCount(count: number | null): string
```

These are moved from the local `formatters` object in `client-balance.tsx`. The existing `formatDate(date: Date)` signature in `format.ts` needs reconciling — it will be updated to accept `string | null` consistently (the current `Date`-based overload is not used elsewhere).

`ClientBalance` imports these functions from `src/lib/format.ts` instead of using the local object.

**`src/lib/roles.ts`** — no changes needed. `ROLE_LABELS` already exists. `src/app/profile/page.tsx` removes its local `roleLabels` object and imports `ROLE_LABELS`.

### 6. `src/middleware.ts` — Route Protection

Add `/profile` to `PROTECTED_PATHS` and `/profile/:path*` to `matcher`:

```ts
const PROTECTED_PATHS = ['/users', '/profile']

export const config = {
  matcher: [
    '/wiki/:path*/edit',
    '/users/:path*',
    '/api/v1/:path*',
    '/profile/:path*',
    '/profile',
  ],
}
```

The redirect-to-login logic already handles this correctly once the path is in `PROTECTED_PATHS`. The existing `redirect('/login')` in `profile/page.tsx` stays as a defence-in-depth fallback.

### 7. File Moves

| From | To |
|---|---|
| `src/app/burger-menu.tsx` | `src/components/layout/burger-menu.tsx` |
| `src/components/mobile-menu.tsx` | `src/components/layout/mobile-menu.tsx` |

`MobileMenu` imports `BurgerMenu` internally — both files move together, so the relative import between them must be updated. All other consumers (currently just `src/components/layout/header.tsx`) are updated to the new paths.

### 8. Dead Code Removal

- Delete `src/types/instructor.ts` — contains a stale `Instructor` interface with `bio: ReactNode` that predates the Prisma migration. No active imports.
- Delete `src/types/program.ts` — contains a stale `Program` interface with `icon: ReactNode`. No active imports.
- Delete `InstructorDbRow` interface from `src/lib/types.ts` — made redundant by removing the conversion layer.

---

## Data Models

### JSON field parsing contract

Three Prisma models store structured data as JSON strings in SQLite:

| Model | Fields | Parsed type |
|---|---|---|
| `Instructor` | `performanceVideos`, `techniques` | `string[]` |
| `Program` | `packages`, `features` | `Package[]`, `string[]` |

**Rule:** `db-prisma.ts` is the only place where `JSON.parse` is called on these fields. The parse result is always validated — on failure, `[]` is returned. The rest of the codebase receives typed arrays and never deals with raw JSON strings for these fields.

**Prisma schema change:** The `feature` field in the `Instructor` model is renamed to `tagline`. This requires a migration:

```prisma
model Instructor {
  // ...
  tagline  String  @default("")   // renamed from `feature`
  // ...
}
```

Migration file will rename the column. All `db-prisma.ts` functions referencing `feature` are updated to `tagline`.

### `updateUser` simplification

The current `updateUser` function uses a dynamic `fieldMapping` object and `replace(/_([a-z])...)` to convert snake_case keys to camelCase at runtime. After migrating `UserUpdateData` to camelCase, this becomes a direct Prisma `update` call:

```ts
// Before: dynamic mapping
// After:
await prisma.user.update({
  where: { id },
  data: {
    name: data.name,
    phone: data.phone,
    phoneVerified: data.phoneVerified,
    // ...
  },
})
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

This refactoring has several aspects that are suitable for property-based testing: the ActionResult contract (which must hold for every action across a range of inputs) and the JSON parsing safety guarantee (which must hold for every possible raw DB value). The remaining changes are structural and verified through static analysis, smoke tests, and example-based unit tests.

### Property 1: ActionResult contract on success path

*For any* exported Server Action from `src/app/actions/` called with valid inputs that lead to a successful outcome, the returned object must satisfy `{ success: true }` and must never throw an exception to the caller.

**Validates: Requirements 4.4, 16.2**

### Property 2: ActionResult contract on error path

*For any* exported Server Action from `src/app/actions/` called with inputs that trigger an error condition (invalid data, missing resource, DB failure), the returned object must satisfy `{ success: false, error: string }` where `error` is a non-empty string, and the action must not throw.

**Validates: Requirements 4.5, 16.2**

### Property 3: JSON parse safety for Instructor fields

*For any* string value stored in the `performanceVideos` or `techniques` columns — including valid JSON arrays, invalid JSON, empty strings, and whitespace-only strings — the data access functions in `db-prisma.ts` must return an `Instructor` object where both `performanceVideos` and `techniques` satisfy `Array.isArray()`.

**Validates: Requirements 15.3, 15.4**

### Property 4: JSON parse safety for Program fields

*For any* string value stored in the `packages` or `features` columns — including valid JSON, invalid JSON, and empty strings — the data access functions in `db-prisma.ts` must return a `Program` object where both `packages` and `features` satisfy `Array.isArray()`.

**Validates: Requirements 15.3, 15.4**

### Property 5: Formatter functions handle null and valid inputs

*For any* call to `formatDate`, `formatDateTime`, `formatBalance`, or `formatLessonCount` from `src/lib/format.ts`, with any valid input value or `null`: the function must return a non-empty string and must never throw. When the input is `null`, the function must return `'Не указано'`.

**Validates: Requirements 11.1, 11.2**

---

## Error Handling

### Server Action errors

All Server Actions follow a consistent pattern:

```ts
export async function someAction(args): Promise<ActionResult<void>> {
  try {
    // ... business logic
    revalidatePath('/relevant-path')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('someAction failed:', error)
    return { success: false, error: 'Понятное сообщение об ошибке' }
  }
}
```

Error messages in the `error` field are user-facing strings in Russian. Low-level error details are logged to `console.error` for server-side debugging but not exposed to the client.

### JSON parse errors

Wrapped in try/catch in `db-prisma.ts`, returning `[]` on failure. This is the existing pattern — the refactoring preserves it and makes it the only JSON-parsing site in the codebase.

### Component error display

When a Server Action returns `{ success: false, error }`, components call `notify(result.error, 'error')` from the `useUI` context. This is the existing notification system already in use by `QuizProvider` and `ClientBalance`.

### Middleware errors

No change to middleware error handling. Unauthenticated access to protected routes redirects to `/login`; non-admin access to admin routes redirects to `/`.

---

## Testing Strategy

This refactoring is a pure structural change. No new user-facing behavior is introduced, so the primary testing concern is regression — verifying that the new structure behaves identically to the old one.

### Property-Based Testing

Property-based testing is appropriate for the ActionResult contract and JSON parsing safety, both of which should hold for all inputs, not just specific examples. The library of choice is **fast-check** (TypeScript-native, well-suited for Next.js projects).

Each property-based test is configured to run a minimum of 100 iterations.

**Test tags:**
- Property 1: `Feature: codebase-refactoring, Property 1: ActionResult success contract`
- Property 2: `Feature: codebase-refactoring, Property 2: ActionResult error contract`
- Property 3: `Feature: codebase-refactoring, Property 3: JSON parse safety for Instructor`
- Property 4: `Feature: codebase-refactoring, Property 4: JSON parse safety for Program`
- Property 5: `Feature: codebase-refactoring, Property 5: Formatter null safety`

Property tests 3–5 operate on pure functions and in-memory data, so no DB or network is involved. Properties 1–2 use mocked DB functions to test the action wrapper logic in isolation.

### Unit Tests (Example-Based)

Focus on specific behaviors that have concrete expected outputs:

- `revalidatePath` is called after successful instructor update
- `revalidatePath` is called after successful program delete
- `InstructorProfile` renders `InstructorEditForm` when `isAuthorized=true` and edit is clicked
- `InstructorProfile` renders `VideoPlaceholder` when `presentationVideo` is empty
- `Programs` renders `AlertDialog` (not a custom portal) when delete button is clicked
- `AlertDialog` renders title, description, and both action buttons
- `QuizProvider` error displays notification when submitQuizAction returns failure
- `useQuizAnalytics` calls `trackEvent` on step change and does not repeat for already-tracked steps

### Static Analysis / Smoke Tests

These verify structural invariants that cannot be tested through runtime behavior:

- No file in `src/` imports from `*Row` type names (enforced by TypeScript after rename)
- `src/app/burger-menu.tsx` and `src/components/mobile-menu.tsx` do not exist
- `src/types/instructor.ts` and `src/types/program.ts` do not exist
- `formInputCls` constant appears in exactly one location (`src/lib/ui-constants.ts`)
- `profile/page.tsx` does not declare a local `roleLabels` object
- No local `formatPrice` function in `programs.tsx` (TypeScript type check)
- No direct `formatPhoneNumber` import in `quiz-context.tsx`

Most of these are enforced by TypeScript's type system after the migration — if a `*Row` import remains, the build fails. The file-existence checks become implicit: the old files are deleted and any lingering imports cause build errors.

### Integration Tests

- Middleware redirects unauthenticated request to `/profile` → `/login`
- Middleware allows authenticated request to `/profile` through
- End-to-end: instructor update via `updateInstructorAction` persists to DB and revalidation refreshes the page
