import fc from 'fast-check';
import { describe, it, expect } from 'vitest';
import {
    mergeOAuthProfileIntoUser,
    normalizePhoneDigitsOnly,
    buildYandexAvatarUrl,
    extractYandexProviderData,
    extractGooglePrimaryPhone,
    isOAuthSyncProvider,
    resolveTokenImage,
    resolveSessionImage,
} from './oauth-sync';

const isBlank = (value: string | null | undefined): boolean =>
    value === null || value === undefined || value.trim() === '';

// A string arbitrary that also produces null/undefined and whitespace-only values.
const maybeBlankString = fc.oneof(
    fc.string(),
    fc.constant(null),
    fc.constant(undefined as unknown as string),
    fc.constantFrom('', '   ', '\t', '\n  ')
);

const stateArb = fc.record({
    phone: maybeBlankString,
    avatarUrl: maybeBlankString,
});

const incomingArb = fc.record({
    phone: maybeBlankString,
    avatarUrl: maybeBlankString,
});

// Feature: oauth-phone-avatar-sync, Property 1: Only-fill-if-empty merge
describe('mergeOAuthProfileIntoUser — Property 1: only-fill-if-empty', () => {
    it('leaves non-blank fields unchanged and fills blank fields only from non-blank incoming', () => {
        fc.assert(
            fc.property(stateArb, incomingArb, (current, incoming) => {
                const result = mergeOAuthProfileIntoUser(current, incoming);

                // Phone
                if (!isBlank(current.phone)) {
                    expect(result.phone).toBe(current.phone);
                    expect(result.phoneChanged).toBe(false);
                } else if (!isBlank(incoming.phone)) {
                    expect(result.phone).toBe(incoming.phone);
                    expect(result.phoneChanged).toBe(true);
                } else {
                    expect(result.phone).toBe(current.phone);
                    expect(result.phoneChanged).toBe(false);
                }

                // Avatar
                if (!isBlank(current.avatarUrl)) {
                    expect(result.avatarUrl).toBe(current.avatarUrl);
                    expect(result.avatarChanged).toBe(false);
                } else if (!isBlank(incoming.avatarUrl)) {
                    expect(result.avatarUrl).toBe(incoming.avatarUrl);
                    expect(result.avatarChanged).toBe(true);
                } else {
                    expect(result.avatarUrl).toBe(current.avatarUrl);
                    expect(result.avatarChanged).toBe(false);
                }
            }),
            { numRuns: 200 }
        );
    });
});

// Feature: oauth-phone-avatar-sync, Property 2: phoneVerified iff phone was just filled
describe('mergeOAuthProfileIntoUser — Property 2: phoneVerified iff just filled', () => {
    it('sets phoneVerified=true exactly when phoneChanged, otherwise undefined', () => {
        fc.assert(
            fc.property(stateArb, incomingArb, (current, incoming) => {
                const result = mergeOAuthProfileIntoUser(current, incoming);
                const justFilled = isBlank(current.phone) && !isBlank(incoming.phone);
                expect(result.phoneChanged).toBe(justFilled);
                expect(result.phoneVerified).toBe(justFilled ? true : undefined);
            }),
            { numRuns: 200 }
        );
    });
});

// Feature: oauth-phone-avatar-sync, Property 3: Yandex phone normalization
describe('normalizePhoneDigitsOnly — Property 3', () => {
    it('returns only digits, preserving order and dropping every non-digit', () => {
        fc.assert(
            fc.property(fc.string(), (raw) => {
                const result = normalizePhoneDigitsOnly(raw);
                // only digits
                expect(/^\d*$/.test(result)).toBe(true);
                // equals the digit subsequence of raw
                const expected = (raw.match(/\d/g) ?? []).join('');
                expect(result).toBe(expected);
            }),
            { numRuns: 200 }
        );
    });
});

// Feature: oauth-phone-avatar-sync, Property 4: Yandex avatar URL construction
describe('buildYandexAvatarUrl / extractYandexProviderData — Property 4', () => {
    it('builds a well-formed Yandex avatar URL containing the id', () => {
        fc.assert(
            fc.property(
                fc.string({ minLength: 1 }).filter((s) => s.trim() !== ''),
                (avatarId) => {
                    const url = buildYandexAvatarUrl(avatarId);
                    expect(url.startsWith('https://avatars.yandex.net/get-yapic/')).toBe(true);
                    expect(url.endsWith('/islands-200')).toBe(true);
                    expect(url).toContain(avatarId);
                }
            ),
            { numRuns: 200 }
        );
    });

    it('returns non-null avatarUrl iff is_avatar_empty is falsy and default_avatar_id is non-empty', () => {
        fc.assert(
            fc.property(
                fc.record({
                    is_avatar_empty: fc.option(fc.boolean(), { nil: undefined }),
                    default_avatar_id: fc.option(fc.string(), { nil: undefined }),
                }),
                (profile) => {
                    const { avatarUrl } = extractYandexProviderData(profile);
                    const shouldHaveAvatar =
                        !profile.is_avatar_empty &&
                        typeof profile.default_avatar_id === 'string' &&
                        profile.default_avatar_id.length > 0;
                    expect(avatarUrl !== null).toBe(shouldHaveAvatar);
                }
            ),
            { numRuns: 200 }
        );
    });
});

