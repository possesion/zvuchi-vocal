# Design Document

## Overview

This feature synchronizes `phone` and a new `avatarUrl` field from OAuth provider profiles (Google, Yandex) into the `User` record on sign-in, without ever overwriting values the user already has. It touches five layers:

1. **Data layer** — Prisma schema/migration for `avatarUrl`, plus `src/lib/types.ts` and `src/lib/db-prisma.ts`.
2. **Auth configuration** — `src/auth.config.ts` (Edge-safe type augmentation + session callback) and `src/auth.ts` (Node runtime: providers + JWT callback).
3. **Pure sync logic** — a new, side-effect-free module `src/lib/oauth-sync.ts` containing the "only fill if empty" merge rules, provider-profile extraction, and token/session mapping helpers. This is the module the correctness properties target directly.
4. **Google People API lookup** — a small isolated fetch helper for the phone number (I/O, tested with mocks/examples, not properties).
5. **UI** — the profile page's "Основная информация" block gains a conditional 40×40 circular avatar.

Extracting the merge/extraction logic into pure functions (`oauth-sync.ts`) is the key design decision: it lets the JWT callback stay a thin orchestrator while all business rules (Requirements 1, 2, 3, 5, 8) become unit/property-testable without mocking NextAuth or hitting a database.

## Architecture

```
                signIn (Google/Yandex)
                        │
                        ▼
        provider.profile() → { id, name, email, image, phoneNumber? }
                        │  (custom fields carried on the `user`/`profile` object)
                        ▼
        jwt callback (src/auth.ts)
        ├─ isOAuthSyncProvider(account.provider)?  ──false──▶ credentials/other path
        │           │ true
        │           ▼
        │  extractProviderData(provider, profile)         (oauth-sync.ts, pure)
        │           │
        │           ▼
        │  [Google only] fetchGooglePhoneNumber(accessToken)  (I/O, best-effort)
        │           │
        │           ▼
        │  getUserByEmail(email) → dbUser                 (db-prisma.ts)
        │           │
        │           ▼
        │  mergeOAuthProfileIntoUser(dbUser, incoming)     (oauth-sync.ts, pure)
        │           │
        │           ▼
        │  updateUser(dbUser.id, { phone?, phoneVerified?, avatarUrl? })  (only if changed)
        │           │
        │           ▼
        │  token.phone / token.image / token.role = merge result   (resolveTokenImage, pure)
        │
        ▼
        session callback (src/auth.config.ts)
                        │
                        ▼
        session.user.image = token.image ?? null
                        │
                        ▼
        Profile page reads session/dbUser.avatarUrl → renders circular avatar
```

Credentials sign-in never enters the `isOAuthSyncProvider` branch, satisfying Requirement 8.

## Components and Interfaces

### 1. Prisma schema (`prisma/schema.prisma`) + migration

```prisma
model User {
  id                Int       @id @default(autoincrement())
  email             String    @unique
  passwordHash      String
  name              String?
  phone             String?
  phoneVerified     Boolean   @default(false)
  phoneVerifyCode   String?
  phoneCodeExpires  DateTime?
  avatarUrl         String?   @db.VarChar(2048)
  role              String    @default("client")
  emailVerified     Boolean   @default(false)
  verificationToken String?   @unique
  tokenExpiresAt    DateTime?
  resetToken        String?   @unique
  resetTokenExpires DateTime?
  createdAt         DateTime  @default(now())

  contestVotes ContestVote[]

  @@index([verificationToken])
  @@index([resetToken])
}
```

New migration `prisma/migrations/<timestamp>_add_user_avatar_url/migration.sql`:

```sql
-- AlterTable
ALTER TABLE "User" ADD COLUMN "avatarUrl" VARCHAR(2048);
```

`avatarUrl` is nullable with no default clause, so Postgres implicitly defaults new/existing rows to `NULL` (Requirement 4.1).

### 2. `src/lib/types.ts`

```typescript
export interface AppUser {
  id: number
  email: string
  passwordHash: string
  name: string | null
  phone: string | null
  phoneVerified: boolean
  phoneVerifyCode: string | null
  phoneCodeExpires: string | null
  avatarUrl: string | null
  role: UserRole
  emailVerified: boolean
  verificationToken: string | null
  tokenExpiresAt: string | null
  resetToken: string | null
  resetTokenExpires: string | null
  createdAt: string
}

export type UserUpdateData = Partial<Pick<
    AppUser,
    | 'emailVerified' | 'verificationToken' | 'tokenExpiresAt' | 'role' | 'passwordHash'
    | 'name' | 'phone' | 'phoneVerified' | 'phoneVerifyCode' | 'phoneCodeExpires'
    | 'avatarUrl'
>>
```

