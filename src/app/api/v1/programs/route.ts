import { NextResponse } from 'next/server'
import { programs } from '@/app/constants'
import { ProgramResponse } from '@/types/program'

export async function GET() {
    try {
        const programsData = programs.map((program, index) => ({
            id: `program-${index + 1}`,
            title: program.title,
            description: program.description,
            features: program.features,
            price: program.price,
            duration: '1 месяц',
            level: program.title === 'Базовый' ? 'beginner' as const :
                program.title === 'Продвинутый' ? 'intermediate' as const : 'advanced' as const,
            icon: program.icon,
            category: 'individual' as const,
            lessonsCount: program.title === 'Базовый' ? 4 :
                program.title === 'Продвинутый' ? 6 : 8,
            lessonDuration: 55,
            popular: program.title === 'Продвинутый',
            new: false
        }))

        const response: ProgramResponse = {
            programs: programsData,
            total: programsData.length
        }

        return NextResponse.json(response)
    } catch (error) {
        console.error('Programs API error:', error)
        return NextResponse.json(
            {
                success: false,
                error: 'Failed to fetch programs',
                timestamp: new Date()
            },
            { status: 500 }
        )
    }
}
