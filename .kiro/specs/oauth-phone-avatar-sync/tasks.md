# Implementation Plan: oauth-phone-avatar-sync

## Overview

Implementation proceeds bottom-up: data layer (Prisma + types + db-prisma) first, then the pure, property-tested `oauth-sync.ts` module and the isolated `google-people.ts` I/O helper, then the NextAuth wiring (`auth.config.ts` type augmentation/session callback, `auth.ts` providers/JWT callback), then the UI (`UserAvatar` + profile page) and `next.config.ts` image host allow-list, and finally a regression test locking in the existing manual-profile-update verification-reset behavior (Requirement 6 / Property 10). This order lets each layer be exercised by tests before the next layer depends on it.

## Tasks

- [ ] 1. Data layer: Prisma schema, migration, and TypeScript types for `avatarUrl`
  - [ ] 1.1 Add `avatarUrl` field to the Prisma `User` model and create the migration
    - Add `avatarUrl String? @db.VarChar(2048)` to `model User` in `prisma/schema.prisma`
    - Create `prisma/migrations/<timestamp>_add_user_avatar_url/migration.sql` with `ALTER TABLE "User" ADD COLUMN "avatarUrl" VARCHAR(2048);`
    - Run Prisma client generation so `prisma/generated/**` types include `avatarUrl`
    - _Requirements: 4.1_

  - [ ] 1.2 Extend `AppUser` and `UserUpdateData` in `src/lib/types.ts`
    - Add `avatarUrl: string | null` to the `AppUser` interface
    - Add `avatarUrl` to the `Pick<...>` key list of `UserUpdateData`
    - _Requirements: 4.2, 4.3_

- [ ] 2. Implement `avatarUrl` support in `src/lib/db-prisma.ts`
  - [ ] 2.1 Update `createUser`, `updateUser`, and all `AppUser`-mapping functions
    - `createUser`: accept optional `avatarUrl?: string | null` param, persist `data.avatarUrl ?? null`, include `avatarUrl` in the returned `AppUser` literal
    - `updateUser`: add `...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl })` to the Prisma `data` object, following the existing conditional-spread pattern
    - Add `avatarUrl: user.avatarUrl` to the returned literal in `getUserByEmail`, `getUserById`, `getAllUsers`, `getUserByVerificationToken`, `getUserByResetToken`
    - _Requirements: 4.4, 4.5, 4.6, 4.7, 4.8_

  - [ ]* 2.2 Write property test for db-prisma `avatarUrl` fidelity
    - File: `src/lib/db-prisma.test.ts` (mock the Prisma client module to simulate stored rows)
    - **Property 9: db-prisma avatarUrl fidelity**
    - **Validates: Requirements 4.4, 4.5, 4.6, 4.7, 4.8**

