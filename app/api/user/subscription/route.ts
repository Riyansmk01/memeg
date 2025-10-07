import { NextRequest, NextResponse } from 'next/server'
import { withApiAuth, ApiResponse } from '@/lib/api-middleware'
import { SubscriptionCache } from '@/lib/cache'
import { MetricsCollector } from '@/lib/monitoring'

// Enhanced subscription API with caching
export const GET = withApiAuth(
  async (request: NextRequest, { user }) => {
    try {
      MetricsCollector.startTimer('subscription_api')
      
      const subscription = await SubscriptionCache.getSubscription(user.id)
      
      if (!subscription) {
        MetricsCollector.increment('api_subscription_not_found')
        return ApiResponse.notFound('Subscription not found')
      }
      
      MetricsCollector.endTimer('subscription_api')
      MetricsCollector.increment('api_subscription_success')
      
      return ApiResponse.success(subscription, 'Subscription retrieved successfully')
    } catch (error) {
      MetricsCollector.increment('api_subscription_error')
      console.error('Subscription API error:', error)
      return ApiResponse.serverError('Failed to retrieve subscription')
    }
  },
  {
    requiredPermissions: ['read'],
    rateLimit: true,
    auditLog: true
  }
)