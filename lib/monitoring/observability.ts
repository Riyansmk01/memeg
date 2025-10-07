import { Client } from '@elastic/elasticsearch'
import { prisma } from '@/lib/database/manager'
import { redis } from '@/lib/database/manager'

// Monitoring Configuration
const MONITORING_CONFIG = {
  elasticsearch: {
    url: process.env.ELASTICSEARCH_URL || 'http://localhost:9200',
    index: 'esawitku-logs',
    username: process.env.ELASTICSEARCH_USERNAME,
    password: process.env.ELASTICSEARCH_PASSWORD
  },
  prometheus: {
    url: process.env.PROMETHEUS_URL || 'http://localhost:9090',
    job: 'esawitku-app'
  },
  sentry: {
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development'
  }
}

// Log Levels
export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}

// Log Entry Interface
export interface LogEntry {
  timestamp: Date
  level: LogLevel
  message: string
  service: string
  userId?: string
  sessionId?: string
  requestId?: string
  ip?: string
  userAgent?: string
  metadata?: any
  error?: {
    name: string
    message: string
    stack: string
  }
}

// Metrics Interface
export interface Metric {
  name: string
  value: number
  labels?: Record<string, string>
  timestamp: Date
}

// Logger Class
export class Logger {
  private elasticsearch: Client
  private service: string

  constructor(service: string = 'esawitku-app') {
    this.service = service
    this.elasticsearch = new Client({
      node: MONITORING_CONFIG.elasticsearch.url,
      auth: MONITORING_CONFIG.elasticsearch.username ? {
        username: MONITORING_CONFIG.elasticsearch.username,
        password: MONITORING_CONFIG.elasticsearch.password
      } : undefined
    })
  }

  // Log methods
  async error(message: string, metadata?: any, error?: Error): Promise<void> {
    await this.log(LogLevel.ERROR, message, metadata, error)
  }

  async warn(message: string, metadata?: any): Promise<void> {
    await this.log(LogLevel.WARN, message, metadata)
  }

  async info(message: string, metadata?: any): Promise<void> {
    await this.log(LogLevel.INFO, message, metadata)
  }

  async debug(message: string, metadata?: any): Promise<void> {
    await this.log(LogLevel.DEBUG, message, metadata)
  }

  // Main log method
  private async log(level: LogLevel, message: string, metadata?: any, error?: Error): Promise<void> {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level,
      message,
      service: this.service,
      metadata,
      ...(error && {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack || ''
        }
      })
    }

    try {
      // Send to Elasticsearch
      await this.elasticsearch.index({
        index: MONITORING_CONFIG.elasticsearch.index,
        body: logEntry
      })

      // Also log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${level.toUpperCase()}] ${message}`, metadata)
      }
    } catch (error) {
      console.error('Failed to send log to Elasticsearch:', error)
    }
  }

  // Request logging
  async logRequest(request: any, response: any, userId?: string): Promise<void> {
    const logEntry: LogEntry = {
      timestamp: new Date(),
      level: LogLevel.INFO,
      message: `${request.method} ${request.url}`,
      service: this.service,
      userId,
      requestId: request.headers['x-request-id'],
      ip: request.headers['x-forwarded-for'] || request.headers['x-real-ip'],
      userAgent: request.headers['user-agent'],
      metadata: {
        method: request.method,
        url: request.url,
        statusCode: response.status,
        responseTime: response.responseTime,
        contentLength: response.headers['content-length']
      }
    }

    await this.elasticsearch.index({
      index: MONITORING_CONFIG.elasticsearch.index,
      body: logEntry
    })
  }

  // Error logging with context
  async logError(error: Error, context?: any): Promise<void> {
    await this.error(error.message, context, error)
  }

  // Performance logging
  async logPerformance(operation: string, duration: number, metadata?: any): Promise<void> {
    await this.info(`Performance: ${operation}`, {
      ...metadata,
      duration,
      operation
    })
  }

  // Security logging
  async logSecurity(event: string, metadata?: any): Promise<void> {
    await this.warn(`Security Event: ${event}`, {
      ...metadata,
      event,
      timestamp: new Date()
    })
  }

  // Business logic logging
  async logBusiness(event: string, userId: string, metadata?: any): Promise<void> {
    await this.info(`Business Event: ${event}`, {
      ...metadata,
      event,
      userId,
      timestamp: new Date()
    })
  }
}

// Metrics Collector Class
export class MetricsCollector {
  private metrics: Map<string, Metric[]> = new Map()

  // Collect metric
  collect(name: string, value: number, labels?: Record<string, string>): void {
    const metric: Metric = {
      name,
      value,
      labels,
      timestamp: new Date()
    }

    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }

