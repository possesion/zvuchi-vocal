import { useState, useEffect, useCallback } from 'react';

/**
 * Простой хук обратного отсчёта
 * @param initialSeconds - начальное количество секунд
 * @param autoStart - автоматический старт при монтировании (по умолчанию true)
 * @returns объект с seconds, start и reset функциями
 */
export function useCountdown(initialSeconds: number, autoStart = true) {
    const [seconds, setSeconds] = useState(autoStart ? initialSeconds : 0);
    const [isActive, setIsActive] = useState(autoStart);

    useEffect(() => {
        if (!isActive || seconds <= 0) return;

        const timer = setInterval(() => {
            setSeconds((prev) => {
                if (prev <= 1) {
                    setIsActive(false);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [seconds, isActive]);

    const start = useCallback(() => {
        setSeconds(initialSeconds);
        setIsActive(true);
    }, [initialSeconds]);

    const reset = useCallback(() => {
        setSeconds(0);
        setIsActive(false);
    }, []);

    return { seconds, start, reset };
}
