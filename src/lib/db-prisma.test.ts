import fc from 'fast-check';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// ─── In-memory Prisma mock ──────────────────────────────────────────────────

interface Row {
    id: number;
    email: string;
    passwordHash: string;
    name: string | null;
    phone: string | null;
    phoneVerified: boolean;
    phoneVerifyCode: string | null;
    phoneCodeExpires: Date | null;
    avatarUrl: string | null;
    role: string;
    emailVerified: boolean;
    verificationToken: string | null;
    tokenExpiresAt: Date | null;
    resetToken: string | null;
    resetTokenExpires: Date | null;
    createdAt: Date;
}

const store = new Map<number, Row>();
let nextId = 1;

vi.mock('@prisma/adapter-pg', () => ({
    PrismaPg: class {
        constructor(_config: unknown) {
            void _config;
        }
    },
}));

vi.mock('../../prisma/generated/client', () => {
    class PrismaClient {
        constructor(_opts?: unknown) {
            void _opts;
        }
        user = {
            create: async ({ data }: { data: Partial<Row> }) => {
                const row: Row = {
                    id: nextId++,
                    email: data.email as string,
                    passwordHash: (data.passwordHash as string) ?? '',
                    name: data.name ?? null,
                    phone: data.phone ?? null,
                    phoneVerified: data.phoneVerified ?? false,
                    phoneVerifyCode: data.phoneVerifyCode ?? null,
                    phoneCodeExpires: data.phoneCodeExpires ?? null,
                    avatarUrl: data.avatarUrl ?? null,
                    role: data.role ?? 'client',
                    emailVerified: data.emailVerified ?? false,
                    verificationToken: data.verificationToken ?? null,
                    tokenExpiresAt: data.tokenExpiresAt ?? null,
                    resetToken: data.resetToken ?? null,
                    resetTokenExpires: data.resetTokenExpires ?? null,
                    createdAt: new Date(),
                };
                store.set(row.id, row);
                return { ...row };
            },
            findUnique: async ({ where }: { where: Partial<Row> }) => {
                for (const row of store.values()) {
                    if (where.id !== undefined && row.id === where.id) return { ...row };
                    if (where.email !== undefined && row.email === where.email) return { ...row };
                    if (
                        where.verificationToken !== undefined &&
                        row.verificationToken === where.verificationToken
                    )
                        return { ...row };
                    if (where.resetToken !== undefined && row.resetToken === where.resetToken)
                        return { ...row };
                }
                return null;
            },
            findMany: async () => [...store.values()].map((r) => ({ ...r })),
            update: async ({ where, data }: { where: { id: number }; data: Partial<Row> }) => {
                const row = store.get(where.id);
                if (!row) throw new Error('Row not found');
                Object.assign(row, data);
                return { ...row };
            },
        };
    }
    return { PrismaClient };
});

process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';

import {
    createUser,
    updateUser,
    getUserByEmail,
    getUserById,
    getAllUsers,
    getUserByVerificationToken,
    getUserByResetToken,
    setPasswordResetToken,
} from './db-prisma';

beforeEach(() => {
    store.clear();
    nextId = 1;
});

let seq = 0;
const uniqueSuffix = () => `${seq++}-${Math.random().toString(36).slice(2)}`;

// Feature: oauth-phone-avatar-sync, Property 9: db-prisma avatarUrl fidelity
describe('db-prisma avatarUrl fidelity — Property 9', () => {
    it('preserves avatarUrl across all getters and honors update key presence', async () => {
        await fc.assert(
            fc.asyncProperty(
                fc.oneof(
                    fc.constant(undefined),
                    fc.constant(null),
                    fc.string({ minLength: 1 }).filter((s) => s.trim() !== '')
                ),
                fc.oneof(fc.constant(null), fc.string({ minLength: 1 }).filter((s) => s.trim() !== '')),
                async (initialAvatar, updatedAvatar) => {
                    const suffix = uniqueSuffix();
                    const email = `user-${suffix}@example.com`;
                    const verificationToken = `vtoken-${suffix}`;

                    const created = await createUser({
                        email,
                        passwordHash: 'hash',
                        avatarUrl: initialAvatar as string | null | undefined,
                        verificationToken,
                    });

                    const expectedStored = initialAvatar ?? null;
                    expect(created.avatarUrl).toBe(expectedStored);

                    // set a reset token so getUserByResetToken is exercised
                    const resetToken = `rtoken-${suffix}`;
                    await setPasswordResetToken(created.id, resetToken, new Date().toISOString());

                    const byEmail = await getUserByEmail(email);
                    const byId = await getUserById(created.id);
                    const all = await getAllUsers();
                    const byVerification = await getUserByVerificationToken(verificationToken);
                    const byReset = await getUserByResetToken(resetToken);
                    const fromAll = all.find((u) => u.id === created.id);

                    expect(byEmail?.avatarUrl).toBe(expectedStored);
                    expect(byId?.avatarUrl).toBe(expectedStored);
                    expect(byVerification?.avatarUrl).toBe(expectedStored);
                    expect(byReset?.avatarUrl).toBe(expectedStored);
                    expect(fromAll?.avatarUrl).toBe(expectedStored);

                    // update with avatarUrl key present -> changes (including null)
                    await updateUser(created.id, { avatarUrl: updatedAvatar });
                    const afterUpdate = await getUserById(created.id);
                    expect(afterUpdate?.avatarUrl).toBe(updatedAvatar);

                    // update omitting avatarUrl key -> unchanged
                    await updateUser(created.id, { name: 'new-name' });
                    const afterOmit = await getUserById(created.id);
                    expect(afterOmit?.avatarUrl).toBe(updatedAvatar);
                }
            ),
            { numRuns: 100 }
        );
    });
});
