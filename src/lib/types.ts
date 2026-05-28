export type UserRole = 'admin' | 'manager' | 'client'

export interface InstructorRow {
    id: number;
    name: string;
    specialty: string;
    feature: string;
    experience: string;
    bio: string;
    image: string;
    video: string;
    sort_order: number;
    slug: string;
    presentation_video: string;
    performance_videos: string[];
    techniques: string[];
}

export interface InstructorDbRow {
    id: number;
    name: string;
    specialty: string;
    feature: string;
    experience: string;
    bio: string;
    image: string;
    video: string;
    sort_order: number;
    slug: string;
    presentation_video: string;
    performance_videos: string;
    techniques: string;
}

export interface NewsRow {
    id: number;
    title: string;
    summary: string;
    content: string;
    cover_url: string;
    views: number;
    published_at: string;
}

export interface WikiTermRow {
    id: string;
    title: string;
    description: string;
    category: string;
    author: string;
    cover_url: string;
    updated_at: string;
}

export interface WikiCategoryRow {
    id: string;
    label: string;
}

export interface UserRow {
    id: number
    email: string
    password_hash: string
    role: UserRole
    email_verified: 0 | 1
    verification_token: string | null
    token_expires_at: string | null
    reset_token: string | null
    reset_token_expires: string | null
    created_at: string
}

