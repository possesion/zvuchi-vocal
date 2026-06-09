import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/types/api'

export function apiError(message: string, status = 500): NextResponse<ApiResponse<never>> {
    console.error(message)
    return NextResponse.json({ success: false, error: message, timestamp: new Date() }, { status })
}

export function apiOk<T>(data: T): NextResponse<ApiResponse<T>> {
    return NextResponse.json({ success: true, data, timestamp: new Date() })
}
