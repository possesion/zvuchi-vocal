export interface PaymentData {
    amount: number
    currency: string
    description: string
    orderId: string
    customerEmail: string
    customerPhone?: string
    customerName?: string
    returnUrl?: string
    webhookUrl?: string
}

export interface PaymentResponse {
    paymentId: string
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
    paymentUrl?: string
    qrCode?: string
    expiresAt?: Date
}

export interface PaymentStatus {
    paymentId: string
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
    amount: number
    currency: string
    description: string
    createdAt: Date
    updatedAt: Date
    completedAt?: Date
    errorMessage?: string
}

export interface WebhookPayload {
    event: 'payment.completed' | 'payment.failed' | 'payment.cancelled'
    paymentId: string
    orderId: string
    amount: number
    currency: string
    timestamp: Date
    signature: string
}
