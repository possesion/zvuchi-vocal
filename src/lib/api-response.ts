import { NextResponse } from 'next/server'

export function apiError(message: string, status = 500) {
    console.error(message)
    return NextResponse.json({ error: message }, { status })
}

export function apiOk<T>(data: T) {
    return NextResponse.json(data)
}