### 3. `src/lib/db-prisma.ts`

`createUser` gains an optional `avatarUrl` parameter (Requirements 4.4, 4.5):

```typescript
export async function createUser(data: {
  email: string;
  passwordHash: string;
  phone?: string | null;
  avatarUrl?: string | null;
  role?: UserRole;
  verificationToken?: string;
  tokenExpiresAt?: string;
}): Promise<AppUser> {
  const prisma = getPrisma();
  const created = await prisma.user.create({
    data: {
      email: data.email,
      phone: data.phone ?? null,
      avatarUrl: data.avatarUrl ?? null,
      passwordHash: data.passwordHash,
      role: data.role ?? 'client',
      emailVerified: false,
      phoneVerified: data.phone ? true : false,
      verificationToken: data.verificationToken ?? null,
      tokenExpiresAt: data.tokenExpiresAt ? new Date(data.tokenExpiresAt) : null,
    },
  });

  return mapUserRowToAppUser(created);
}
```

`updateUser` follows the existing spread-conditional pattern already used for `phone`, `name`, etc. (Requirements 4.6, 4.7):

```typescript
await prisma.user.update({
  where: { id },
  data: {
    // ...existing conditional fields...
    ...(data.avatarUrl !== undefined && { avatarUrl: data.avatarUrl }),
  },
});
```

Because `avatarUrl` is only included in the Prisma `data` object when the caller's `UserUpdateData` explicitly has the key (checked via `!== undefined`), omitting the key leaves the column untouched, while passing `null` clears it — matching the pattern already proven for `phone`/`resetToken`.

All five row→`AppUser` mapping call sites (`getUserByEmail`, `getUserById`, `getAllUsers`, `getUserByVerificationToken`, `getUserByResetToken`) — plus `createUser`/`updateUser`'s returned object — add `avatarUrl: user.avatarUrl` to the returned literal (Requirement 4.8). To avoid repeating the ~15-line mapping five times (it's already duplicated for the other fields in the current file), the design keeps the existing per-function inline mapping style for consistency with the rest of the file rather than introducing a new shared helper, and simply adds the one field to each existing literal.

### 4. `src/lib/oauth-sync.ts` (new, pure module — the testable core)

```typescript
export interface OAuthProfileData {
  phone: string | null;
  avatarUrl: string | null;
}

export interface UserPhoneAvatarState {
  phone: string | null;
  avatarUrl: string | null;
}

export interface MergeResult {
  phone: string | null;
  avatarUrl: string | null;
  /** true when phone was just filled from empty and should be marked verified; undefined = no change to phoneVerified */
  phoneVerified: true | undefined;
  phoneChanged: boolean;
  avatarChanged: boolean;
}

const isBlank = (value: string | null | undefined): boolean =>
  value === null || value === undefined || value.trim() === '';

/**
 * Requirement 3: fills phone/avatarUrl only when the current value is empty.
 * Never overwrites an existing non-empty value. Setting phone from empty
 * always marks it verified (Requirement 3.5).
 */
export function mergeOAuthProfileIntoUser(
  current: UserPhoneAvatarState,
  incoming: OAuthProfileData
): MergeResult {
  const canFillPhone = isBlank(current.phone) && !isBlank(incoming.phone);
  const canFillAvatar = isBlank(current.avatarUrl) && !isBlank(incoming.avatarUrl);

  return {
    phone: canFillPhone ? incoming.phone : current.phone,
    avatarUrl: canFillAvatar ? incoming.avatarUrl : current.avatarUrl,
    phoneVerified: canFillPhone ? true : undefined,
    phoneChanged: canFillPhone,
    avatarChanged: canFillAvatar,
  };
}

/** Requirement 1.2: strip everything but digits (drops leading '+'). */
export function normalizePhoneDigitsOnly(raw: string): string {
  return raw.replace(/\D/g, '');
}

/** Requirement 1.3: Yandex Avatars API URL format. */
export function buildYandexAvatarUrl(avatarId: string): string {
  return `https://avatars.yandex.net/get-yapic/${avatarId}/islands-200`;
}

