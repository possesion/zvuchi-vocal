import { useState, useEffect } from 'react'
import { GalleryImage, GalleryResponse } from '@/types/gallery'

export const useGallery = () => {
    const [images, setImages] = useState<GalleryImage[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchImages = async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/gallery')
            if (!response.ok) {
                throw new Error('Failed to fetch images')
            }

            const data: GalleryResponse = await response.json()
            setImages(data.images)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
            console.error('Gallery fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchImages()
    }, [])

    const refreshImages = () => {
        fetchImages()
    }

    return {
        images,
        loading,
        error,
        refreshImages
    }
}
