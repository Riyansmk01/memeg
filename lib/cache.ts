import { redis } from '@/lib/database'
import { prisma } from '@/lib/database'

// Cache configuration
const cacheConfig = {
  defaultTTL: 3600, // 1 hour
  userTTL: 1800, // 30 minutes
  statsTTL: 300, // 5 minutes
  sessionTTL: 86400, // 24 hours
}

// Cache key generators
export const cacheKeys = {
  user: (id: string) => `user:${id}`,
  userStats: (id: string) => `user:stats:${id}`,
  subscription: (id: string) => `subscription:${id}`,
  payment: (id: string) => `payment:${id}`,
  analytics: (date: string) => `analytics:${date}`,
  systemConfig: (key: string) => `config:${key}`,
}

// Generic cache operations
export class CacheService {
  static async get<T>(key: string): Promise<T | null> {
    try {
      const cached = await redis.get(key)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  static async set(key: string, value: any, ttl: number = cacheConfig.defaultTTL): Promise<void> {
    try {
      await redis.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
    }
  }

  static async del(key: string): Promise<void> {
    try {
      await redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  static async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await (redis as any).keys(pattern)
      if ((keys as string[]).length > 0) {
        await (redis as any).del(...(keys as string[]))
      }
    } catch (error) {
      console.error('Cache delete pattern error:', error)
    }
  }

  static async exists(key: string): Promise<boolean> {
    try {
      return (await redis.exists(key)) === 1
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }
}

// User-specific caching
export class UserCache {
  static async getUser(userId: string) {
    const cacheKey = cacheKeys.user(userId)
    let user = await CacheService.get(cacheKey)
    
    if (!user) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          isActive: true,
          createdAt: true,
          updatedAt: true,
        }
      })
      
      if (user) {
        await CacheService.set(cacheKey, user, cacheConfig.userTTL)
      }
    }
    
    return user
  }

  static async getUserStats(userId: string) {
    const cacheKey = cacheKeys.userStats(userId)
    let stats = await CacheService.get(cacheKey)
    
    if (!stats) {
      // Generate stats from database
      const [totalHectares, totalWorkers, monthlyRevenue, productivity] = await Promise.all([
        prisma.user.findUnique({ where: { id: userId } }).then(u => u ? 25 : 0), // Mock data
        prisma.user.findUnique({ where: { id: userId } }).then(u => u ? 12 : 0), // Mock data
        prisma.payment.aggregate({
          where: { userId, status: 'COMPLETED' },
          _sum: { amount: true }
        }).then(result => Number(result._sum?.amount ?? 0)),
        Promise.resolve(87) // Mock data
      ])
      
      stats = { totalHectares, totalWorkers, monthlyRevenue, productivity }
      await CacheService.set(cacheKey, stats, cacheConfig.statsTTL)
    }
    
    return stats
  }

  static async invalidateUser(userId: string) {
    await Promise.all([
      CacheService.del(cacheKeys.user(userId)),
      CacheService.del(cacheKeys.userStats(userId)),
    ])
  }
}

// Subscription caching
export class SubscriptionCache {
  static async getSubscription(userId: string) {
    const cacheKey = cacheKeys.subscription(userId)
    let subscription = await CacheService.get(cacheKey)
    
    if (!subscription) {
      subscription = await prisma.subscription.findUnique({
        where: { userId }
      })
      
      if (subscription) {
        await CacheService.set(cacheKey, subscription, cacheConfig.userTTL)
      }
    }
    
    return subscription
  }

  static async invalidateSubscription(userId: string) {
    await CacheService.del(cacheKeys.subscription(userId))
  }
}

// Analytics caching
export class AnalyticsCache {
  static async getDailyStats(date: string) {
    const cacheKey = cacheKeys.analytics(date)
    let stats = await CacheService.get(cacheKey)
    
    if (!stats) {
      const startOfDay = new Date(date)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      
      const [pageViews, userRegistrations, payments] = await Promise.all([
        prisma.analytics.count({
          where: {
            event: 'page_view',
            createdAt: { gte: startOfDay, lte: endOfDay }
          }
        }),
        prisma.user.count({
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay }
          }
        }),
        prisma.payment.count({
          where: {
            status: 'COMPLETED',
            createdAt: { gte: startOfDay, lte: endOfDay }
          }
        })
      ])
      
      stats = { pageViews, userRegistrations, payments, date }
      await CacheService.set(cacheKey, stats, cacheConfig.statsTTL)
    }
    
    return stats
  }
}

// System configuration caching
export class ConfigCache {
  static async getConfig(key: string) {
    const cacheKey = cacheKeys.systemConfig(key)
    let config = await CacheService.get(cacheKey)
    
    if (!config) {
      const dbConfig = await prisma.systemConfig.findUnique({
        where: { key }
      })
      
      if (dbConfig) {
        config = {
          key: dbConfig.key,
          value: dbConfig.value,
          type: dbConfig.type,
          isPublic: dbConfig.isPublic
        }
        await CacheService.set(cacheKey, config, cacheConfig.defaultTTL)
      }
    }
    
    return config
  }

  static async setConfig(key: string, value: string, type: string = 'string', isPublic: boolean = false) {
    const config = await prisma.systemConfig.upsert({
      where: { key },
      update: { value, isPublic },
      create: { key, value, isPublic }
    })
    
    // Invalidate cache
    await CacheService.del(cacheKeys.systemConfig(key))
    
    return config
  }
}

// Cache warming functions
export async function warmCache() {
  try {
    console.log('Starting cache warming...')
    
    // Warm user caches
    const users = await prisma.user.findMany({
      select: { id: true },
      take: 100 // Limit to prevent memory issues
    })
    
    await Promise.all(
      users.map(async (user) => {
        await UserCache.getUser(user.id)
        await UserCache.getUserStats(user.id)
      })
    )
    
    // Warm subscription caches
    const subscriptions = await prisma.subscription.findMany({
      select: { userId: true }
    })
    
    await Promise.all(
      subscriptions.map(sub => SubscriptionCache.getSubscription(sub.userId))
    )
    
    // Warm analytics cache for last 7 days
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - i)
      return date.toISOString().split('T')[0]
    })
    
    await Promise.all(
      dates.map(date => AnalyticsCache.getDailyStats(date))
    )
    
    console.log('Cache warming completed')
  } catch (error) {
    console.error('Cache warming failed:', error)
  }
}

// Cache health check
export async function checkCacheHealth() {
  try {
    const pong = await redis.ping()
    return { status: 'healthy', response: pong }
  } catch (error) {
    const message = (error as any)?.message || 'Unknown error'
    return { status: 'unhealthy', error: message }
  }
}
