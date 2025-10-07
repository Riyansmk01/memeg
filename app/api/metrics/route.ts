import { NextRequest, NextResponse } from 'next/server'
import { AppMonitor, MetricsCollector } from '@/lib/monitoring'
import { ApiResponse } from '@/lib/api-middleware'

// Metrics endpoint for monitoring
export async function GET(request: NextRequest) {
  try {
    MetricsCollector.startTimer('metrics_api')
    
    const [performanceMetrics, resourceUsage] = await Promise.all([
      AppMonitor.getPerformanceMetrics(),
      AppMonitor.getResourceUsage()
    ])
    
    const metrics = {
      performance: performanceMetrics,
      resources: resourceUsage,
      custom: MetricsCollector.getMetrics(),
      timestamp: new Date().toISOString()
    }
    
    MetricsCollector.endTimer('metrics_api')
    MetricsCollector.increment('api_metrics_success')
    
    return ApiResponse.success(metrics, 'Metrics retrieved successfully')
  } catch (error) {
    MetricsCollector.increment('api_metrics_error')
    console.error('Metrics API error:', error)
    return ApiResponse.serverError('Failed to retrieve metrics')
  }
}
