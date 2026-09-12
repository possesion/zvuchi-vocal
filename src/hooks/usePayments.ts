import { useState } from 'react'
import * as Sentry from '@sentry/nextjs'
import { PaymentData, PaymentResponse, PaymentStatus } from '@/types/payment'
import {
    logRequestStart,
    logRequestSuccess,
    logRequestFailure,
    logRequestError,
} from '@/lib/client-logger'

export const usePayments = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createPayment = async (paymentData: PaymentData): Promise<PaymentResponse | null> => {
        const endpoint = '/api/payments'
        const startedAt = performance.now()
        logRequestStart(endpoint, { method: 'POST', module: 'payment' })
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData),
            })

            const durationMs = Math.round(performance.now() - startedAt)

            if (!response.ok) {
                logRequestFailure(endpoint, { method: 'POST', module: 'payment', status: response.status, durationMs })
                throw new Error('Failed to create payment')
            }

            const result: PaymentResponse = await response.json()
            logRequestSuccess(endpoint, { method: 'POST', module: 'payment', status: response.status, durationMs })
            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            logRequestError(endpoint, err, { method: 'POST', module: 'payment' })
            Sentry.captureException(err, { extra: { context: 'payment-create' } })
            return null
        } finally {
            setLoading(false)
        }
    }

    const checkPaymentStatus = async (paymentId: string): Promise<PaymentStatus | null> => {
        const endpoint = `/api/payments/${paymentId}/status`
        const startedAt = performance.now()
        logRequestStart(endpoint, { method: 'GET', module: 'payment' })
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(endpoint)
            const durationMs = Math.round(performance.now() - startedAt)

            if (!response.ok) {
                logRequestFailure(endpoint, { method: 'GET', module: 'payment', status: response.status, durationMs })
                throw new Error('Failed to check payment status')
            }

            const result: PaymentStatus = await response.json()
            logRequestSuccess(endpoint, { method: 'GET', module: 'payment', status: response.status, durationMs })
            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            logRequestError(endpoint, err, { method: 'GET', module: 'payment' })
            Sentry.captureException(err, { extra: { context: 'payment-status-check' } })
            return null
        } finally {
            setLoading(false)
        }
    }

    return {
        loading,
        error,
        createPayment,
        checkPaymentStatus
    }
}
