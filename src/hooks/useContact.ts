import { useState } from 'react'
import { ContactFormData, EnrollmentFormData } from '@/types'

export const useContact = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const sendContactForm = async (formData: ContactFormData): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)
            setSuccess(false)

            const response = await fetch('/api/send-mail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'contact',
                    ...formData
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to send message')
            }

            setSuccess(true)
            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            console.error('Contact form error:', err)
            return false
        } finally {
            setLoading(false)
        }
    }

    const sendEnrollmentForm = async (formData: EnrollmentFormData): Promise<boolean> => {
        try {
            setLoading(true)
            setError(null)
            setSuccess(false)

            const response = await fetch('/api/send-mail', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'enrollment',
                    ...formData
                }),
            })

            if (!response.ok) {
                throw new Error('Failed to send enrollment request')
            }

            setSuccess(true)
            return true
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Unknown error'
            setError(errorMessage)
            console.error('Enrollment form error:', err)
            return false
        } finally {
            setLoading(false)
        }
    }

    const reset = () => {
        setError(null)
        setSuccess(false)
    }

    return {
        loading,
        error,
        success,
        sendContactForm,
        sendEnrollmentForm,
        reset
    }
}
