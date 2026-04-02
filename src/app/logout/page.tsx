'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LogoutPage() {
    const router = useRouter()

    useEffect(() => {
        fetch('/api/auth/logout', { method: 'POST' }).then(() => {
            router.push('/')
            router.refresh()
        })
    }, [router])

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
            <p className="text-white/60">Выход...</p>
        </div>
    )
}
