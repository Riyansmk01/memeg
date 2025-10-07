import { PrismaClient } from '@prisma/client'
import { MongoClient } from 'mongodb'
import mysql from 'mysql2/promise'
import Redis from 'ioredis'
import { createHash, createCipher, createDecipher } from 'crypto'

// Database Configuration
const DATABASE_CONFIG = {
  postgresql: {
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/esawitku',
    ssl: process.env.NODE_ENV === 'production'
  },
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306'),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'esawitku'
  },
  mongodb: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/esawitku',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    }
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryDelayOnFailover: 100,
    maxRetriesPerRequest: 3
  }
}

// Encryption Configuration
const ENCRYPTION_CONFIG = {
  algorithm: 'aes-256-gcm',
  key: process.env.ENCRYPTION_KEY || 'esawitku-32-character-encryption-key-2024',
  ivLength: 16
}

// Database Manager Class
export class DatabaseManager {
  private prisma: PrismaClient
  private mongoClient: MongoClient
  private mysqlConnection: mysql.Connection
  private redis: Redis
  private isConnected: boolean = false

  constructor() {
    this.prisma = new PrismaClient({
      datasources: {
        db: {
          url: DATABASE_CONFIG.postgresql.url
        }
      },
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error']
    })
    
    this.mongoClient = new MongoClient(DATABASE_CONFIG.mongodb.url, DATABASE_CONFIG.mongodb.options)
    this.redis = new Redis(DATABASE_CONFIG.redis)
  }

  // Connection Management
  async connect(): Promise<void> {
    try {
      // Connect to PostgreSQL (Prisma)
      await this.prisma.$connect()
      console.log('✅ PostgreSQL connected via Prisma')

      // Connect to MongoDB
      await this.mongoClient.connect()
      console.log('✅ MongoDB connected')

      // Connect to MySQL
      this.mysqlConnection = await mysql.createConnection(DATABASE_CONFIG.mysql)
      console.log('✅ MySQL connected')

      // Connect to Redis
      await this.redis.ping()
      console.log('✅ Redis connected')

      this.isConnected = true
    } catch (error) {
      console.error('❌ Database connection failed:', error)
      throw error
    }
  }

  async disconnect(): Promise<void> {
    try {
      await this.prisma.$disconnect()
      await this.mongoClient.close()
      await this.mysqlConnection.end()
      this.redis.disconnect()
      this.isConnected = false
      console.log('✅ All databases disconnected')
    } catch (error) {
      console.error('❌ Database disconnection failed:', error)
    }
  }

  // Data Encryption/Decryption
  encrypt(text: string): string {
    const iv = require('crypto').randomBytes(ENCRYPTION_CONFIG.ivLength)
    const cipher = createCipher(ENCRYPTION_CONFIG.algorithm, ENCRYPTION_CONFIG.key)
    let encrypted = cipher.update(text, 'utf8', 'hex')
    encrypted += cipher.final('hex')
    return iv.toString('hex') + ':' + encrypted
  }

  decrypt(encryptedText: string): string {
    const textParts = encryptedText.split(':')
    const iv = Buffer.from(textParts.shift()!, 'hex')
    const encryptedData = textParts.join(':')
    const decipher = createDecipher(ENCRYPTION_CONFIG.algorithm, ENCRYPTION_CONFIG.key)
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8')
    decrypted += decipher.final('utf8')
    return decrypted
  }

  // PostgreSQL Operations (Primary Database)
  getPrisma(): PrismaClient {
    return this.prisma
  }

  // MongoDB Operations (Logs, Analytics, Cache)
  async getMongoCollection(collectionName: string) {
    const db = this.mongoClient.db('esawitku')
    return db.collection(collectionName)
  }

  // MySQL Operations (Legacy Data, Reports)
  async queryMySQL(sql: string, params?: any[]): Promise<any> {
    const [rows] = await this.mysqlConnection.execute(sql, params)
    return rows
  }

  // Redis Operations (Caching, Sessions, Rate Limiting)
  getRedis(): Redis {
    return this.redis
  }

  // Backup Operations
  async createBackup(): Promise<{ postgresql: string, mongodb: string, mysql: string }> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = `./backups/${timestamp}`
    
