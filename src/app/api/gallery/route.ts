import fs from 'fs'
import path from 'path'
import { NextResponse } from 'next/server'

export async function GET() {
    const galleryPath = path.join(process.cwd(), 'public', 'gallery')

    try {
        const files = fs.readdirSync(galleryPath)
        const imageFiles = files.filter((file) =>
            /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file)
        )

        const images = imageFiles.map((file) => ({
            alt: 'photo ' + file,
            src: `/gallery/${file}`,
            fileName: file,
            // original: `/gallery/${file}`,
            // thumbnail: `/gallery/${file}?height=100&width=100`
        }))

        return NextResponse.json({ images })
    } catch (error) {
        return NextResponse.json({ error }, { status: 500 })
    }
}