    this.metrics.get(name)!.push(metric)

    // Keep only last 1000 metrics per name
    const metrics = this.metrics.get(name)!
    if (metrics.length > 1000) {
      metrics.splice(0, metrics.length - 1000)
    }
  }

  // Get metrics
  getMetrics(name?: string): Metric[] {
    if (name) {
      return this.metrics.get(name) || []
    }

    const allMetrics: Metric[] = []
    for (const metrics of this.metrics.values()) {
      allMetrics.push(...metrics)
    }

    return allMetrics
  }

  // Get metric summary
  getMetricSummary(name: string): {
    count: number
    sum: number
    avg: number
    min: number
    max: number
    latest: number
  } | null {
    const metrics = this.metrics.get(name)
    if (!metrics || metrics.length === 0) {
      return null
    }

    const values = metrics.map(m => m.value)
    const sum = values.reduce((a, b) => a + b, 0)
    const avg = sum / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)
    const latest = values[values.length - 1]

    return {
      count: values.length,
      sum,
      avg,
      min,
      max,
      latest
    }
  }

  // Clear metrics
  clear(name?: string): void {
    if (name) {
      this.metrics.delete(name)
    } else {
      this.metrics.clear()
    }
  }
}

// Health Check Manager
export class HealthCheckManager {
  private logger: Logger

  constructor() {
    this.logger = new Logger('health-check')
  }

  // Database health check
  async checkDatabase(): Promise<{
    postgresql: boolean
    mongodb: boolean
    mysql: boolean
    redis: boolean
    overall: boolean
  }> {
    const health = {
      postgresql: false,
      mongodb: false,
      mysql: false,
      redis: false,
      overall: false
    }

    try {
      // PostgreSQL Health Check
      await prisma.$queryRaw`SELECT 1`
      health.postgresql = true
    } catch (error) {
      await this.logger.error('PostgreSQL health check failed', { error: error.message })
    }

    try {
      // Redis Health Check
      await redis.ping()
      health.redis = true
    } catch (error) {
      await this.logger.error('Redis health check failed', { error: error.message })
    }

    // Add MongoDB and MySQL checks here
    health.mongodb = true // Placeholder
    health.mysql = true // Placeholder

    health.overall = health.postgresql && health.mongodb && health.mysql && health.redis

    return health
  }

  // Application health check
  async checkApplication(): Promise<{
    status: string
    uptime: number
    memory: any
    version: string
    environment: string
  }> {
    const uptime = process.uptime()
    const memory = process.memoryUsage()

    return {
      status: 'healthy',
      uptime,
      memory: {
        rss: memory.rss,
        heapTotal: memory.heapTotal,
        heapUsed: memory.heapUsed,
        external: memory.external
      },
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development'
    }
  }

  // Full health check
  async fullHealthCheck(): Promise<any> {
    const [database, application] = await Promise.all([
      this.checkDatabase(),
      this.checkApplication()
    ])

    const overall = database.overall && application.status === 'healthy'

    return {
      status: overall ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database,
      application,
      overall
    }
  }
}

// Alert Manager
export class AlertManager {
  private logger: Logger
  private metrics: MetricsCollector

  constructor() {
    this.logger = new Logger('alert-manager')
    this.metrics = new MetricsCollector()
  }

  // Check alerts
  async checkAlerts(): Promise<void> {
    try {
      // Check error rate
      const errorRate = await this.getErrorRate()
      if (errorRate > 0.05) { // 5% error rate threshold
        await this.sendAlert('High Error Rate', {
          errorRate,
          threshold: 0.05
        })
      }

      // Check response time
      const avgResponseTime = await this.getAverageResponseTime()
      if (avgResponseTime > 2000) { // 2 second threshold
        await this.sendAlert('High Response Time', {
          avgResponseTime,
          threshold: 2000
        })
      }

      // Check memory usage
      const memoryUsage = process.memoryUsage()
      const memoryUsagePercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100
      if (memoryUsagePercent > 80) { // 80% memory usage threshold
        await this.sendAlert('High Memory Usage', {
          memoryUsagePercent,
          threshold: 80
        })
      }

      // Check database connections
      const dbHealth = await new HealthCheckManager().checkDatabase()
      if (!dbHealth.overall) {
        await this.sendAlert('Database Health Issue', {
          database: dbHealth
        })
      }

    } catch (error) {
      await this.logger.error('Alert check failed', { error: error.message })
    }
  }

