import { NextResponse } from 'next/server'
import { TOCHKA_ACCESS_TOKEN_STATUS } from '@/components/constants'

export async function POST() {
    try {
        const tochkaResponse = await fetch(TOCHKA_ACCESS_TOKEN_STATUS, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: JSON.stringify({ access_token: '' }),
        })
        return NextResponse.json({ message: tochkaResponse })
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ error }, { status: 500 })
    }
}