interface YandexRawProfile {
  default_phone?: { number?: string | number };
  is_avatar_empty?: boolean;
  default_avatar_id?: string;
}

/** Requirements 1.2–1.5. */
export function extractYandexProviderData(profile: YandexRawProfile): OAuthProfileData {
  const rawPhone = profile.default_phone?.number;
  const phone = rawPhone !== undefined && rawPhone !== null && String(rawPhone).trim() !== ''
    ? normalizePhoneDigitsOnly(String(rawPhone))
    : null;

  const avatarUrl = !profile.is_avatar_empty && profile.default_avatar_id
    ? buildYandexAvatarUrl(profile.default_avatar_id)
    : null;

  return { phone, avatarUrl };
}

/** Requirement 2.2: first entry is the primary phone number. */
export function extractGooglePrimaryPhone(
  phoneNumbers: Array<{ value?: string }> | null | undefined
): string | null {
  const first = phoneNumbers?.[0]?.value;
  return first && first.trim() !== '' ? first : null;
}

/** Requirement 8.3: which providers trigger OAuth_Sync_Service. */
export function isOAuthSyncProvider(provider: string | undefined): boolean {
  return provider === 'google' || provider === 'yandex';
}

/** Requirements 5.3, 5.5: '' and null/undefined all collapse to null. */
export function resolveTokenImage(avatarUrl: string | null | undefined): string | null {
  return avatarUrl && avatarUrl.trim() !== '' ? avatarUrl : null;
}

/** Requirement 5.6: session callback mapping. */
export function resolveSessionImage(tokenImage: string | null | undefined): string | null {
  return tokenImage ?? null;
}
```

### 5. `src/lib/google-people.ts` (new, isolated I/O helper)

```typescript
interface GooglePeoplePhoneNumber {
  value?: string;
}

interface GooglePeopleResponse {
  phoneNumbers?: GooglePeoplePhoneNumber[];
}

/**
 * Best-effort lookup — People API access requires the
 * user.phonenumbers.read scope and often requires app verification
 * in Google Cloud Console, so failures are expected and non-fatal (Req 2.3).
 */
