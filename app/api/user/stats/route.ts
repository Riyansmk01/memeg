import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth, ApiResponse } from '@/lib/api-middleware'
import { UserCache } from '@/lib/cache'
import { MetricsCollector } from '@/lib/monitoring'

// Enhanced user stats API with caching and monitoring
export const GET = withApiAuth(
  async (request: NextRequest, { user }) => {
    try {
      MetricsCollector.startTimer('user_stats_api')
      
      // Get cached stats or fetch from database
      const stats = await UserCache.getUserStats(user.id)
      
      MetricsCollector.endTimer('user_stats_api')
      MetricsCollector.increment('api_user_stats_success')
      
      return ApiResponse.success(stats, 'User stats retrieved successfully')
    } catch (error) {
      MetricsCollector.increment('api_user_stats_error')
      console.error('User stats API error:', error)
      return ApiResponse.serverError('Failed to retrieve user stats')
    }
  },
  {
    requiredPermissions: ['read'],
    rateLimit: true,
    auditLog: true
  }
)