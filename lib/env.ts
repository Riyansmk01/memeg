import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXTAUTH_SECRET: z.string().min(10).optional(),
  JWT_SECRET: z.string().min(10).default('esawitku-jwt-secret-2024'),
  DATABASE_URL: z.string().url().optional(),
  REDIS_URL: z.string().optional(),
  MONGODB_URL: z.string().optional(),
})

export const ENV = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
  JWT_SECRET: process.env.JWT_SECRET,
  DATABASE_URL: process.env.DATABASE_URL,
  REDIS_URL: process.env.REDIS_URL,
  MONGODB_URL: process.env.MONGODB_URL,
})
