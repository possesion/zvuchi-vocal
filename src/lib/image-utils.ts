export const imageConfig = {
    gallery: {
        path: '/gallery/',
        formats: ['jpg', 'jpeg', 'png', 'webp'],
        maxSize: '2MB',
        dimensions: {
            thumbnail: { width: 150, height: 150 },
            medium: { width: 800, height: 600 },
            large: { width: 1600, height: 1200 }
        }
    },
    instructors: {
        path: '/instructors/',
        formats: ['jpg', 'jpeg', 'png'],
        maxSize: '1MB',
        dimensions: {
            card: { width: 300, height: 300 },
            profile: { width: 600, height: 600 }
        }
    }
}

export const generateImageUrl = (path: string, width?: number, height?: number) => {
    if (!width && !height) return path

    const params = new URLSearchParams()
    if (width) params.set('w', width.toString())
    if (height) params.set('h', height.toString())

    return `${path}?${params.toString()}`
}

// export const getImageDimensions = (type: 'gallery' | 'instructors', size: 'thumbnail' | 'medium' | 'large' | 'card' | 'profile') => {
//     return imageConfig[type].dimensions[size as keyof typeof imageConfig[type]['dimensions']]
// }
