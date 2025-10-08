import { NextRequest, NextResponse } from 'next/server'
import { AppMonitor, MetricsCollector } from '@/lib/monitoring'
import { checkDatabaseHealth } from '@/lib/database'
import { checkCacheHealth } from '@/lib/cache'
import { ApiResponse } from '@/lib/api-middleware'

export const dynamic = 'force-dynamic'

// System health check endpoint
export async function GET(request: NextRequest) {
  try {
    MetricsCollector.startTimer('health_check_api')
    
    const [systemHealth, dbHealth, cacheHealth] = await Promise.all([
      AppMonitor.getSystemHealth(),
      checkDatabaseHealth(),
      checkCacheHealth()
    ])
    
    const overallHealth = {
      status: systemHealth.status,
      timestamp: new Date().toISOString(),
      services: {
        application: systemHealth,
        database: dbHealth,
        cache: cacheHealth
      },
      metrics: MetricsCollector.getMetrics()
    }
    
    MetricsCollector.endTimer('health_check_api')
    MetricsCollector.increment('api_health_check_success')
    
    return ApiResponse.success(overallHealth, 'Health check completed')
  } catch (error) {
    MetricsCollector.increment('api_health_check_error')
    console.error('Health check API error:', error)
    return ApiResponse.serverError('Health check failed')
  }
}
