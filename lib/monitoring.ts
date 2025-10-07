import { prisma } from '@/lib/database'
import { redis } from '@/lib/database'
import { mongoDb } from '@/lib/database'

// Metrics collection
export class MetricsCollector {
  private static metrics: Map<string, number> = new Map()
  private static timers: Map<string, number> = new Map()

  static increment(metric: string, value: number = 1) {
    const current = this.metrics.get(metric) || 0
    this.metrics.set(metric, current + value)
  }

  static set(metric: string, value: number) {
    this.metrics.set(metric, value)
  }

  static startTimer(metric: string) {
    this.timers.set(metric, Date.now())
  }

  static endTimer(metric: string) {
    const startTime = this.timers.get(metric)
    if (startTime) {
      const duration = Date.now() - startTime
      this.increment(`${metric}_duration_ms`, duration)
      this.timers.delete(metric)
    }
  }

  static getMetrics() {
    return Object.fromEntries(this.metrics)
  }

  static reset() {
    this.metrics.clear()
    this.timers.clear()
  }
}

// Application monitoring
export class AppMonitor {
  static async getSystemHealth() {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: { status: 'unknown', responseTime: 0 },
        redis: { status: 'unknown', responseTime: 0 },
        mongodb: { status: 'unknown', responseTime: 0 },
      },
      metrics: MetricsCollector.getMetrics(),
    }

    // Check database
    try {
      const dbStart = Date.now()
      await prisma.$queryRaw`SELECT 1`
      health.services.database = {
        status: 'healthy',
        responseTime: Date.now() - dbStart
      }
    } catch (error) {
      health.services.database = {
        status: 'unhealthy',
        responseTime: 0,
        error: error.message
      }
      health.status = 'degraded'
    }

    // Check Redis
    try {
      const redisStart = Date.now()
      await redis.ping()
      health.services.redis = {
        status: 'healthy',
        responseTime: Date.now() - redisStart
      }
    } catch (error) {
      health.services.redis = {
        status: 'unhealthy',
        responseTime: 0,
        error: error.message
      }
      health.status = 'degraded'
    }

    // Check MongoDB
    try {
      const mongoStart = Date.now()
      await mongoDb.admin().ping()
      health.services.mongodb = {
        status: 'healthy',
        responseTime: Date.now() - mongoStart
      }
    } catch (error) {
      health.services.mongodb = {
        status: 'unhealthy',
        responseTime: 0,
        error: error.message
      }
      health.status = 'degraded'
    }

    return health
  }

  static async getPerformanceMetrics() {
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    const [
      hourlyUsers,
      dailyUsers,
      hourlyPayments,
      dailyPayments,
      hourlyErrors,
      dailyErrors,
      avgResponseTime,
    ] = await Promise.all([
      prisma.user.count({
        where: { createdAt: { gte: oneHourAgo } }
      }),
      prisma.user.count({
        where: { createdAt: { gte: oneDayAgo } }
      }),
      prisma.payment.count({
        where: {
          status: 'completed',
          createdAt: { gte: oneHourAgo }
        }
      }),
      prisma.payment.count({
        where: {
          status: 'completed',
          createdAt: { gte: oneDayAgo }
        }
      }),
      prisma.auditLog.count({
        where: {
          action: { contains: 'ERROR' },
          createdAt: { gte: oneHourAgo }
        }
      }),
      prisma.auditLog.count({
        where: {
          action: { contains: 'ERROR' },
          createdAt: { gte: oneDayAgo }
        }
      }),
      prisma.analytics.aggregate({
        where: {
          event: 'api_request',
          createdAt: { gte: oneHourAgo }
        },
        _avg: {
          // This would need a responseTime field in the schema
        }
      })
    ])

    return {
      users: {
        hourly: hourlyUsers,
        daily: dailyUsers,
      },
      payments: {
        hourly: hourlyPayments,
        daily: dailyPayments,
      },
      errors: {
        hourly: hourlyErrors,
        daily: dailyErrors,
      },
      performance: {
        avgResponseTime: avgResponseTime._avg || 0,
      },
      timestamp: now.toISOString()
    }
  }

  static async getResourceUsage() {
    const memUsage = process.memoryUsage()
    const cpuUsage = process.cpuUsage()

    return {
      memory: {
        rss: Math.round(memUsage.rss / 1024 / 1024), // MB
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
        external: Math.round(memUsage.external / 1024 / 1024), // MB
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  }
}

// Error tracking and logging
export class ErrorTracker {
  static async logError(error: Error, context: any = {}) {
    try {
      const errorLog = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: new Date().toISOString(),
        level: 'error',
      }

      // Store in MongoDB
      await mongoDb.collection('error_logs').insertOne(errorLog)

      // Store in audit log
      await prisma.auditLog.create({
        data: {
          action: 'ERROR',
          resource: 'Application',
          newValues: errorLog,
        }
      })

      // Increment error metric
      MetricsCollector.increment('errors_total')

      console.error('Error logged:', errorLog)
    } catch (logError) {
      console.error('Failed to log error:', logError)
    }
  }

  static async logWarning(message: string, context: any = {}) {
    try {
      const warningLog = {
        message,
        context,
        timestamp: new Date().toISOString(),
        level: 'warning',
      }

      await mongoDb.collection('warning_logs').insertOne(warningLog)
      MetricsCollector.increment('warnings_total')

      console.warn('Warning logged:', warningLog)
    } catch (logError) {
      console.error('Failed to log warning:', logError)
    }
  }
}

