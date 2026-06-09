'use server'
import { revalidatePath } from 'next/cache'
import { createInstructor, updateInstructor, deleteInstructor } from '@/lib/db-prisma'
import type { Instructor } from '@/lib/types'
import type { ActionResult } from '@/app/actions/types'

export async function createInstructorAction(
  data: Omit<Instructor, 'id'>
): Promise<ActionResult<{ id: number }>> {
  try {
    const created = await createInstructor(data)
    revalidatePath('/instructors')
    return { success: true, data: { id: created.id } }
  } catch (error) {
    console.error('createInstructorAction failed:', error)
    return { success: false, error: 'Ошибка при создании педагога' }
  }
}

export async function updateInstructorAction(
  data: Instructor
): Promise<ActionResult<void>> {
  try {
    await updateInstructor(data)
    revalidatePath('/instructors')
    revalidatePath(`/instructors/${data.slug}`)
    return { success: true, data: undefined }
  } catch (error) {
    console.error('updateInstructorAction failed:', error)
    return { success: false, error: 'Ошибка при обновлении педагога' }
  }
}

export async function deleteInstructorAction(
  id: number
): Promise<ActionResult<void>> {
  try {
    await deleteInstructor(id)
    revalidatePath('/instructors')
    return { success: true, data: undefined }
  } catch (error) {
    console.error('deleteInstructorAction failed:', error)
    return { success: false, error: 'Ошибка при удалении педагога' }
  }
}
