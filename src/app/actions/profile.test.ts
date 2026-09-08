import fc from 'fast-check';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { AppUser } from '@/lib/types';

const authMock = vi.fn();
const getUserByIdMock = vi.fn();
const updateUserMock = vi.fn();

vi.mock('@/auth', () => ({
    auth: () => authMock(),
}));

vi.mock('@/lib/db-prisma', () => ({
    getUserById: (id: number) => getUserByIdMock(id),
    updateUser: (id: number, data: unknown) => updateUserMock(id, data),
}));

vi.mock('next/cache', () => ({
    revalidatePath: vi.fn(),
}));

import { updateUserProfile } from './profile';

const baseUser = (phone: string | null, phoneVerified: boolean): AppUser => ({
    id: 42,
    email: 'u@example.com',
    passwordHash: 'hash',
    name: 'Иван',
    phone,
    phoneVerified,
    phoneVerifyCode: '1234',
    phoneCodeExpires: new Date().toISOString(),
    avatarUrl: null,
    role: 'client',
    emailVerified: true,
    verificationToken: null,
    tokenExpiresAt: null,
    resetToken: null,
    resetTokenExpires: null,
    createdAt: new Date().toISOString(),
});

beforeEach(() => {
    vi.clearAllMocks();
    authMock.mockResolvedValue({ user: { id: '42' } });
    updateUserMock.mockResolvedValue(undefined);
});

// Feature: oauth-phone-avatar-sync, Property 10: manual phone update resets verification
describe('updateUserProfile — Property 10', () => {
    it('resets verification iff submitted phone differs from stored phone', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.oneof(fc.constant(null), fc.string()),
                fc.boolean(),
                fc.boolean(),
                async (storedPhone, storedVerified, sameAsStored) => {
                    vi.clearAllMocks();
                    authMock.mockResolvedValue({ user: { id: '42' } });
                    updateUserMock.mockResolvedValue(undefined);
                    getUserByIdMock.mockResolvedValue(baseUser(storedPhone, storedVerified));

                    // submitted phone must be truthy (non-empty) or the action rejects early.
                    const submittedPhone =
                        sameAsStored && storedPhone && storedPhone.length > 0
                            ? storedPhone
                            : `phone-${Math.random().toString(36).slice(2)}`;

                    const result = await updateUserProfile({
                        name: 'Иван',
                        phone: submittedPhone,
                    });

                    expect(result.success).toBe(true);
                    expect(updateUserMock).toHaveBeenCalledTimes(1);
                    const updateData = updateUserMock.mock.calls[0][1] as Record<string, unknown>;

                    if (submittedPhone !== storedPhone) {
                        expect(updateData.phoneVerified).toBe(false);
                        expect(updateData.phoneVerifyCode).toBe(null);
                        expect(updateData.phoneCodeExpires).toBe(null);
                    } else {
                        expect('phoneVerified' in updateData).toBe(false);
                        expect('phoneVerifyCode' in updateData).toBe(false);
                        expect('phoneCodeExpires' in updateData).toBe(false);
                    }
                }
            ),
            { numRuns: 150 }
        );
    });
});
