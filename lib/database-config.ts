// Database configuration with multiple providers support
export const databaseConfig = {
  // Primary database (PostgreSQL for production)
  primary: {
    provider: process.env.DATABASE_PROVIDER || 'postgresql',
    url: process.env.DATABASE_URL || 'postgresql://username:password@localhost:5432/esawitku',
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
  
  // Redis for caching and sessions
  redis: {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    password: process.env.REDIS_PASSWORD,
  },
  
  // MongoDB for analytics and logs
  mongodb: {
    url: process.env.MONGODB_URL || 'mongodb://localhost:27017/esawitku_logs',
  },
  
  // Backup configuration
  backup: {
    enabled: process.env.BACKUP_ENABLED === 'true',
    schedule: process.env.BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
    retention: parseInt(process.env.BACKUP_RETENTION || '30'), // 30 days
    s3Bucket: process.env.BACKUP_S3_BUCKET,
    encryptionKey: process.env.BACKUP_ENCRYPTION_KEY,
  }
}

// Encryption configuration
export const encryptionConfig = {
  algorithm: 'aes-256-gcm',
  key: process.env.ENCRYPTION_KEY || 'your-32-character-secret-key-here',
  ivLength: 16,
  
  // Fields that need encryption
  encryptedFields: [
    'password',
    'bankAccountNumber',
    'personalId',
    'phoneNumber',
    'address'
  ]
}

// Database connection pool settings
export const poolConfig = {
  max: 20, // Maximum number of connections
  min: 5,  // Minimum number of connections
  acquire: 30000, // Maximum time to acquire connection
  idle: 10000, // Maximum idle time
  evict: 1000, // Check for idle connections every 1 second
}