- [ ] 3. Pure `oauth-sync.ts` module and its property/unit tests
  - [ ] 3.1 Add `fast-check` as a pinned devDependency
    - Add `"fast-check": "3.23.2"` to `package.json` `devDependencies`
    - Install dependencies so `node_modules/fast-check` is available to tests

  - [ ] 3.2 Implement `src/lib/oauth-sync.ts`
    - `mergeOAuthProfileIntoUser`, `normalizePhoneDigitsOnly`, `buildYandexAvatarUrl`, `extractYandexProviderData`, `extractGooglePrimaryPhone`, `isOAuthSyncProvider`, `resolveTokenImage`, `resolveSessionImage`, plus the `OAuthProfileData`/`UserPhoneAvatarState`/`MergeResult` interfaces
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 5.2, 5.3, 5.4, 5.5, 5.6, 8.3_

  - [ ]* 3.3 Write property test for only-fill-if-empty merge
    - File: `src/lib/oauth-sync.test.ts`
    - **Property 1: Only-fill-if-empty merge**
    - **Validates: Requirements 1.2, 1.4, 1.6, 1.3, 1.5, 1.7, 3.1, 3.2, 3.3, 3.4, 3.6, 3.7**

  - [ ]* 3.4 Write property test for phoneVerified-iff-just-filled
    - File: `src/lib/oauth-sync.test.ts`
    - **Property 2: phoneVerified iff phone was just filled**
    - **Validates: Requirements 3.5, 1.2, 1.6**

  - [ ]* 3.5 Write property test for Yandex phone normalization
    - File: `src/lib/oauth-sync.test.ts`
    - **Property 3: Yandex phone normalization**
    - **Validates: Requirements 1.2**

  - [ ]* 3.6 Write property test for Yandex avatar URL construction and extraction
    - File: `src/lib/oauth-sync.test.ts`
    - **Property 4: Yandex avatar URL construction**
    - **Validates: Requirements 1.3, 1.5**

  - [ ]* 3.7 Write property test for Google primary phone extraction
    - File: `src/lib/oauth-sync.test.ts`
    - **Property 5: Google primary phone extraction**
    - **Validates: Requirements 2.2, 2.3**

  - [ ]* 3.8 Write property test for OAuth sync provider gating
    - File: `src/lib/oauth-sync.test.ts`
    - **Property 6: OAuth sync provider gating**
    - **Validates: Requirements 8.1, 8.3**

  - [ ]* 3.9 Write property test for token image normalization
    - File: `src/lib/oauth-sync.test.ts`
    - **Property 7: Token image normalization**
    - **Validates: Requirements 5.2, 5.3, 5.4, 5.5**

  - [ ]* 3.10 Write property test for session image mapping
    - File: `src/lib/oauth-sync.test.ts`
    - **Property 8: Session image mapping**
    - **Validates: Requirements 5.6**

  - [ ]* 3.11 Write unit tests for documented edge cases
    - File: `src/lib/oauth-sync.test.ts`
    - Cover empty string vs. whitespace-only vs. `null`, a phone with a leading `+`, and an avatar id containing special characters for `mergeOAuthProfileIntoUser`, `normalizePhoneDigitsOnly`, `extractYandexProviderData`, and `resolveTokenImage`
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3, 3.4_

- [ ] 4. Isolated Google People API helper
  - [ ] 4.1 Implement `src/lib/google-people.ts`
    - `fetchGooglePhoneNumbers(accessToken)`: fetch People API, return `phoneNumbers` array or `null` on non-2xx/network error, `console.warn` on failure, never throw
    - _Requirements: 2.1 (supports), 2.3_

  - [ ]* 4.2 Write mocked-fetch tests for `fetchGooglePhoneNumbers`
    - File: `src/lib/google-people.test.ts`
    - Cases: successful response with phone numbers, empty/missing `phoneNumbers` body, non-2xx (403) response, network-rejected `fetch`
    - _Requirements: 2.3_

- [ ] 5. Checkpoint - Ensure all tests pass, ask the user if questions arise.

- [ ] 6. NextAuth type augmentation and session callback (`src/auth.config.ts`)
  - [ ] 6.1 Extend `Session`/`User` type augmentation and the session callback
    - Add `image?: string | null` to both `Session.user` and `User` interfaces in the `declare module 'next-auth'` block
    - Update `callbacks.session` to set `session.user.image = resolveSessionImage(token.image as string | null | undefined)`, importing `resolveSessionImage` from `./lib/oauth-sync`
    - _Requirements: 5.1, 5.6_

- [ ] 7. Provider configuration and JWT callback rewrite (`src/auth.ts`)
  - [ ] 7.1 Update Yandex/Google provider configs and rewrite the `jwt` callback
    - Yandex: add `login:phone` to the `authorization` scope string; add a custom `profile()` that calls `extractYandexProviderData` and returns `image`/`phoneNumber` alongside `id`/`name`/`email`
    - Google: add `https://www.googleapis.com/auth/user.phonenumbers.read` to the `authorization.params.scope`
    - `jwt` callback: branch on `isOAuthSyncProvider(account?.provider)`; for Google, best-effort call `fetchGooglePhoneNumbers` + `extractGooglePrimaryPhone` only when `!dbUser?.phone`; build `incoming: OAuthProfileData`; on user creation pass `avatarUrl`/`phone` into `createUser`; on existing user call `mergeOAuthProfileIntoUser` and persist via `updateUser` only when `phoneChanged || avatarChanged`; set `token.image = resolveTokenImage(dbUser.avatarUrl)`
    - Credentials branch: `Credentials.authorize()` returns `image: user.avatarUrl`; `jwt` callback sets `token.image = resolveTokenImage(user.image)` instead of the previous always-`undefined` assignment
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1, 2.2, 2.3, 2.4, 2.5, 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 5.2, 5.3, 5.4, 5.5, 8.1, 8.2, 8.3_

  - [ ]* 7.2 Write example test asserting configured provider scope strings
    - File: `src/auth.test.ts`
    - Assert the Yandex provider's `authorization` string contains `login:phone` (plus existing scopes) and the Google provider's `authorization.params.scope` contains `user.phonenumbers.read`
    - _Requirements: 1.1, 2.1_