  // Get error rate
  private async getErrorRate(): Promise<number> {
    try {
      const elasticsearch = new Client({
        node: MONITORING_CONFIG.elasticsearch.url
      })

      const now = new Date()
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

      const response = await elasticsearch.search({
        index: MONITORING_CONFIG.elasticsearch.index,
        body: {
          query: {
            range: {
              timestamp: {
                gte: fiveMinutesAgo.toISOString(),
                lte: now.toISOString()
              }
            }
          },
          aggs: {
            error_count: {
              filter: { term: { level: 'error' } }
            },
            total_count: {
              value_count: { field: 'level' }
            }
          }
        }
      })

      const errorCount = response.aggregations.error_count.doc_count
      const totalCount = response.aggregations.total_count.value

      return totalCount > 0 ? errorCount / totalCount : 0
    } catch (error) {
      console.error('Error rate calculation failed:', error)
      return 0
    }
  }

  // Get average response time
  private async getAverageResponseTime(): Promise<number> {
    try {
      const elasticsearch = new Client({
        node: MONITORING_CONFIG.elasticsearch.url
      })

      const now = new Date()
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000)

      const response = await elasticsearch.search({
        index: MONITORING_CONFIG.elasticsearch.index,
        body: {
          query: {
            bool: {
              must: [
                {
                  range: {
                    timestamp: {
                      gte: fiveMinutesAgo.toISOString(),
                      lte: now.toISOString()
                    }
                  }
                },
                {
                  exists: { field: 'metadata.responseTime' }
                }
              ]
            }
          },
          aggs: {
            avg_response_time: {
              avg: { field: 'metadata.responseTime' }
            }
          }
        }
      })

      return response.aggregations.avg_response_time.value || 0
    } catch (error) {
      console.error('Response time calculation failed:', error)
      return 0
    }
  }

  // Send alert
  private async sendAlert(title: string, data: any): Promise<void> {
    await this.logger.warn(`ALERT: ${title}`, data)

    // In production, integrate with alerting services like:
    // - Slack webhooks
    // - Email notifications
    // - PagerDuty
    // - Discord webhooks

    console.log(`🚨 ALERT: ${title}`, data)
  }
}

// Performance Monitor
export class PerformanceMonitor {
  private logger: Logger
  private metrics: MetricsCollector

  constructor() {
    this.logger = new Logger('performance-monitor')
    this.metrics = new MetricsCollector()
  }

  // Monitor function execution time
  async monitorFunction<T>(
    name: string,
    fn: () => Promise<T>,
    labels?: Record<string, string>
  ): Promise<T> {
    const start = Date.now()
    
    try {
      const result = await fn()
      const duration = Date.now() - start
      
      this.metrics.collect('function_duration', duration, {
        function: name,
        status: 'success',
        ...labels
      })
      
      await this.logger.logPerformance(name, duration, labels)
      
      return result
    } catch (error) {
      const duration = Date.now() - start
      
      this.metrics.collect('function_duration', duration, {
        function: name,
        status: 'error',
        ...labels
      })
      
      await this.logger.error(`Function ${name} failed`, { duration, error: error.message })
      throw error
    }
  }

  // Monitor database query
  async monitorQuery<T>(
    query: string,
    fn: () => Promise<T>,
    labels?: Record<string, string>
  ): Promise<T> {
    return this.monitorFunction(`db_query:${query}`, fn, {
      type: 'database',
      ...labels
    })
  }

  // Monitor API request
  async monitorRequest<T>(
    method: string,
    path: string,
    fn: () => Promise<T>,
    labels?: Record<string, string>
  ): Promise<T> {
    return this.monitorFunction(`api_request:${method}:${path}`, fn, {
      type: 'api',
      method,
      path,
      ...labels
    })
  }
}

// Export instances
export const logger = new Logger()
export const metricsCollector = new MetricsCollector()
export const healthCheckManager = new HealthCheckManager()
export const alertManager = new AlertManager()
export const performanceMonitor = new PerformanceMonitor()

// Middleware for request logging
export function withLogging(handler: any) {
  return async (request: any, ...args: any[]) => {
    const start = Date.now()
    const requestId = request.headers['x-request-id'] || require('crypto').randomUUID()
    
    request.headers['x-request-id'] = requestId
    
    try {
      const response = await handler(request, ...args)
      const duration = Date.now() - start
      
      await logger.logRequest(request, {
        status: response.status,
        responseTime: duration,
        headers: response.headers
      })
      
      return response
    } catch (error) {
      const duration = Date.now() - start
      
      await logger.logError(error as Error, {
        requestId,
        method: request.method,
        url: request.url,
        duration
      })
      
      throw error
    }
  }
}
