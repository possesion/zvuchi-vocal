import { ReactNode } from 'react'

export interface Instructor {
    id: string
    name: string
    specialty: string
    bio: ReactNode
    image: string
    video?: string
    // experience: number
    education: string[]
    achievements: string[]
    socialLinks?: {
        instagram?: string
        telegram?: string
        vk?: string
        tiktok?: string
    }
    schedule?: {
        availableDays: string[]
        timeSlots: string[]
    }
    rating?: number
    reviewsCount?: number
}

export interface InstructorResponse {
    instructors: Instructor[]
    total: number
}

export interface InstructorFilters {
    specialty?: string[]
    experience?: {
        min: number
        max: number
    }
    rating?: number
    available?: boolean
}
