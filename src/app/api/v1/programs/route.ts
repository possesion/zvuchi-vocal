import { NextResponse } from 'next/server'
import { getAllPrograms } from '@/lib/db-prisma'

interface ApiProgram {
    id: string
    slug: string
    title: string
    description: string
    features: string[]
    packages: Array<{
        lessons_count: number
        price: number
        original_price?: number
    }>
    lessonDuration: number
    programDuration: number
    popular: boolean
}

interface ProgramResponse {
    programs: ApiProgram[]
    total: number
}

export async function GET() {
    try {
        const programs = await getAllPrograms()
        
        const programsData: ApiProgram[] = programs.map((program) => ({
            id: String(program.id),
            slug: program.slug,
            title: program.title,
            description: program.short_description,
            features: program.features,
            packages: program.packages,
            lessonDuration: program.lesson_duration,
            programDuration: program.program_duration,
            popular: program.is_popular,
        }))
        
        const response: ProgramResponse = { programs: programsData, total: programsData.length }
        return NextResponse.json(response)
    } catch {
        return NextResponse.json({ error: 'Failed to fetch programs' }, { status: 500 })
    }
}
