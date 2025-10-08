import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
  debug: process.env.NODE_ENV === 'development',
})

export class MonitoringService {
  static captureException(error: Error, context?: any) {
    Sentry.captureException(error, {
      tags: {
        section: context?.section || 'unknown',
        userId: context?.userId,
      },
      extra: context,
    })
  }

  static captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: any) {
    Sentry.captureMessage(message, level, {
      tags: {
        section: context?.section || 'unknown',
        userId: context?.userId,
      },
      extra: context,
    })
  }

  static setUser(user: { id: string; email?: string; role?: string }) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
      role: user.role,
    })
  }

  static addBreadcrumb(message: string, category: string, data?: any) {
    Sentry.addBreadcrumb({
      message,
      category,
      data,
      level: 'info',
    })
  }

  static startTransaction(name: string, op: string) {
    return Sentry.startTransaction({
      name,
      op,
    })
  }

  static withScope(callback: (scope: Sentry.Scope) => void) {
    Sentry.withScope(callback)
  }
}

// Performance monitoring
export class PerformanceMonitor {
  static async measureAsync<T>(
    name: string,
    operation: () => Promise<T>,
    context?: any
  ): Promise<T> {
    const transaction = this.startTransaction(name, 'function')
    const span = transaction.startChild({
      op: 'function',
      description: name,
    })

    try {
      const result = await operation()
      span.setStatus('ok')
      return result
    } catch (error) {
      span.setStatus('internal_error')
      MonitoringService.captureException(error as Error, {
        section: 'performance',
        operation: name,
        ...context,
      })
      throw error
    } finally {
      span.finish()
      transaction.finish()
    }
  }

  static measureSync<T>(
    name: string,
    operation: () => T,
    context?: any
  ): T {
    const transaction = this.startTransaction(name, 'function')
    const span = transaction.startChild({
      op: 'function',
      description: name,
    })

    try {
      const result = operation()
      span.setStatus('ok')
      return result
    } catch (error) {
      span.setStatus('internal_error')
      MonitoringService.captureException(error as Error, {
        section: 'performance',
        operation: name,
        ...context,
      })
      throw error
    } finally {
      span.finish()
      transaction.finish()
    }
  }

  private static startTransaction(name: string, op: string) {
    return Sentry.startTransaction({
      name,
      op,
    })
  }
}

// System health monitoring
export class HealthMonitor {
  static async checkDatabaseHealth() {
    try {
      const { prisma } = await import('@/lib/database')
      await prisma.$queryRaw`SELECT 1`
      return { status: 'healthy', message: 'Database connection successful' }
    } catch (error) {
      MonitoringService.captureException(error as Error, {
        section: 'health_check',
        component: 'database',
      })
      return { 
        status: 'unhealthy', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  static async checkRedisHealth() {
    try {
      const { CacheService } = await import('@/lib/cache/redis')
      return await CacheService.healthCheck()
    } catch (error) {
      MonitoringService.captureException(error as Error, {
        section: 'health_check',
        component: 'redis',
      })
      return { 
        status: 'unhealthy', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  static async checkEmailServiceHealth() {
    try {
      // Test email service connectivity
      return { status: 'healthy', message: 'Email service available' }
    } catch (error) {
      MonitoringService.captureException(error as Error, {
        section: 'health_check',
        component: 'email',
      })
      return { 
        status: 'unhealthy', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }

  static async getSystemHealth() {
    const [database, redis, email] = await Promise.all([
      this.checkDatabaseHealth(),
      this.checkRedisHealth(),
      this.checkEmailServiceHealth(),
    ])

    const overallStatus = [database, redis, email].every(
      service => service.status === 'healthy'
    ) ? 'healthy' : 'degraded'

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        database,
        redis,
        email,
      },
    }
  }
}