    // Ensure backup directory exists
    const fs = require('fs')
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true })
    }

    const backups = {
      postgresql: '',
      mongodb: '',
      mysql: ''
    }

    try {
      // PostgreSQL Backup
      const { exec } = require('child_process')
      const { promisify } = require('util')
      const execAsync = promisify(exec)

      const pgDumpCmd = `pg_dump "${DATABASE_CONFIG.postgresql.url}" > "${backupDir}/postgresql.sql"`
      await execAsync(pgDumpCmd)
      backups.postgresql = `${backupDir}/postgresql.sql`
      console.log('✅ PostgreSQL backup created')

      // MongoDB Backup
      const mongoDumpCmd = `mongodump --uri="${DATABASE_CONFIG.mongodb.url}" --out="${backupDir}/mongodb"`
      await execAsync(mongoDumpCmd)
      backups.mongodb = `${backupDir}/mongodb`
      console.log('✅ MongoDB backup created')

      // MySQL Backup
      const mysqlDumpCmd = `mysqldump -h${DATABASE_CONFIG.mysql.host} -P${DATABASE_CONFIG.mysql.port} -u${DATABASE_CONFIG.mysql.user} -p${DATABASE_CONFIG.mysql.password} ${DATABASE_CONFIG.mysql.database} > "${backupDir}/mysql.sql"`
      await execAsync(mysqlDumpCmd)
      backups.mysql = `${backupDir}/mysql.sql`
      console.log('✅ MySQL backup created')

      // Compress backup
      const compressCmd = `tar -czf "${backupDir}.tar.gz" -C "${backupDir}" .`
      await execAsync(compressCmd)
      
      // Remove uncompressed files
      fs.rmSync(backupDir, { recursive: true, force: true })
      
      console.log(`✅ Backup compressed: ${backupDir}.tar.gz`)
      return backups

    } catch (error) {
      console.error('❌ Backup failed:', error)
      throw error
    }
  }

  // Health Check
  async healthCheck(): Promise<{
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
      await this.prisma.$queryRaw`SELECT 1`
      health.postgresql = true
    } catch (error) {
      console.error('PostgreSQL health check failed:', error)
    }

    try {
      // MongoDB Health Check
      await this.mongoClient.db('admin').command({ ping: 1 })
      health.mongodb = true
    } catch (error) {
      console.error('MongoDB health check failed:', error)
    }

    try {
      // MySQL Health Check
      await this.mysqlConnection.execute('SELECT 1')
      health.mysql = true
    } catch (error) {
      console.error('MySQL health check failed:', error)
    }

    try {
      // Redis Health Check
      await this.redis.ping()
      health.redis = true
    } catch (error) {
      console.error('Redis health check failed:', error)
    }

    health.overall = health.postgresql && health.mongodb && health.mysql && health.redis
    return health
  }

  // Query Optimization
  async optimizeQueries(): Promise<void> {
    try {
      // PostgreSQL Index Optimization
      const indexes = [
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON users(email)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_created_at ON users(created_at)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_plantations_user_id ON plantations(user_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_workers_user_id ON workers(user_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tasks_status ON tasks(status)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_user_id ON reports(user_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_payments_user_id ON payments(user_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_event ON analytics(event)',
        'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_analytics_created_at ON analytics(created_at)'
      ]

      for (const index of indexes) {
        try {
          await this.prisma.$executeRawUnsafe(index)
        } catch (error) {
          console.warn(`Index creation warning: ${error}`)
        }
      }

      console.log('✅ Database indexes optimized')
    } catch (error) {
      console.error('❌ Query optimization failed:', error)
    }
  }

  // Data Migration
  async migrateData(): Promise<void> {
    try {
      // Migrate sensitive data encryption
      const users = await this.prisma.user.findMany({
        where: {
          OR: [
            { phoneNumber: { not: null } },
            { address: { not: null } },
            { personalId: { not: null } },
            { bankAccount: { not: null } }
          ]
        }
      })

      for (const user of users) {
        const updateData: any = {}
        
        if (user.phoneNumber && !user.phoneNumber.includes(':')) {
          updateData.phoneNumber = this.encrypt(user.phoneNumber)
        }
        if (user.address && !user.address.includes(':')) {
          updateData.address = this.encrypt(user.address)
        }
        if (user.personalId && !user.personalId.includes(':')) {
          updateData.personalId = this.encrypt(user.personalId)
        }
        if (user.bankAccount && !user.bankAccount.includes(':')) {
          updateData.bankAccount = this.encrypt(user.bankAccount)
        }

        if (Object.keys(updateData).length > 0) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: updateData
          })
        }
      }

      console.log('✅ Data migration completed')
    } catch (error) {
      console.error('❌ Data migration failed:', error)
    }
  }
}

// Singleton instance
let dbManager: DatabaseManager | null = null

export function getDatabaseManager(): DatabaseManager {
  if (!dbManager) {
    dbManager = new DatabaseManager()
  }
  return dbManager
}

// Export individual database clients
export const prisma = getDatabaseManager().getPrisma()
export const redis = getDatabaseManager().getRedis()
export const mongoClient = getDatabaseManager().mongoClient

export default DatabaseManager