export async function fetchGooglePhoneNumbers(
  accessToken: string
): Promise<GooglePeoplePhoneNumber[] | null> {
  try {
    const res = await fetch(
      'https://people.googleapis.com/v1/people/me?personFields=phoneNumbers',
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as GooglePeopleResponse;
    return data.phoneNumbers ?? null;
  } catch (error) {
    console.warn('[oauth-sync] Google People API lookup failed:', error);
    return null;
  }
}
```

### 6. `src/auth.config.ts` — type augmentation + session callback

```typescript
declare module 'next-auth' {
    interface Session {
        user: {
            id: string
            email: string
            name?: string | null
            phone?: string | null
            image?: string | null
            role: UserRole
        }
    }
    interface User {
        id?: string
        email?: string | null
        name?: string | null
        phone?: string | null
        image?: string | null
        emailVerified?: boolean
        role: UserRole
    }
}
```

```typescript
import { resolveSessionImage } from './lib/oauth-sync'

// ...
callbacks: {
    session({ session, token }) {
        if (token) {
            session.user.id = token.id as string
            session.user.name = token.name as string | null
            session.user.phone = token.phone as string | null
            session.user.image = resolveSessionImage(token.image as string | null | undefined)
            session.user.role = token.role as UserRole
        }
        return session
    },
    authorized({ auth }) {
        return !!auth
    },
},
```

### 7. `src/auth.ts` — providers and JWT callback

**Yandex provider** — add `login:phone` scope and a custom `profile()` that also surfaces the raw phone/avatar fields so they reach the `user` object in the `jwt` callback:

```typescript
YandexProvider({
    clientId: process.env.YANDEX_CLIENT_ID,
    clientSecret: process.env.YANDEX_CLIENT_SECRET,
    authorization:
        'https://oauth.yandex.ru/authorize?scope=login:info+login:email+login:avatar+login:phone',
    profile(profile) {
        const { phone, avatarUrl } = extractYandexProviderData(profile)
        return {
            id: profile.id,
            name: profile.display_name ?? profile.real_name ?? profile.first_name,
            email: profile.default_email ?? profile.emails?.[0] ?? null,
            image: avatarUrl,
            phoneNumber: phone,
        }
    },
}),
```

**Google provider** — add the People API phone scope (Requirement 2.1). The default `profile()` mapping already sets `image: profile.picture`, so Requirement 2.4/2.5 need no override:

```typescript
Google({
    clientId: process.env.GOOGLE_CLIENT_ID!,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    authorization: {
        params: {
            scope: 'openid email profile https://www.googleapis.com/auth/user.phonenumbers.read',
        },
    },
}),
```

**JWT callback** — orchestrates the pure helpers; this is where Requirements 3, 5, 8 meet:

```typescript
async jwt({ token, user, account }) {
    if (isOAuthSyncProvider(account?.provider) && user?.email) {
        let dbUser = await getUserByEmail(user.email)

        // Best-effort Google phone lookup — only worth the network call
        // when we could actually use the result (phone still empty).
        let googlePhone: string | null = null
        if (account?.provider === 'google' && account.access_token && !dbUser?.phone) {
            const phoneNumbers = await fetchGooglePhoneNumbers(account.access_token)
            googlePhone = extractGooglePrimaryPhone(phoneNumbers)
        }

        const incoming: OAuthProfileData = {
            phone: account?.provider === 'yandex'
                ? (user as { phoneNumber?: string | null }).phoneNumber ?? null
                : googlePhone,
            avatarUrl: user.image ?? null,
        }

        if (!dbUser) {
            const unusableHash = `${account?.provider}:${crypto.randomUUID()}`
            dbUser = await createUser({
                email: user.email,
                phone: incoming.phone,
                avatarUrl: incoming.avatarUrl,
                passwordHash: unusableHash,
                role: 'client',
            })
            await updateUser(dbUser.id, { emailVerified: true })
        } else {
            const merged = mergeOAuthProfileIntoUser(
                { phone: dbUser.phone, avatarUrl: dbUser.avatarUrl },
                incoming
            )
            if (merged.phoneChanged || merged.avatarChanged) {
                await updateUser(dbUser.id, {
                    ...(merged.phoneChanged && { phone: merged.phone, phoneVerified: true }),
                    ...(merged.avatarChanged && { avatarUrl: merged.avatarUrl }),
                })
            }
            dbUser = { ...dbUser, phone: merged.phone, avatarUrl: merged.avatarUrl }
        }

        token.id = String(dbUser.id)
        token.name = dbUser.name
        token.phone = dbUser.phone
        token.image = resolveTokenImage(dbUser.avatarUrl)
        token.emailVerified = dbUser.emailVerified
        token.role = dbUser.role as UserRole
        return token
    }

    // Credentials sign-in: user is only populated on first authorize() call.
    if (user) {
        token.id = user.id as string
        token.name = user.name
        token.phone = user.phone
        token.emailVerified = user.emailVerified
        token.image = resolveTokenImage(user.image)
        token.role = user.role as UserRole
    }

    return token
},
```

The previous `token.image = user.image` line (which was always `undefined` because `image` was never populated on the credentials `User`) is replaced by `resolveTokenImage(user.image)`, and `Credentials.authorize()` now returns `image: user.avatarUrl` so the value is meaningful (Requirements 5.4, 5.5):

```typescript
return {
    id: String(user.id),
    email: user.email,
    name: user.name,
    phone: user.phone,
    image: user.avatarUrl,
    emailVerified: user.emailVerified,
    role: user.role as UserRole,
}
```

### 8. Profile page avatar (`src/app/profile/page.tsx`)

A small new client component keeps the `onError` fallback (Requirement 7.4) contained and typed:

```typescript
// src/components/sections/profile/user-avatar.tsx
'use client';

import Image from 'next/image';
import { FC, useState } from 'react';

interface UserAvatarProps {
    avatarUrl: string | null;
    alt: string;
}

export const UserAvatar: FC<UserAvatarProps> = ({ avatarUrl, alt }) => {
    const [failed, setFailed] = useState(false);

    if (!avatarUrl || avatarUrl.trim() === '' || failed) return null;

    return (
        <Image
            src={avatarUrl}
            alt={alt}
            width={40}
            height={40}
            className="rounded-full object-cover"
            onError={() => setFailed(true)}
        />
    );
};
```

Usage in the "Основная информация" block, directly before the user's name:

```tsx
<div className="mb-4 flex items-center gap-3">
    <UserAvatar avatarUrl={dbUser?.avatarUrl ?? null} alt={`Аватар пользователя ${dbUser?.name ?? ''}`} />
    {/* existing name display / ProfileEditForm */}
</div>
```

Using `next/image` requires the avatar's host (e.g. `avatars.yandex.net`, `lh3.googleusercontent.com`) to be allow-listed in `next.config.ts`'s `images.remotePatterns`. This is a one-line config addition alongside the existing S3/Google Drive entries — flagged here since it's an infra-adjacent change outside the app code.

## Data Models

```
User (Prisma model, extended)
├── ...existing fields...
└── avatarUrl: String? @db.VarChar(2048)   // NEW, nullable, no default (→ NULL)

AppUser (TypeScript interface, extended)
└── avatarUrl: string | null                // NEW

UserUpdateData (TypeScript type, extended)
└── avatarUrl?: string | null                // NEW, optional partial-update key
```

No new tables. No changes to existing column types or constraints.

## Error Handling

- **Google People API failures** (network error, non-2xx, missing scope grant): caught in `fetchGooglePhoneNumbers`, logged with `console.warn`, resolved to `null`. Sign-in proceeds normally (Requirement 2.3).
- **Yandex/Google profile missing phone or avatar fields**: `extractYandexProviderData`/`extractGooglePrimaryPhone` return `null` for the missing piece; `mergeOAuthProfileIntoUser` treats `null`/blank incoming values as "nothing to fill" — no DB write, no error (Requirements 1.4, 1.5).
- **Avatar image fails to load in the browser**: `UserAvatar`'s `onError` sets local `failed` state and renders `null` — no error surfaced to the user (Requirement 7.4).
- **Database update failures during sync**: `updateUser`/`createUser` calls inside the `jwt` callback are not wrapped in a try/catch beyond what NextAuth already does; a thrown error here fails the sign-in attempt, consistent with how the existing Google-user-creation code already behaves (no silent partial state).

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Only-fill-if-empty merge

For any current user state `{phone, avatarUrl}` and any incoming OAuth profile data `{phone, avatarUrl}`, `mergeOAuthProfileIntoUser` SHALL leave each field unchanged whenever its current value is non-blank, and SHALL replace each field with the incoming value only when its current value is blank (`null`, `undefined`, or whitespace-only) and the incoming value is non-blank.

**Validates: Requirements 1.2, 1.4, 1.6, 1.3, 1.5, 1.7, 3.1, 3.2, 3.3, 3.4, 3.6, 3.7**

### Property 2: phoneVerified iff phone was just filled

For any current user state and any incoming OAuth profile data, `mergeOAuthProfileIntoUser` SHALL set `phoneVerified` to `true` if and only if the phone field was blank beforehand and became non-blank as a result of the merge (`phoneChanged === true`); otherwise `phoneVerified` SHALL be `undefined` (no change).

**Validates: Requirements 3.5, 1.2, 1.6**

### Property 3: Yandex phone normalization

For any string containing digits, `+`, spaces, or other punctuation, `normalizePhoneDigitsOnly` SHALL return a string containing only decimal digit characters, preserving their original relative order and omitting every non-digit character (including any leading `+`).

**Validates: Requirements 1.2**

### Property 4: Yandex avatar URL construction

For any non-empty avatar id string, `buildYandexAvatarUrl` SHALL return a URL that starts with `https://avatars.yandex.net/get-yapic/`, contains the given id as a path segment, and ends with `/islands-200`; and for any Yandex profile, `extractYandexProviderData` SHALL return a non-null `avatarUrl` if and only if `is_avatar_empty` is falsy and `default_avatar_id` is a non-empty string.

**Validates: Requirements 1.3, 1.5**

### Property 5: Google primary phone extraction

For any list of phone number entries (including empty, `null`, `undefined`, or entries with blank `value`), `extractGooglePrimaryPhone` SHALL return the `value` of the first entry when that value is non-blank, and SHALL return `null` when the list is empty, absent, or its first entry has no usable value.

**Validates: Requirements 2.2, 2.3**

### Property 6: OAuth sync provider gating

For any provider identifier string (including `'google'`, `'yandex'`, `'credentials'`, arbitrary other strings, and `undefined`), `isOAuthSyncProvider` SHALL return `true` if and only if the identifier is exactly `'google'` or exactly `'yandex'`.

**Validates: Requirements 8.1, 8.3**

### Property 7: Token image normalization

For any avatar URL value (`null`, `undefined`, empty string, whitespace-only string, or a non-empty URL string), `resolveTokenImage` SHALL return `null` when the value is `null`, `undefined`, or blank, and SHALL return the exact value unchanged when it is non-blank.

**Validates: Requirements 5.2, 5.3, 5.4, 5.5**

### Property 8: Session image mapping

For any `token.image` value (`null`, `undefined`, or any string), `resolveSessionImage` SHALL return that value unchanged when it is a string or `null`, and SHALL return `null` when it is `undefined`.

**Validates: Requirements 5.6**

### Property 9: db-prisma avatarUrl fidelity

For any user created via `createUser` with an `avatarUrl` of `undefined`, `null`, or a non-empty string, retrieving that user via any of `getUserByEmail`, `getUserById`, `getAllUsers`, `getUserByVerificationToken`, `getUserByResetToken` SHALL return an `AppUser` whose `avatarUrl` equals the stored value (`undefined` input normalizing to stored `null`). For any subsequent `updateUser` call, the retrieved `avatarUrl` SHALL change to the call's `avatarUrl` value when the update object contains the `avatarUrl` key (including when that value is `null`), and SHALL remain unchanged when the update object omits the `avatarUrl` key.

**Validates: Requirements 4.4, 4.5, 4.6, 4.7, 4.8**

### Property 10: Manual phone update always resets verification correctly

For any stored phone value and any submitted phone value (regardless of the stored `phoneVerified` value, including `true` set by OAuth sync), `updateUserProfile`'s computed update object SHALL include `phoneVerified: false, phoneVerifyCode: null, phoneCodeExpires: null` when the submitted phone differs from the stored phone, and SHALL omit all three keys when the submitted phone equals the stored phone.

**Validates: Requirements 6.1, 6.2**

## Testing Strategy

**Property tests** (`src/lib/oauth-sync.test.ts`, `src/lib/db-prisma.test.ts`, `src/app/actions/profile.test.ts`) use [fast-check](https://github.com/dubzzz/fast-check) — not yet a project dependency, to be added as a pinned devDependency (e.g. `"fast-check": "3.23.2"`) — with a minimum of 100 runs per property, tagged per the project convention:

```typescript
import fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import { mergeOAuthProfileIntoUser } from './oauth-sync';

// Feature: oauth-phone-avatar-sync, Property 1: Only-fill-if-empty merge
describe('mergeOAuthProfileIntoUser', () => {
    it('never overwrites a non-blank existing value', () => {
        fc.assert(
            fc.property(
                fc.record({ phone: fc.option(fc.string(), { nil: null }), avatarUrl: fc.option(fc.string(), { nil: null }) }),
                fc.record({ phone: fc.option(fc.string(), { nil: null }), avatarUrl: fc.option(fc.string(), { nil: null }) }),
                (current, incoming) => {
                    const result = mergeOAuthProfileIntoUser(current, incoming);
                    if (current.phone && current.phone.trim() !== '') expect(result.phone).toBe(current.phone);
                    if (current.avatarUrl && current.avatarUrl.trim() !== '') expect(result.avatarUrl).toBe(current.avatarUrl);
                }
            ),
            { numRuns: 100 }
        );
    });
});
```

`fetchGooglePhoneNumbers` (I/O) and the People API error/permission-denied paths (Requirement 2.3) are covered by **example/integration tests** with a mocked `fetch` returning success, empty body, 403, and network-rejection cases — not property tests, per the PBT guidance for external-service calls.

`UserAvatar` rendering (Requirement 7) is covered by **example-based component tests** (`@testing-library/react`, already a devDependency): one example with a valid `avatarUrl` asserting the `<img>`/`<Image>` renders with the expected `alt` and size classes, one with `avatarUrl={null}` asserting nothing renders, and one that fires the `onError` event and asserts the image disappears.

The Yandex/Google provider `authorization` scope strings (Requirements 1.1, 2.1) are covered by a single **example test** asserting the configured provider objects contain the expected scope substrings — a static configuration fact, not a property.

**Unit tests** for `mergeOAuthProfileIntoUser`, `normalizePhoneDigitsOnly`, `extractYandexProviderData`, and `resolveTokenImage` also include specific documented edge cases (empty string vs. whitespace-only vs. `null`, a phone with a leading `+`, an avatar id containing special characters) alongside the property tests, per the project's "unit tests for examples/edge cases, property tests for universal coverage" balance.
