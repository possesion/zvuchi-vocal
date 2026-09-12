import { NextResponse } from 'next/server'
import type { ApiResponse } from '@/types/api'
import { createModuleLogger } from '@/lib/logger'

const log = createModuleLogger('api-response')

export function apiError(message: string, status = 500): NextResponse<ApiResponse<never>> {
    log.error(message, { status })
    return NextResponse.json({ success: false, error: message, timestamp: new Date() }, { status })
}

export function apiOk<T>(data: T): NextResponse<ApiResponse<T>> {
    return NextResponse.json({ success: true, data, timestamp: new Date() })
}
