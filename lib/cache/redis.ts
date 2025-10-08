import Redis from 'ioredis'

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
})

export class CacheService {
  static async get(key: string) {
    try {
      const value = await redis.get(key)
      return value ? JSON.parse(value) : null
    } catch (error) {
      console.error('Redis get error:', error)
      return null
    }
  }

  static async set(key: string, value: any, ttl: number = 3600) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value))
      return true
    } catch (error) {
      console.error('Redis set error:', error)
      return false
    }
  }

  static async del(key: string) {
    try {
      await redis.del(key)
      return true
    } catch (error) {
      console.error('Redis delete error:', error)
      return false
    }
  }

  static async exists(key: string) {
    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error('Redis exists error:', error)
      return false
    }
  }

  static async increment(key: string, ttl?: number) {
    try {
      const result = await redis.incr(key)
      if (ttl) {
        await redis.expire(key, ttl)
      }
      return result
    } catch (error) {
      console.error('Redis increment error:', error)
      return 0
    }
  }

  static async expire(key: string, ttl: number) {
    try {
      await redis.expire(key, ttl)
      return true
    } catch (error) {
      console.error('Redis expire error:', error)
      return false
    }
  }

  // Cache patterns
  static async cacheUserData(userId: string, data: any, ttl: number = 1800) {
    return this.set(`user:${userId}`, data, ttl)
  }

  static async getCachedUserData(userId: string) {
    return this.get(`user:${userId}`)
  }

  static async cacheAnalytics(userId: string, type: string, data: any, ttl: number = 3600) {
    return this.set(`analytics:${userId}:${type}`, data, ttl)
  }

  static async getCachedAnalytics(userId: string, type: string) {
    return this.get(`analytics:${userId}:${type}`)
  }

  static async cacheSystemStats(data: any, ttl: number = 300) {
    return this.set('system:stats', data, ttl)
  }

  static async getCachedSystemStats() {
    return this.get('system:stats')
  }

  // Rate limiting
  static async checkRateLimit(identifier: string, limit: number, window: number) {
    const key = `rate_limit:${identifier}`
    const current = await this.increment(key, window)
    
    if (current === 1) {
      await this.expire(key, window)
    }
    
    return {
      allowed: current <= limit,
      remaining: Math.max(0, limit - current),
      resetTime: Date.now() + (window * 1000)
    }
  }

  // Session management
  static async setSession(sessionId: string, data: any, ttl: number = 86400) {
    return this.set(`session:${sessionId}`, data, ttl)
  }

  static async getSession(sessionId: string) {
    return this.get(`session:${sessionId}`)
  }

  static async deleteSession(sessionId: string) {
    return this.del(`session:${sessionId}`)
  }

  // Cache invalidation
  static async invalidateUserCache(userId: string) {
    const keys = await redis.keys(`user:${userId}*`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }

  static async invalidateAnalyticsCache(userId: string) {
    const keys = await redis.keys(`analytics:${userId}:*`)
    if (keys.length > 0) {
      await redis.del(...keys)
    }
  }

  // Health check
  static async healthCheck() {
    try {
      await redis.ping()
      return { status: 'healthy', message: 'Redis connection successful' }
    } catch (error) {
      return { 
        status: 'unhealthy', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}
