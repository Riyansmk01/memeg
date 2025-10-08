import { PrismaClient } from '@prisma/client'
import { databaseConfig } from './database-config'
import { encrypt } from './encryption'

// Simple Prisma client for development
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Mock Redis client for development
export const redis = {
  get: async (key: string) => null,
  set: async (key: string, value: string) => 'OK',
  setex: async (key: string, ttl: number, value: string) => 'OK',
  del: async (key: string) => 1,
  keys: async (pattern: string) => [] as string[],
  exists: async (key: string) => 0,
  ping: async () => 'PONG',
  incr: async (key: string) => 1,
  expire: async (key: string, seconds: number) => 1,
  quit: async () => 'OK',
}

// Mock MongoDB client for development
export const mongoDb = {
  collection: (name: string) => ({
    insertOne: async (doc: any) => ({ insertedId: 'mock-id' }),
    find: () => ({ toArray: async () => [] }),
    updateOne: async (filter: any, update: any) => ({ modifiedCount: 1 }),
    deleteOne: async (filter: any) => ({ deletedCount: 1 }),
  }),
  admin: () => ({
    ping: async () => ({ ok: 1 }),
  }),
}

// Database health check
export async function checkDatabaseHealth() {
  const health = {
    prisma: false,
    redis: false,
    mongodb: false,
    timestamp: new Date().toISOString(),
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    health.prisma = true
  } catch (error) {
    console.error('Prisma health check failed:', error)
  }

  try {
    await redis.ping()
    health.redis = true
  } catch (error) {
    console.error('Redis health check failed:', error)
  }

  try {
    await mongoDb.admin().ping()
    health.mongodb = true
  } catch (error) {
    console.error('MongoDB health check failed:', error)
  }

  return health
}

// Database backup function
export async function createDatabaseBackup() {
  if (!databaseConfig.backup.enabled) return

  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupData = {
      users: await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
          updatedAt: true,
        }
      }),
      subscriptions: await prisma.subscription.findMany(),
      payments: await prisma.payment.findMany(),
      timestamp,
    }

    // Encrypt backup data
    const encryptedBackup = encrypt(JSON.stringify(backupData))
    
    // Store backup (implement S3 or local storage)
    console.log(`Backup created: ${timestamp}`)
    
    return { success: true, timestamp }
  } catch (error) {
    console.error('Backup failed:', error)
    const message = (error as any)?.message || 'Unknown error'
    return { success: false, error: message }
  }
}

// Database optimization functions
export async function optimizeDatabase() {
  try {
    // Create indexes for better performance
    await prisma.$executeRaw`
      CREATE INDEX IF NOT EXISTS idx_user_email ON "User"("email");
      CREATE INDEX IF NOT EXISTS idx_subscription_user_id ON "Subscription"("userId");
      CREATE INDEX IF NOT EXISTS idx_payment_user_id ON "Payment"("userId");
      CREATE INDEX IF NOT EXISTS idx_payment_status ON "Payment"("status");
      CREATE INDEX IF NOT EXISTS idx_payment_created_at ON "Payment"("createdAt");
    `
    
    // Analyze tables for query optimization
    await prisma.$executeRaw`ANALYZE;`
    
    console.log('Database optimization completed')
    return { success: true }
  } catch (error) {
    console.error('Database optimization failed:', error)
    const message = (error as any)?.message || 'Unknown error'
    return { success: false, error: message }
  }
}

// Graceful shutdown
export async function closeDatabaseConnections() {
  try {
    await prisma.$disconnect()
    await redis.quit()
    console.log('Database connections closed')
  } catch (error) {
    console.error('Error closing database connections:', error)
  }
}
