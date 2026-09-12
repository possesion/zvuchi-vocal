import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchGooglePhoneNumbers } from './google-people';
import { createModuleLogger } from './logger';

// Логгер вынесен в Winston (server-only); мокаем модуль, чтобы проверять вызовы.
vi.mock('./logger', () => {
    const log = { info: vi.fn(), warn: vi.fn(), error: vi.fn(), debug: vi.fn() };
    return { createModuleLogger: () => log };
});

describe('fetchGooglePhoneNumbers', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns the phoneNumbers array on a successful response', async () => {
        const phoneNumbers = [{ value: '+7 999 000 11 22' }, { value: '+7 000 111 22 33' }];
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({ phoneNumbers }),
            })
        );

        const result = await fetchGooglePhoneNumbers('token-abc');
        expect(result).toEqual(phoneNumbers);
    });

    it('returns null when the response body has no phoneNumbers', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: async () => ({}),
            })
        );

        const result = await fetchGooglePhoneNumbers('token-abc');
        expect(result).toBeNull();
    });

    it('returns null on a non-2xx (403) response without throwing', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: false,
                status: 403,
                json: async () => ({ error: 'forbidden' }),
            })
        );

        const result = await fetchGooglePhoneNumbers('token-abc');
        expect(result).toBeNull();
    });

    it('returns null and does not throw when fetch rejects (network error)', async () => {
        vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')));
        const log = createModuleLogger('oauth-sync');

        const result = await fetchGooglePhoneNumbers('token-abc');
        expect(result).toBeNull();
        expect(log.warn).toHaveBeenCalled();
    });

    it('sends the access token as a Bearer Authorization header', async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ phoneNumbers: [] }),
        });
        vi.stubGlobal('fetch', fetchMock);

        await fetchGooglePhoneNumbers('secret-token');
        expect(fetchMock).toHaveBeenCalledWith(
            expect.stringContaining('people.googleapis.com'),
            expect.objectContaining({
                headers: { Authorization: 'Bearer secret-token' },
            })
        );
    });
});
