import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'
import { GalleryResponse } from '@/types/gallery'

export async function GET() {
    const galleryPath = path.join(process.cwd(), 'public', 'gallery')

    try {
        const files = fs.readdirSync(galleryPath)
        const imageFiles = files.filter((file) =>
            /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file)
        )

        const images = imageFiles.map((file, index) => ({
            id: `gallery-${index + 1}`,
            alt: 'photo ' + file,
            src: `/gallery/${file}`,
            thumbnail: `/gallery/${file}?w=150&h=150`,
            fileName: file,
            uploadedAt: new Date(),
            tags: ['gallery', 'vocal', 'studio']
        }))

        const response: GalleryResponse = {
            images,
            total: images.length,
            page: 1,
            limit: images.length
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Gallery API error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch gallery images',
                timestamp: new Date()
            },
            { status: 500 }
        )
    }
}
