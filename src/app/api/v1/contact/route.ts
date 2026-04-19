import { NextRequest } from 'next/server'
import { apiOk, apiError } from '@/lib/api-response'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { type, name, email, phone, message, program } = body

        if (type === 'contact') {
            if (!name || !email || !message) return apiError('Missing required fields', 400)
            console.log('Contact form submission:', { name, email, message })
            return apiOk({ message: 'Contact form submitted successfully' })
        }

        if (type === 'enrollment') {
            if (!name || !email || !phone || !program) return apiError('Missing required fields', 400)
            console.log('Enrollment form submission:', { name, email, phone, program })
            return apiOk({ message: 'Enrollment request submitted successfully' })
        }

        return apiError('Invalid form type', 400)
    } catch {
        return apiError('Failed to process form submission')
    }
}
