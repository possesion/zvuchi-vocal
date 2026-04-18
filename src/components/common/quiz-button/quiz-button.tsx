'use client';

import { QuizProvider } from '../../modals/quiz-context';
import { QuizButtonInner } from './quiz-button-inner';
import { QuizButtonProps } from './types';


export function QuizButton({ children, className }: QuizButtonProps) {
    return (
        <QuizProvider>
            <QuizButtonInner className={className}>
                {children}
            </QuizButtonInner>
        </QuizProvider>
    );
}
