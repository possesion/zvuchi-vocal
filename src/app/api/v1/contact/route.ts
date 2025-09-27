import { NextRequest, NextResponse } from 'next/server'
import { ContactFormData, EnrollmentFormData } from '@/types'

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { type, ...formData } = body

        if (type === 'contact') {
            const contactData = formData as ContactFormData

            // Validate required fields
            if (!contactData.name || !contactData.email || !contactData.message) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Missing required fields',
                        timestamp: new Date()
                    },
                    { status: 400 }
                )
            }

            // Here you would send the email using your email service
            console.log('Contact form submission:', contactData)

            return NextResponse.json({
                success: true,
                message: 'Contact form submitted successfully',
                timestamp: new Date()
            })
        }

        if (type === 'enrollment') {
            const enrollmentData = formData as EnrollmentFormData

            // Validate required fields
            if (!enrollmentData.name || !enrollmentData.email || !enrollmentData.phone || !enrollmentData.program) {
                return NextResponse.json(
                    {
                        success: false,
                        error: 'Missing required fields',
                        timestamp: new Date()
                    },
                    { status: 400 }
                )
            }

            // Here you would send the enrollment email
            console.log('Enrollment form submission:', enrollmentData)

            return NextResponse.json({
                success: true,
                message: 'Enrollment request submitted successfully',
                timestamp: new Date()
            })
        }

        return NextResponse.json(
            {
                success: false,
                error: 'Invalid form type',
                timestamp: new Date()
            },
            { status: 400 }
        )

    } catch (error) {
        console.error('Contact API error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to process form submission',
                timestamp: new Date()
            },
            { status: 500 }
        )
    }
}
