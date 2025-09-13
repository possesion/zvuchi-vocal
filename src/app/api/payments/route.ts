import { NextRequest, NextResponse } from 'next/server'

// const urlSandbox = 'https://enter.tochka.com/sandbox/v2/acquiring/v1.0/payments'
const url = 'https://enter.tochka.com/uapi/acquiring/v1.0/payments'

export async function POST(request: NextRequest) {
    try {
        const paymentData = await request.json()
        const tochkaResponse = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + process.env.NEXT_PUBLIC_TOCHKA_TOKEN,
            },
            body: JSON.stringify(paymentData),
        })

        const result = await tochkaResponse.json()

        if (!tochkaResponse.ok) {
            return NextResponse.json(
                { error: result.error },
                { status: tochkaResponse.status }
            )
        }

        return NextResponse.json(result, { status: 200 })
    } catch {
        return NextResponse.json(
            { error: 'Internal Server Error ' },
            { status: 500 }
        )
    }
}
