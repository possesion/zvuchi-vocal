import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { isAdmin } from '@/lib/roles'
import { getAllInstructors } from '@/lib/db-prisma'
import { SalaryCalculatorForm } from '@/components/forms/salary-calculator-form'

export default async function CalculationsPage() {
    const session = await auth()

    if (!session || !isAdmin(session.user.role)) {
        redirect('/')
    }

    const instructors = await getAllInstructors()

    return (
        <div className="min-h-screen bg-zinc-950 px-4 py-10">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-8 text-3xl font-bold text-white">Расчёт зарплаты педагога</h1>
                <SalaryCalculatorForm instructors={instructors} />
            </div>
        </div>
    )
}
