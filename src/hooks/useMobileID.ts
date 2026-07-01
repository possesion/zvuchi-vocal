'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type {
    MobileIDState,
    ErrorEvent,
} from 'smsaero-mobileid-sdk';
import { MobileID } from 'smsaero-mobileid-sdk';

interface MobileIdError {
    code: string;
    message: string;
}

export function useMobileID() {
    const [state, setState] = useState<MobileIDState>('idle');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [phone, setPhone] = useState<string | null>(null);
    const [error, setError] = useState<MobileIdError | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const mobileIdRef = useRef<MobileID | null>(null);
    const callbacksRef = useRef<{
        onVerified?: (verifyToken: string | null) => void;
        onRejected?: () => void;
        onExpired?: () => void;
        onInvalidCode?: (message: string) => void;
        onError?: (error: ErrorEvent) => void;
    }>({});

    // Инициализация SDK
    const init = useCallback(async () => {
        try {
            // Уничтожаем предыдущий экземпляр
            if (mobileIdRef.current) {
                mobileIdRef.current.destroy();
            }

            const mid = new MobileID({ tokenUrl: '/api/mobileid/token' });

            // Регистрируем обработчики событий
            mid.on('ready', (data) => {
                setSessionId(data.session_id);
                setState('ready');
                setIsInitialized(true);
                setError(null);
            });

            mid.on('pending', (data) => {
                setPhone(data.phone);
                setState('pending');
            });

            mid.on('otp_required', () => {
                setState('otp');
            });

            mid.on('verified', (data) => {
                setState('final');
                callbacksRef.current.onVerified?.(data.verify_token);
            });

            mid.on('rejected', () => {
                setState('final');
                callbacksRef.current.onRejected?.();
            });

            mid.on('expired', () => {
                setState('final');
                callbacksRef.current.onExpired?.();
            });

            mid.on('invalid_code', (data) => {
                callbacksRef.current.onInvalidCode?.(data.message);
            });

            mid.on('rate_limit', () => {
                setError({
                    code: 'rate_limit',
                    message: 'Превышен лимит запросов',
                });
            });

            mid.on('error', (err) => {
                setError({ code: err.code, message: err.message });
                callbacksRef.current.onError?.(err);
            });

            mobileIdRef.current = mid;

            // Инициализируем сессию
            await mid.init();
        } catch (err) {
            console.error('MobileID init error:', err);
            setError({
                code: 'init_error',
                message: err instanceof Error ? err.message : 'Ошибка инициализации',
            });
        }
    }, []);

    // Запуск верификации
    const start = useCallback(async (phoneNumber: string) => {
        if (!mobileIdRef.current) {
            console.error('MobileID not initialized');
            return;
        }

        setError(null);
        await mobileIdRef.current.start(phoneNumber);
    }, []);

    // Отправка OTP кода
    const submitOTP = useCallback(async (code: string) => {
        if (!mobileIdRef.current) {
            console.error('MobileID not initialized');
            return;
        }

        setError(null);
        await mobileIdRef.current.submitOTP(code);
    }, []);

    // Уничтожение экземпляра
    const destroy = useCallback(() => {
        if (mobileIdRef.current) {
            mobileIdRef.current.destroy();
            mobileIdRef.current = null;
        }
        setState('idle');
        setSessionId(null);
        setPhone(null);
        setError(null);
        setIsInitialized(false);
    }, []);

    // Регистрация колбэков
    const onVerified = useCallback(
        (callback: (verifyToken: string | null) => void) => {
            callbacksRef.current.onVerified = callback;
        },
        []);

    const onRejected = useCallback((callback: () => void) => {
        callbacksRef.current.onRejected = callback;
    }, []);

    const onExpired = useCallback((callback: () => void) => {
        callbacksRef.current.onExpired = callback;
    }, []);

    const onInvalidCode = useCallback(
        (callback: (message: string) => void) => {
            callbacksRef.current.onInvalidCode = callback;
        }, []);

    const onError = useCallback((callback: (error: ErrorEvent) => void) => {
            callbacksRef.current.onError = callback;
    }, []);

    // Очистка при размонтировании
    useEffect(() => {
        return () => {
            if (mobileIdRef.current) {
                mobileIdRef.current.destroy();
            }
        };
    }, []);

    return {
        state,
        sessionId,
        phone,
        error,
        isInitialized,
        init,
        start,
        submitOTP,
        destroy,
        onVerified,
        onRejected,
        onExpired,
        onInvalidCode,
        onError,
    };
}