// Alert system
export class AlertManager {
  private static alerts: Map<string, any> = new Map()

  static async checkAlerts() {
    const health = await AppMonitor.getSystemHealth()
    const performance = await AppMonitor.getPerformanceMetrics()
    const resources = await AppMonitor.getResourceUsage()

    // Check for critical issues
    if (health.status === 'unhealthy') {
      await this.triggerAlert('system_unhealthy', {
        severity: 'critical',
        message: 'System is unhealthy',
        details: health
      })
    }

    // Check memory usage
    if (resources.memory.heapUsed > 500) { // 500MB threshold
      await this.triggerAlert('high_memory_usage', {
        severity: 'warning',
        message: 'High memory usage detected',
        details: resources.memory
      })
    }

    // Check error rate
    if (performance.errors.hourly > 10) {
      await this.triggerAlert('high_error_rate', {
        severity: 'warning',
        message: 'High error rate detected',
        details: performance.errors
      })
    }

    // Check response time
    if (performance.performance.avgResponseTime > 5000) { // 5 seconds
      await this.triggerAlert('slow_response_time', {
        severity: 'warning',
        message: 'Slow response time detected',
        details: performance.performance
      })
    }
  }

  static async triggerAlert(alertId: string, alert: any) {
    const lastAlert = this.alerts.get(alertId)
    const now = Date.now()

    // Prevent spam - only alert once per 5 minutes
    if (lastAlert && (now - lastAlert.timestamp) < 300000) {
      return
    }

    this.alerts.set(alertId, {
      ...alert,
      timestamp: now,
      id: alertId
    })

    // Log alert
    await ErrorTracker.logWarning(`Alert triggered: ${alertId}`, alert)

    // Send notification (implement your notification service)
    await this.sendNotification(alert)

    console.log(`Alert triggered: ${alertId}`, alert)
  }

  static async sendNotification(alert: any) {
    // Implement notification sending (email, Slack, etc.)
    console.log('Sending notification:', alert)
  }
}

// Performance monitoring middleware
export function performanceMiddleware(req: Request, res: Response, next: Function) {
  const startTime = Date.now()
  const path = req.url || 'unknown'

  MetricsCollector.startTimer(`request_${path}`)
  MetricsCollector.increment('requests_total')

  res.on('finish', () => {
    const duration = Date.now() - startTime
    MetricsCollector.endTimer(`request_${path}`)
    MetricsCollector.increment(`response_time_${res.status}`)

    if (res.status >= 400) {
      MetricsCollector.increment('errors_total')
    }
  })

  next()
}
