'use client'

import { createContext, useContext, useReducer, ReactNode } from 'react'
import { PaymentData, PaymentResponse, PaymentStatus } from '@/types/payment'

interface PaymentState {
    currentPayment: PaymentResponse | null
    paymentStatus: PaymentStatus | null
    loading: boolean
    error: string | null
    paymentHistory: PaymentStatus[]
}

type PaymentAction =
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_CURRENT_PAYMENT'; payload: PaymentResponse | null }
    | { type: 'SET_PAYMENT_STATUS'; payload: PaymentStatus | null }
    | { type: 'ADD_PAYMENT_TO_HISTORY'; payload: PaymentStatus }
    | { type: 'CLEAR_PAYMENT' }

const initialState: PaymentState = {
    currentPayment: null,
    paymentStatus: null,
    loading: false,
    error: null,
    paymentHistory: []
}

const paymentReducer = (state: PaymentState, action: PaymentAction): PaymentState => {
    switch (action.type) {
        case 'SET_LOADING':
            return { ...state, loading: action.payload }
        case 'SET_ERROR':
            return { ...state, error: action.payload }
        case 'SET_CURRENT_PAYMENT':
            return { ...state, currentPayment: action.payload }
        case 'SET_PAYMENT_STATUS':
            return { ...state, paymentStatus: action.payload }
        case 'ADD_PAYMENT_TO_HISTORY':
            return {
                ...state,
                paymentHistory: [action.payload, ...state.paymentHistory]
            }
        case 'CLEAR_PAYMENT':
            return {
                ...state,
                currentPayment: null,
                paymentStatus: null,
                error: null
            }
        default:
            return state
    }
}

interface PaymentContextType {
    state: PaymentState
    dispatch: React.Dispatch<PaymentAction>
    createPayment: (paymentData: PaymentData) => Promise<PaymentResponse | null>
    checkPaymentStatus: (paymentId: string) => Promise<PaymentStatus | null>
    clearPayment: () => void
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export const PaymentProvider = ({ children }: { children: ReactNode }) => {
    const [state, dispatch] = useReducer(paymentReducer, initialState)

    const createPayment = async (paymentData: PaymentData): Promise<PaymentResponse | null> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true })
            dispatch({ type: 'SET_ERROR', payload: null })

            const response = await fetch('/api/payments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData),
            })

            if (!response.ok) {
                throw new Error('Failed to create payment')
            }

            const result: PaymentResponse = await response.json()
            dispatch({ type: 'SET_CURRENT_PAYMENT', payload: result })
            return result
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            dispatch({ type: 'SET_ERROR', payload: errorMessage })
            return null
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }

    const checkPaymentStatus = async (paymentId: string): Promise<PaymentStatus | null> => {
        try {
            dispatch({ type: 'SET_LOADING', payload: true })
            dispatch({ type: 'SET_ERROR', payload: null })

            const response = await fetch(`/api/payments/${paymentId}/status`)
            if (!response.ok) {
                throw new Error('Failed to check payment status')
            }

            const result: PaymentStatus = await response.json()
            dispatch({ type: 'SET_PAYMENT_STATUS', payload: result })
            dispatch({ type: 'ADD_PAYMENT_TO_HISTORY', payload: result })
            return result
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error'
            dispatch({ type: 'SET_ERROR', payload: errorMessage })
            return null
        } finally {
            dispatch({ type: 'SET_LOADING', payload: false })
        }
    }

    const clearPayment = () => {
        dispatch({ type: 'CLEAR_PAYMENT' })
    }

    return (
        <PaymentContext.Provider
            value={{
                state,
                dispatch,
                createPayment,
                checkPaymentStatus,
                clearPayment
            }}
        >
            {children}
        </PaymentContext.Provider>
    )
}

export const usePayment = () => {
    const context = useContext(PaymentContext)
    if (context === undefined) {
        throw new Error('usePayment must be used within a PaymentProvider')
    }
    return context
}
