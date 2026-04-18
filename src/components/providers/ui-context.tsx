'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface UIContextValue {
    quizOpen: boolean;
    setQuizOpen: (open: boolean) => void;
}

const UIContext = createContext<UIContextValue>({
    quizOpen: false,
    setQuizOpen: () => {},
});

export function UIProvider({ children }: { children: ReactNode }) {
    const [quizOpen, setQuizOpen] = useState(false);
    return (
        <UIContext.Provider value={{ quizOpen, setQuizOpen }}>
            {children}
        </UIContext.Provider>
    );
}

export const useUI = () => useContext(UIContext);
