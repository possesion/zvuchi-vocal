'use client'

import { useEffect } from 'react'
import { signOut } from 'next-auth/react'

export default function LogoutPage() {
    useEffect(() => {
        signOut({ callbackUrl: '/' })
    }, [])

    return (
        <div className="flex min-h-screen items-center justify-center bg-zinc-950">
            <p className="text-white/60">Выход...</p>
        </div>
    )
}
