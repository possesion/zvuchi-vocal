/**
 * SMS Aero MobileID API client
 * Документация: https://smsaero.ru/cabinet/settings/mobile-id/integration/91
 * 
 * Для работы MobileID SDK используются переменные:
 * - CLIENT_ID - Публичный идентификатор виджета
 * - API_SECRET - Секретный ключ для подписи запросов (никогда не передаётся на фронтенд)
 */

import { createHmac } from 'crypto';

const CLIENT_ID = process.env.CLIENT_ID;
const API_SECRET = process.env.API_SECRET;
const MOBILEID_API_URL = 'https://midsdk.smsaero.ru';

interface TokenResponse {
    success: boolean;
    token?: string;
    error?: string;
}

interface SiteVerifyResponse {
    success: boolean;
    phone?: string;
    status?: string;
    error?: string;
}

/**
 * Генерация HMAC-SHA256 подписи
 * 
 * Алгоритм:
 * timestamp = текущее время в секундах (Unix), как строка
 * message   = CLIENT_ID + fingerprint_hash + timestamp
 * signature = HMAC-SHA256(message, API_SECRET)
 */
function generateSignature(clientId: string, data: string, timestamp: string): string {
    const message = clientId + data + timestamp;
    return createHmac('sha256', API_SECRET!)
        .update(message)
        .digest('hex');
}

/**
 * Получение токена для инициализации сессии MobileID
 * Вызывается с backend при получении POST от SDK
 * 
 * @param fingerprintHash - хэш отпечатка браузера из SDK
 */
export async function getMobileIDToken(fingerprintHash: string): Promise<TokenResponse> {
    if (!CLIENT_ID || !API_SECRET) {
        console.error('CLIENT_ID or API_SECRET not configured');
        return { success: false, error: 'MobileID service not configured' };
    }

    if (!fingerprintHash) {
        return { success: false, error: 'fingerprint_hash is required' };
    }

    try {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const signature = generateSignature(CLIENT_ID, fingerprintHash, timestamp);

        const response = await fetch(`${MOBILEID_API_URL}/api/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                fingerprint_hash: fingerprintHash,
                timestamp: timestamp,
                signature: signature,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('MobileID API error:', data);
            return {
                success: false,
                error: data.error || 'Failed to get MobileID token',
            };
        }

        return {
            success: true,
            token: data.token,
        };
    } catch (error) {
        console.error('MobileID token error:', error);
        return {
            success: false,
            error: 'Network error while getting MobileID token',
        };
    }
}

/**
 * Server-to-server верификация токена после успешной верификации на клиенте
 * 
 * Алгоритм подписи:
 * timestamp = текущее время в секундах (Unix), как строка
 * message   = CLIENT_ID + session_id + timestamp
 * signature = HMAC-SHA256(message, API_SECRET)
 * 
 * @param sessionId - ID сессии из SDK
 * @param verifyToken - токен верификации из события verified
 */
export async function verifyMobileIDToken(
    sessionId: string,
    verifyToken: string | null
): Promise<SiteVerifyResponse> {
    if (!CLIENT_ID || !API_SECRET) {
        console.error('CLIENT_ID or API_SECRET not configured');
        return { success: false, error: 'MobileID service not configured' };
    }

    if (!sessionId || !verifyToken) {
        return { success: false, error: 'session_id and verify_token are required' };
    }

    try {
        const timestamp = Math.floor(Date.now() / 1000).toString();
        const signature = generateSignature(CLIENT_ID, sessionId, timestamp);

        const response = await fetch(`${MOBILEID_API_URL}/api/siteverify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                client_id: CLIENT_ID,
                session_id: sessionId,
                verify_token: verifyToken,
                timestamp: timestamp,
                signature: signature,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('MobileID siteverify error:', data);
            return {
                success: false,
                error: data.error || 'Verification failed',
            };
        }

        // Проверяем статус верификации
        if (data.status !== 'verified') {
            return {
                success: false,
                error: `Verification status: ${data.status}`,
            };
        }

        return {
            success: true,
            phone: data.phone,
            status: data.status,
        };
    } catch (error) {
        console.error('MobileID siteverify error:', error);
        return {
            success: false,
            error: 'Network error during verification',
        };
    }
}
