import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Static configuration fact test (Requirements 1.1, 2.1): assert the provider
// authorization scopes are wired up. auth.ts instantiates NextAuth with Node-only
// dependencies, so we assert on the configured source rather than importing it.
const here = dirname(fileURLToPath(import.meta.url));
const authSource = readFileSync(join(here, 'auth.ts'), 'utf8');

describe('auth provider scopes', () => {
    it('Yandex provider requests login:phone alongside existing scopes', () => {
        expect(authSource).toContain('login:info');
        expect(authSource).toContain('login:email');
        expect(authSource).toContain('login:avatar');
        expect(authSource).toContain('login:phone');
    });

    it('Google provider requests the People API phone scope', () => {
        expect(authSource).toContain(
            'https://www.googleapis.com/auth/user.phonenumbers.read'
        );
    });
});
