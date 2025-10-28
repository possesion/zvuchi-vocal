'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'

interface AppState {
    theme: 'light' | 'dark'
    language: 'ru' | 'en'
    isLoading: boolean
    notifications: Notification[]
}

interface Notification {
    id: string
    type: 'success' | 'error' | 'warning' | 'info'
    message: string
    duration?: number
}

type AppAction =
    | { type: 'SET_THEME'; payload: 'light' | 'dark' }
    | { type: 'SET_LANGUAGE'; payload: 'ru' | 'en' }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'ADD_NOTIFICATION'; payload: Omit<Notification, 'id'> }
    | { type: 'REMOVE_NOTIFICATION'; payload: string }

const initialState: AppState = {
    theme: 'light',
    language: 'ru',
    isLoading: false,
    notifications: []
}

const appReducer = (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
        case 'SET_THEME':
            return { ...state, theme: action.payload }
        case 'SET_LANGUAGE':
            return { ...state, language: action.payload }
        case 'SET_LOADING':
            return { ...state, isLoading: action.payload }
        case 'ADD_NOTIFICATION':
            return {
                ...state,
                notifications: [
                    ...state.notifications,
                    { ...action.payload, id: Date.now().toString() }
                ]
            }
        case 'REMOVE_NOTIFICATION':
            return {
                ...state,
                notifications: state.notifications.filter(n => n.id !== action.payload)
            }
        default:
            return state
    }
}

interface AppContextType {
    state: AppState
    dispatch: React.Dispatch<AppAction>
    addNotification: (notification: Omit<Notification, 'id'>) => void
    removeNotification: (id: string) => void
    setTheme: (theme: 'light' | 'dark') => void
    setLanguage: (language: 'ru' | 'en') => void
    setLoading: (loading: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

interface AppProviderProps {
    children: ReactNode
}

export const AppProvider = ({ children }: AppProviderProps) => {
    const [state, dispatch] = useReducer(appReducer, initialState)

    const addNotification = (notification: Omit<Notification, 'id'>) => {
        dispatch({ type: 'ADD_NOTIFICATION', payload: notification })
    }

    const removeNotification = (id: string) => {
        dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })
    }

    const setTheme = (theme: 'light' | 'dark') => {
        dispatch({ type: 'SET_THEME', payload: theme })
    }

    const setLanguage = (language: 'ru' | 'en') => {
        dispatch({ type: 'SET_LANGUAGE', payload: language })
    }

    const setLoading = (loading: boolean) => {
        dispatch({ type: 'SET_LOADING', payload: loading })
    }

    return (
        <AppContext.Provider
            value={{
                state,
                dispatch,
                addNotification,
                removeNotification,
                setTheme,
                setLanguage,
                setLoading
            }}
        >
            {children}
        </AppContext.Provider>
    )
}

export const useApp = () => {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider')
    }
    return context
}
