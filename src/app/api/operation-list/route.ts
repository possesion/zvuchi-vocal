import { NextResponse } from 'next/server'

const url = 'https://enter.tochka.com/sandbox/v2/acquiring/v1.0/payments'

export async function GET() {
    try {
        const tochkaResponse = await fetch(
            `${url}?customerCode=${process.env.NEXT_PUBLIC_TOCHKA_CUSTOMER_CODE}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${process.env.NEXT_PUBLIC_TOCHKA_API_KEY}`,
                },
            }
        )
        return NextResponse.json({ message: tochkaResponse })
    } catch (error: unknown) {
        if (error instanceof Error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }
        return NextResponse.json({ error }, { status: 500 })
    }
}
