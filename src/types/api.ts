export interface ApiResponse<T = unknown> {
    success: boolean
    data?: T
    error?: string
    message?: string
    timestamp: Date
}

export interface ApiError {
    code: string
    message: string
    details?: unknown
}

export interface PaginationParams {
    page?: number
    limit?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
    data: T[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNext: boolean
        hasPrev: boolean
    }
}

export interface ApiConfig {
    baseUrl: string
    timeout: number
    retries: number
    headers: Record<string, string>
}

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'

export interface RequestConfig {
    method: HttpMethod
    url: string
    data?: unknown
    params?: Record<string, unknown>
    headers?: Record<string, string>
    timeout?: number
}
