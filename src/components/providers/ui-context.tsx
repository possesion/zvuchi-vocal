'use client';

import { createContext, useContext, useReducer, ReactNode } from 'react';
import { Snackbar } from '../common/snackbar';

export type NotificationType = 'success' | 'error';

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
    duration?: number;
}

interface UIState {
    quizOpen: boolean;
    notifications: Notification[];
}

type UIAction =
    | { type: 'SET_QUIZ_OPEN'; payload: boolean }
    | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id'> }
    | { type: 'REMOVE_NOTIFICATION'; payload: string };

const initialState: UIState = {
    quizOpen: false,
    notifications: [],
};

function uiReducer(state: UIState, action: UIAction): UIState {
    switch (action.type) {
        case 'SET_QUIZ_OPEN':
            return { ...state, quizOpen: action.payload };
        case 'ADD_NOTIFICATION':
            return {
                ...state,
                notifications: [
                    ...state.notifications,
                    { ...action.payload, id: Date.now().toString() },
                ],
            };
        case 'REMOVE_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.filter((n) => n.id !== action.payload),
            };
        default:
            return state;
    }
}

interface UIContextValue {
    quizOpen: boolean;
    setQuizOpen: (open: boolean) => void;
    notify: (message: string, type?: NotificationType) => void;
}

const UIContext = createContext<UIContextValue>({
    quizOpen: false,
    setQuizOpen: () => {},
    notify: () => {},
});

export function UIProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(uiReducer, initialState);

    const setQuizOpen = (open: boolean) =>
        dispatch({ type: 'SET_QUIZ_OPEN', payload: open });

    const notify = (message: string, type: NotificationType = 'success') =>
        dispatch({ type: 'ADD_NOTIFICATION', payload: { message, type } });

    const dismiss = (id: string) =>
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });

    // Показываем только последнее уведомление через Snackbar
    const latest = state.notifications[state.notifications.length - 1];

    return (
        <UIContext.Provider value={{ quizOpen: state.quizOpen, setQuizOpen, notify }}>
            {children}
            {latest && (
                <Snackbar
                    key={latest.id}
                    isVisible
                    message={latest.message}
                    type={latest.type}
                    duration={latest.duration}
                    onClose={() => dismiss(latest.id)}
                />
            )}
        </UIContext.Provider>
    );
}

export const useUI = () => useContext(UIContext);
