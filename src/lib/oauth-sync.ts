/**
 * Pure, side-effect-free helpers for OAuth phone/avatar synchronization.
 *
 * This module contains all the business rules for the "only fill if empty"
 * merge behavior, provider-profile extraction, and token/session mapping.
 * Keeping it pure lets the NextAuth `jwt` callback stay a thin orchestrator
 * while these rules remain unit/property-testable without mocking NextAuth
 * or hitting a database.
 */

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
    const phone =
        rawPhone !== undefined && rawPhone !== null && String(rawPhone).trim() !== ''
            ? normalizePhoneDigitsOnly(String(rawPhone))
            : null;

    const avatarUrl =
        !profile.is_avatar_empty && profile.default_avatar_id
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
