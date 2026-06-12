import { Package } from "@/app/programs/types";

export type UserRole = 'admin' | 'manager' | 'client'

export interface Instructor {
  id: number
  name: string
  specialty: string
  feature: string
  experience: string
  bio: string
  image: string
  video: string
  sortOrder: number
  slug: string
  presentationVideo: string
  performanceVideos: string[]
  techniques: string[]
}

export interface NewsArticle {
  id: number
  title: string
  summary: string
  content: string
  coverUrl: string
  views: number
  publishedAt: string
}

export interface WikiTermRow {
    id: string;
    title: string;
    description: string;
    category: string;
    author: string;
    coverUrl: string;
    updatedAt: string;
}

export interface WikiCategoryRow {
    id: string;
    label: string;
}

export interface AppUser {
  id: number
  email: string
  passwordHash: string
  name: string | null
  phone: string | null
  phoneVerified: boolean
  phoneVerifyCode: string | null
  phoneCodeExpires: string | null
  role: UserRole
  emailVerified: boolean
  verificationToken: string | null
  tokenExpiresAt: string | null
  resetToken: string | null
  resetTokenExpires: string | null
  createdAt: string
}

export type UserUpdateData = Partial<Pick<
    AppUser,
    'emailVerified' | 'verificationToken' | 'tokenExpiresAt' | 'role' | 'passwordHash' | 'name' | 'phone' | 'phoneVerified' | 'phoneVerifyCode' | 'phoneCodeExpires'
>>

export interface Program {
  id: number
  slug: string
  title: string
  shortDescription: string
  fullDescription: string
  packages: Array<Package>
  lessonDuration: number
  programDuration: number
  features: string[]
  isPopular: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

