import { ReactNode } from 'react'

export interface Program {
    id: string
    title: string
    description: string
    features: string[]
    price: string
    duration: string
    level: 'beginner' | 'intermediate' | 'advanced'
    icon: ReactNode
    category: 'individual' | 'group' | 'online'
    lessonsCount: number
    lessonDuration: number
    pricePerLesson?: number
    discount?: {
        percentage: number
        description: string
    }
    popular?: boolean
    new?: boolean
}

export interface ProgramResponse {
    programs: Program[]
    total: number
}

export interface ProgramFilters {
    level?: string[]
    category?: string[]
    priceRange?: {
        min: number
        max: number
    }
    duration?: string[]
}
