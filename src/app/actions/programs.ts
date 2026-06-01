'use server'

import { createProgram, deleteProgram, updateProgram, getProgramById } from '@/lib/db-prisma'
import { createSlug } from '@/app/api/v1/utils'

interface Package {
    lessons_count: number
    price: number
    original_price?: number
}

interface ProgramFormData {
    title: string
    short_description: string
    full_description: string
    packages: Package[]
    lesson_duration: number
    program_duration: number
    features: string
    is_popular: boolean
    sort_order: number
}

export async function createProgramAction(
    data: ProgramFormData
): Promise<{ success: boolean; error?: string; id?: number }> {
    try {
        const features = data.features
            ? data.features
                  .split('\n')
                  .map((f) => f.trim())
                  .filter((f) => f.length > 0)
            : []

        const slug = createSlug(data.title)

        const program = await createProgram({
            slug,
            title: data.title,
            short_description: data.short_description,
            full_description: data.full_description,
            packages: data.packages,
            lesson_duration: data.lesson_duration,
            program_duration: data.program_duration,
            features,
            is_popular: data.is_popular,
            sort_order: data.sort_order,
        })

        return { success: true, id: program.id }
    } catch (error) {
        console.error('Failed to create program:', error)
        return { success: false, error: 'Ошибка при создании абонемента' }
    }
}

export async function updateProgramAction(
    id: number,
    data: ProgramFormData
): Promise<{ success: boolean; error?: string }> {
    try {
        const existingProgram = await getProgramById(id)
        if (!existingProgram) {
            return { success: false, error: 'Абонемент не найден' }
        }

        const features = data.features
            ? data.features
                  .split('\n')
                  .map((f) => f.trim())
                  .filter((f) => f.length > 0)
            : []

        await updateProgram({
            id,
            slug: existingProgram.slug,
            title: data.title,
            short_description: data.short_description,
            full_description: data.full_description,
            packages: data.packages,
            lesson_duration: data.lesson_duration,
            program_duration: data.program_duration,
            features,
            is_popular: data.is_popular,
            sort_order: data.sort_order,
            created_at: existingProgram.created_at,
            updated_at: new Date().toISOString(),
        })

        return { success: true }
    } catch (error) {
        console.error('Failed to update program:', error)
        return { success: false, error: 'Ошибка при обновлении абонемента' }
    }
}

export async function deleteProgramAction(
    id: number
): Promise<{ success: boolean; error?: string }> {
    try {
        await deleteProgram(id)
        return { success: true }
    } catch (error) {
        console.error('Failed to delete program:', error)
        return { success: false, error: 'Ошибка при удалении абонемента' }
    }
}
