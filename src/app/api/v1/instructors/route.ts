import { instructors } from '@/app/constants'
import { InstructorResponse } from '@/types/instructor'
import { apiOk, apiError } from '@/lib/api-response'

export async function GET() {
    try {
        const instructorsData = instructors.map((instructor, index) => ({
            id: `instructor-${index + 1}`,
            name: instructor.name,
            feature: instructor.feature,
            specialty: instructor.specialty,
            bio: instructor.bio,
            image: instructor.image,
            video: instructor.video,
            education: [],
            achievements: [],
            rating: 4.8,
            reviewsCount: 25,
        }))
        const response: InstructorResponse = { instructors: instructorsData, total: instructorsData.length }
        return apiOk(response)
    } catch {
        return apiError('Failed to fetch instructors')
    }
}
