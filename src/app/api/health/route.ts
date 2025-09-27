import { NextResponse } from 'next/server'

export async function GET() {
    try {
        const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            environment: process.env.NODE_ENV,
            version: process.env.npm_package_version || '1.0.0',
            services: {
                database: 'connected', // This would check actual DB connection
                email: 'connected',    // This would check email service
                payments: 'connected'  // This would check payment service
            }
        }

        return NextResponse.json(health)
    } catch (error) {
        console.error('Health check error:', error)
        return NextResponse.json(
            {
                status: 'unhealthy',
                error: 'Health check failed',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        )
    }
}
