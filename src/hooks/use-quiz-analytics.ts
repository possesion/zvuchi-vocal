'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/hooks/use-yandex-metrica';
import type { QuizAnswers } from '@/app/actions/types';

const trackedStepsKey = 'quiz_tracked_steps';

const getTrackedSteps = (): Set<number> => {
    try {
        const raw = sessionStorage.getItem(trackedStepsKey);
        return raw ? new Set(JSON.parse(raw) as number[]) : new Set();
    } catch {
        return new Set();
    }
};

const addTrackedStep = (step: number) => {
    try {
        const steps = getTrackedSteps();
        steps.add(step);
        sessionStorage.setItem(trackedStepsKey, JSON.stringify([...steps]));
    } catch {
        console.error('Ошибка при получении данных о прохождении опроса');
    }
};

export function useQuizAnalytics(
    step: number,
    isOpen: boolean,
    quizAnswers: QuizAnswers
): void {
    useEffect(() => {
        if (step < 2) return;
        if (getTrackedSteps().has(step)) return;
        const eventNames: Record<number, string> = {
            2: 'quiz_step_2_genre',
            3: 'quiz_step_3_motivation',
            4: 'quiz_step_4_contact',
        };
        const eventName = eventNames[step];
        if (eventName) {
            trackEvent(eventName, quizAnswers as unknown as Record<string, unknown>);
            addTrackedStep(step);
        }
    }, [step, isOpen]); // eslint-disable-line react-hooks/exhaustive-deps
}
