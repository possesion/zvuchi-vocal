import { NextResponse } from 'next/server'
import { instructors } from '@/app/constants'
import { InstructorResponse } from '@/types/instructor'

export async function GET() {
    try {
        const instructorsData = instructors.map((instructor, index) => ({
            id: `instructor-${index + 1}`,
            name: instructor.name,
            specialty: instructor.specialty,
            bio: instructor.bio,
            image: instructor.image,
            video: instructor.video,
            // experience: instructor.experience || 0,
            education: [],
            achievements: [],
            rating: 4.8,
            reviewsCount: 25
        }))

        const response: InstructorResponse = {
            instructors: instructorsData,
            total: instructorsData.length
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Instructors API error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch instructors',
                timestamp: new Date()
            },
            { status: 500 }
        )
    }
}
