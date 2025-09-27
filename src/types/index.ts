import { ReactNode } from 'react'

export interface Instructor {
    id: string
    name: string
    specialty: string
    bio: ReactNode
    image: string
    video?: string
    experience: number
    education: string[]
    achievements: string[]
}

export interface Program {
    id: string
    title: string
    description: string
    features: string[]
    price: string
    duration: string
    level: 'beginner' | 'intermediate' | 'advanced'
    icon: ReactNode
}

export interface GalleryImage {
    id: string
    src: string
    thumbnail: string
    alt: string
    fileName: string
    uploadedAt: Date
    tags: string[]
}

export interface Testimonial {
    id: string
    name: string
    program: string
    quote: string
    image: string
    rating?: number
}

export interface Event {
    id: string
    day: string
    month: string
    title: string
    time: string
    description: string
    date: Date
}

export interface NavigationItem {
    id: number
    text: string
    sectionId: string
}

export interface ContactFormData {
    name: string
    email: string
    phone: string
    message: string
}

export interface EnrollmentFormData {
    name: string
    email: string
    phone: string
    program: string
    instructor?: string
    preferredTime?: string
    experience?: string
}

export interface PaymentData {
    amount: number
    currency: string
    description: string
    orderId: string
    customerEmail: string
    customerPhone?: string
}

export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
    message?: string
}