- [ ] 8. Checkpoint - Ensure all tests pass, ask the user if questions arise.

- [ ] 9. Allow-list avatar image hosts in `next.config.ts`
  - [ ] 9.1 Add `remotePatterns` entries for `avatars.yandex.net` and `lh3.googleusercontent.com`
    - Follow the existing `remotePatterns` entry shape (`protocol: "https"`, `hostname`, `pathname: "/**"`)
    - _Requirements: 7.1 (supports rendering of externally-hosted avatars)_

- [ ] 10. `UserAvatar` component and profile page integration
  - [ ] 10.1 Create `src/components/sections/profile/user-avatar.tsx`
    - `UserAvatarProps { avatarUrl: string | null; alt: string }`, `FC<UserAvatarProps>` export
    - Render nothing when `avatarUrl` is `null`/blank or the image previously failed to load (`useState` + `onError` handler)
    - Render a 40×40 circular `next/image` (`rounded-full object-cover`) with the provided non-empty `alt` text otherwise
    - _Requirements: 7.1, 7.4_

  - [ ] 10.2 Integrate `UserAvatar` into the "Основная информация" block of `src/app/profile/page.tsx`
    - Render `<UserAvatar avatarUrl={dbUser?.avatarUrl ?? null} alt={...} />` immediately before the user's name, inside the existing block, in the same row
    - No avatar image markup renders when `avatarUrl` is `null`/empty
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ]* 10.3 Write component tests for `UserAvatar`
    - File: `src/components/sections/profile/user-avatar.test.tsx`
    - Cases: valid `avatarUrl` renders the image with expected `alt`/size classes; `avatarUrl={null}` renders nothing; firing the image's `onError` event removes the image
    - _Requirements: 7.1, 7.2, 7.4_

- [ ]* 11. Regression coverage for manual profile update (Requirement 6 / Property 10)
  - [ ]* 11.1 Write property test for `updateUserProfile`'s phoneVerified reset behavior
    - File: `src/app/actions/profile.test.ts` (mock `@/lib/db-prisma`'s `getUserById`/`updateUser` and `@/auth`'s `auth`)
    - **Property 10: Manual phone update always resets verification correctly**
    - **Validates: Requirements 6.1, 6.2**

- [ ] 12. Final checkpoint - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional (tests) and can be skipped for a faster MVP; core implementation tasks (unmarked) are required.
- Property tests validate the universal correctness properties from `design.md`; unit tests cover the documented specific edge cases alongside them.
- `src/lib/oauth-sync.test.ts` is written incrementally across tasks 3.3–3.11 (one property/case group per task) since all of them touch the same file.
- Task 7.1 is the integration point where Requirements 1, 2, 3, 5, and 8 all come together; it depends on the pure `oauth-sync.ts` module (task 3.2), the `google-people.ts` helper (task 4.1), the `db-prisma.ts` `avatarUrl` support (task 2.1), and the `auth.config.ts` type augmentation (task 6.1).
- Task 11 covers Requirement 6 purely as a regression test — `src/app/actions/profile.ts` already implements the phoneVerified-reset behavior; no production code change is required for this task.

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2", "3.1", "3.2", "4.1", "9.1", "10.1"] },
    { "id": 1, "tasks": ["2.1", "3.3", "4.2", "6.1", "10.3", "11.1"] },
    { "id": 2, "tasks": ["2.2", "3.4", "7.1", "10.2"] },
    { "id": 3, "tasks": ["3.5", "7.2"] },
    { "id": 4, "tasks": ["3.6"] },
    { "id": 5, "tasks": ["3.7"] },
    { "id": 6, "tasks": ["3.8"] },
    { "id": 7, "tasks": ["3.9"] },
    { "id": 8, "tasks": ["3.10"] },
    { "id": 9, "tasks": ["3.11"] }
  ]
}
```
