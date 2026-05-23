import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { getAllUsers } from '@/lib/db-prisma'
import { isAdmin } from '@/lib/roles'
import { UsersTable } from '@/components/sections/users-table'

export default async function UsersPage() {
    const session = await auth()

    if (!session || !isAdmin(session.user.role)) {
        redirect('/')
    }

    const users = await getAllUsers()

    return (
        <div className="min-h-screen bg-zinc-950 px-4 py-10">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-8 text-3xl font-bold text-white">Пользователи</h1>
                <UsersTable users={users} currentUserId={session.user.id} />
            </div>
        </div>
    )
}
