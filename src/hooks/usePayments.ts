import { useState } from 'react'
import { PaymentData, PaymentResponse, PaymentStatus } from '@/types/payment'

export const usePayments = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createPayment = async (paymentData: PaymentData): Promise<PaymentResponse | null> => {
        try {
            setLoading(true)
            setError(null)

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
            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            console.error('Payment creation error:', err)
            return null
        } finally {
            setLoading(false)
        }
    }

    const checkPaymentStatus = async (paymentId: string): Promise<PaymentStatus | null> => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/payments/${paymentId}/status`)
            if (!response.ok) {
                throw new Error('Failed to check payment status')
            }

            const result: PaymentStatus = await response.json()
            return result
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            console.error('Payment status check error:', err)
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
