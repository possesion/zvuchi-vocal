import { ReadonlyHeaders } from 'next/dist/server/web/spec-extension/adapters/headers';
import { NextRequest } from 'next/server';

export function checkAuth(headersList: ReadonlyHeaders): boolean {
    const token = headersList.get('Authorization');
    return !!token && token === process.env.ADMIN_TOKEN;
}

export function checkApiAuth(req: NextRequest): boolean {
    const token = req.headers.get('Authorization');
    return !!token && token === process.env.ADMIN_TOKEN;
}
