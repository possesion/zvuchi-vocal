import { NextResponse } from 'next/server'
import { getAllPrograms } from '@/lib/db-prisma'
import type { ApiResponse } from '@/types/api'

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

export async function GET(): Promise<NextResponse<ApiResponse<ProgramResponse>>> {
    try {
        const programs = await getAllPrograms()
        
        const programsData: ApiProgram[] = programs.map((program) => ({
            id: String(program.id),
            slug: program.slug,
            title: program.title,
            description: program.shortDescription,
            features: program.features,
            packages: program.packages,
            lessonDuration: program.lessonDuration,
            programDuration: program.programDuration,
            popular: program.isPopular,
        }))
        
        const response: ProgramResponse = { programs: programsData, total: programsData.length }
        return NextResponse.json({ success: true, data: response, timestamp: new Date() })
    } catch {
        return NextResponse.json({ success: false, error: 'Failed to fetch programs', timestamp: new Date() }, { status: 500 })
    }
}