// Feature: oauth-phone-avatar-sync, Property 5: Google primary phone extraction
describe('extractGooglePrimaryPhone — Property 5', () => {
    it('returns first non-blank value or null', () => {
        fc.assert(
            fc.property(
                fc.oneof(
                    fc.constant(null),
                    fc.constant(undefined),
                    fc.array(fc.record({ value: fc.option(fc.string(), { nil: undefined }) }))
                ),
                (phoneNumbers) => {
                    const result = extractGooglePrimaryPhone(
                        phoneNumbers as Array<{ value?: string }> | null | undefined
                    );
                    const first = phoneNumbers?.[0]?.value;
                    if (first && first.trim() !== '') {
                        expect(result).toBe(first);
                    } else {
                        expect(result).toBe(null);
                    }
                }
            ),
            { numRuns: 200 }
        );
    });
});

// Feature: oauth-phone-avatar-sync, Property 6: OAuth sync provider gating
describe('isOAuthSyncProvider — Property 6', () => {
    it('returns true iff provider is exactly google or yandex', () => {
        fc.assert(
            fc.property(
                fc.oneof(
                    fc.constantFrom('google', 'yandex', 'credentials', 'github', ''),
                    fc.string(),
                    fc.constant(undefined)
                ),
                (provider) => {
                    const expected = provider === 'google' || provider === 'yandex';
                    expect(isOAuthSyncProvider(provider as string | undefined)).toBe(expected);
                }
            ),
            { numRuns: 200 }
        );
    });
});

// Feature: oauth-phone-avatar-sync, Property 7: Token image normalization
describe('resolveTokenImage — Property 7', () => {
    it('returns null for blank values and the exact value otherwise', () => {
        fc.assert(
            fc.property(maybeBlankString, (value) => {
                const result = resolveTokenImage(value);
                if (isBlank(value)) {
                    expect(result).toBe(null);
                } else {
                    expect(result).toBe(value);
                }
            }),
            { numRuns: 200 }
        );
    });
});

// Feature: oauth-phone-avatar-sync, Property 8: Session image mapping
describe('resolveSessionImage — Property 8', () => {
    it('returns the value for string/null and null for undefined', () => {
        fc.assert(
            fc.property(
                fc.oneof(fc.string(), fc.constant(null), fc.constant(undefined)),
                (value) => {
                    const result = resolveSessionImage(value as string | null | undefined);
                    if (value === undefined) {
                        expect(result).toBe(null);
                    } else {
                        expect(result).toBe(value);
                    }
                }
            ),
            { numRuns: 200 }
        );
    });
});

// Documented edge cases (unit tests)
describe('oauth-sync — documented edge cases', () => {
    it('mergeOAuthProfileIntoUser treats whitespace-only current phone as blank', () => {
        const result = mergeOAuthProfileIntoUser(
            { phone: '   ', avatarUrl: null },
            { phone: '79991234567', avatarUrl: null }
        );
        expect(result.phone).toBe('79991234567');
        expect(result.phoneChanged).toBe(true);
        expect(result.phoneVerified).toBe(true);
    });

    it('mergeOAuthProfileIntoUser does not overwrite existing phone', () => {
        const result = mergeOAuthProfileIntoUser(
            { phone: '70000000000', avatarUrl: null },
            { phone: '79991234567', avatarUrl: null }
        );
        expect(result.phone).toBe('70000000000');
        expect(result.phoneChanged).toBe(false);
        expect(result.phoneVerified).toBe(undefined);
    });

    it('mergeOAuthProfileIntoUser ignores blank incoming values', () => {
        const result = mergeOAuthProfileIntoUser(
            { phone: null, avatarUrl: null },
            { phone: '', avatarUrl: '   ' }
        );
        expect(result.phone).toBe(null);
        expect(result.avatarUrl).toBe(null);
        expect(result.phoneChanged).toBe(false);
        expect(result.avatarChanged).toBe(false);
    });

    it('normalizePhoneDigitsOnly drops a leading +', () => {
        expect(normalizePhoneDigitsOnly('+7 (999) 123-45-67')).toBe('79991234567');
    });

    it('extractYandexProviderData normalizes a numeric phone and builds avatar url', () => {
        const result = extractYandexProviderData({
            default_phone: { number: '+7 999 123 45 67' },
            is_avatar_empty: false,
            default_avatar_id: 'abc/def+123',
        });
        expect(result.phone).toBe('79991234567');
        expect(result.avatarUrl).toBe(
            'https://avatars.yandex.net/get-yapic/abc/def+123/islands-200'
        );
    });

    it('extractYandexProviderData returns nulls when fields are missing or empty', () => {
        expect(extractYandexProviderData({})).toEqual({ phone: null, avatarUrl: null });
        expect(
            extractYandexProviderData({ default_phone: { number: '' }, is_avatar_empty: true })
        ).toEqual({ phone: null, avatarUrl: null });
        expect(
            extractYandexProviderData({ is_avatar_empty: false, default_avatar_id: '' })
        ).toEqual({ phone: null, avatarUrl: null });
    });

    it('resolveTokenImage distinguishes empty, whitespace and null from a real url', () => {
        expect(resolveTokenImage(null)).toBe(null);
        expect(resolveTokenImage(undefined)).toBe(null);
        expect(resolveTokenImage('')).toBe(null);
        expect(resolveTokenImage('   ')).toBe(null);
        expect(resolveTokenImage('https://example.com/a.png')).toBe(
            'https://example.com/a.png'
        );
    });
});
