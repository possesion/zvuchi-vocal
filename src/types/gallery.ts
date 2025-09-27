export interface GalleryImage {
    id: string
    src: string
    thumbnail: string
    alt: string
    fileName: string
    uploadedAt: Date
    tags: string[]
    metadata?: {
        width: number
        height: number
        size: number
        format: string
    }
}

export interface GalleryResponse {
    images: GalleryImage[]
    total: number
    page: number
    limit: number
}

export interface GalleryFilters {
    tags?: string[]
    dateFrom?: Date
    dateTo?: Date
    format?: string[]
}

export type GallerySortBy = 'date' | 'name' | 'size'
export type GallerySortOrder = 'asc' | 'desc'
