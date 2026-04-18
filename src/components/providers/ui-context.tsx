'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { Snackbar } from '../common/snackbar';

interface SnackbarState {
    isVisible: boolean;
    message: string;
    type: 'success' | 'error';
}

interface UIContextValue {
    quizOpen: boolean;
    setQuizOpen: (open: boolean) => void;
    showSnackbar: (message: string, type?: 'success' | 'error') => void;
}

const UIContext = createContext<UIContextValue>({
    quizOpen: false,
    setQuizOpen: () => {},
    showSnackbar: () => {},
});

export function UIProvider({ children }: { children: ReactNode }) {
    const [quizOpen, setQuizOpen] = useState(false);
    const [snackbar, setSnackbar] = useState<SnackbarState>({
        isVisible: false,
        message: '',
        type: 'success',
    });

    const showSnackbar = (message: string, type: 'success' | 'error' = 'success') => {
        setSnackbar({ isVisible: true, message, type });
    };

    return (
        <UIContext.Provider value={{ quizOpen, setQuizOpen, showSnackbar }}>
            {children}
            <Snackbar
                isVisible={snackbar.isVisible}
                message={snackbar.message}
                type={snackbar.type}
                onClose={() => setSnackbar((prev) => ({ ...prev, isVisible: false }))}
            />
        </UIContext.Provider>
    );
}

export const useUI = () => useContext(UIContext);
