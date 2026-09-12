'use server'

import { revalidatePath } from 'next/cache'
import { createProgram, deleteProgram, updateProgram, getProgramById } from '@/lib/db-prisma'
import { createSlug } from '@/app/api/v1/utils'
import { ActionResult } from '@/app/actions/types'
import { createModuleLogger } from '@/lib/logger'

const log = createModuleLogger('programs')

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
    master_multiplier?: number
}

export async function createProgramAction(
    data: ProgramFormData
): Promise<ActionResult<{ id: number }>> {
    try {
        const features = data.features
            ? data.features
                  .split('\n')
                  .map((f) => f.trim())
                  .filter((f) => f.length > 0)
            : []

        const slug = createSlug(data.title)

        const created = await createProgram({
            slug,
            title: data.title,
            shortDescription: data.short_description,
            fullDescription: data.full_description,
            packages: data.packages,
            lessonDuration: data.lesson_duration,
            programDuration: data.program_duration,
            features,
            isPopular: data.is_popular,
            sortOrder: data.sort_order,
            masterMultiplier: data.master_multiplier ?? 1.3,
        })

        return { success: true, data: { id: created.id } }
    } catch (error) {
        log.error('Failed to create program', { err: error })
        return { success: false, error: 'Ошибка при создании абонемента' }
    }
}

export async function updateProgramAction(
    id: number,
    data: ProgramFormData
): Promise<ActionResult<void>> {
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
            shortDescription: data.short_description,
            fullDescription: data.full_description,
            packages: data.packages,
            lessonDuration: data.lesson_duration,
            programDuration: data.program_duration,
            features,
            isPopular: data.is_popular,
            sortOrder: data.sort_order,
            masterMultiplier: data.master_multiplier ?? existingProgram.masterMultiplier,
            createdAt: existingProgram.createdAt,
            updatedAt: new Date().toISOString(),
        })

        return { success: true, data: undefined }
    } catch (error) {
        log.error('Failed to update program', { err: error })
        return { success: false, error: 'Ошибка при обновлении абонемента' }
    }
}

export async function deleteProgramAction(
    id: number
): Promise<ActionResult<void>> {
    try {
        await deleteProgram(id)
        revalidatePath('/programs')
        return { success: true, data: undefined }
    } catch (error) {
        log.error('Failed to delete program', { err: error })
        return { success: false, error: 'Ошибка при удалении абонемента' }
    }
}
