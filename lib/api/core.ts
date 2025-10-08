import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { ENV } from '@/lib/env'
import { prisma } from '@/lib/database'
import { redis } from '@/lib/database'
import { z } from 'zod'

// API Configuration
const API_CONFIG = {
  jwtSecret: ENV.JWT_SECRET,
  jwtExpiresIn: '24h',
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
  rateLimitMax: 100, // requests per window
  apiKeyExpiresIn: '30d'
}

// Rate Limiting
export class RateLimiter {
  private redis: any

  constructor(redis: any) {
    this.redis = redis
  }

  async checkLimit(identifier: string, limit: number, window: number): Promise<boolean> {
    const key = `rate_limit:${identifier}`
    const current = await this.redis.incr(key)
    
    if (current === 1) {
      await this.redis.expire(key, Math.ceil(window / 1000))
    }
    
    return current <= limit
  }

  async getRemaining(identifier: string, limit: number): Promise<number> {
    const key = `rate_limit:${identifier}`
    const current = await this.redis.get(key) || 0
    return Math.max(0, limit - parseInt(current))
  }
}

// API Authentication
export class APIAuthentication {
  private rateLimiter: RateLimiter

  constructor(rateLimiter: RateLimiter) {
    this.rateLimiter = rateLimiter
  }

  // JWT Token Generation
  generateToken(payload: any): string {
    return jwt.sign(payload, API_CONFIG.jwtSecret as string, {
      expiresIn: API_CONFIG.jwtExpiresIn,
      issuer: 'esawitku-api',
      audience: 'esawitku-client'
    } as jwt.SignOptions)
  }

  // JWT Token Verification
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, API_CONFIG.jwtSecret as string, {
        issuer: 'esawitku-api',
        audience: 'esawitku-client'
      } as jwt.VerifyOptions)
    } catch (error) {
      throw new Error('Invalid token')
    }
  }

  // API Key Generation
  async generateApiKey(userId: string, name: string, permissions: string[]): Promise<string> {
    const apiKey = `esk_${require('crypto').randomBytes(32).toString('hex')}`
    
    await prisma.apiKey.create({
      data: {
        userId,
        name,
        key: apiKey,
        permissions: JSON.stringify(permissions) as unknown as any,
        isActive: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    })

    return apiKey
  }

  // API Key Verification
  async verifyApiKey(apiKey: string): Promise<any> {
    const key = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    })

    if (!key || !key.isActive || (key.expiresAt && key.expiresAt < new Date())) {
      throw new Error('Invalid or expired API key')
    }

    // Update last used
    await prisma.apiKey.update({
      where: { id: key.id },
      data: { lastUsedAt: new Date() }
    })

    return key
  }

  // OAuth2 Token Exchange
  async exchangeOAuthToken(code: string, provider: string): Promise<any> {
    // Implement OAuth2 token exchange logic
    // This would integrate with Google, GitHub, Facebook OAuth providers
    const tokenData = {
      access_token: 'oauth_access_token',
      refresh_token: 'oauth_refresh_token',
      expires_in: 3600,
      token_type: 'Bearer'
    }

    return tokenData
  }

  // Middleware for API Authentication
  async authenticateRequest(request: NextRequest): Promise<any> {
    const authHeader = request.headers.get('authorization')
    const apiKey = request.headers.get('x-api-key')
    
    if (!authHeader && !apiKey) {
      throw new Error('Authentication required')
    }

    if (apiKey) {
      return await this.verifyApiKey(apiKey)
    }

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      return this.verifyToken(token)
    }

    throw new Error('Invalid authentication method')
  }

  // Rate Limiting Middleware
  async checkRateLimit(request: NextRequest, identifier: string): Promise<void> {
    const allowed = await this.rateLimiter.checkLimit(
      identifier,
      API_CONFIG.rateLimitMax,
      API_CONFIG.rateLimitWindow
    )

    if (!allowed) {
      throw new Error('Rate limit exceeded')
    }
  }
}

// API Response Helper
export class APIResponse {
  static success(data: any, message?: string, meta?: any): NextResponse {
    return NextResponse.json({
      success: true,
      message: message || 'Success',
      data,
      meta,
      timestamp: new Date().toISOString()
    })
  }

  static error(message: string, status: number = 400, details?: any): NextResponse {
    return NextResponse.json({
      success: false,
      message,
      details,
      timestamp: new Date().toISOString()
    }, { status })
  }

  static unauthorized(message: string = 'Unauthorized'): NextResponse {
    return this.error(message, 401)
  }

  static forbidden(message: string = 'Forbidden'): NextResponse {
    return this.error(message, 403)
  }

  static notFound(message: string = 'Not found'): NextResponse {
    return this.error(message, 404)
  }

  static rateLimited(message: string = 'Rate limit exceeded'): NextResponse {
    return this.error(message, 429)
  }

  static serverError(message: string = 'Internal server error'): NextResponse {
    return this.error(message, 500)
  }
}

// API Logging
export class APILogger {
  static async logRequest(request: NextRequest, response: NextResponse, userId?: string): Promise<void> {
    const startHeader = request.headers.get('x-start-time')
    const startMs = startHeader ? Number(startHeader) : undefined
    const logData = {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      userId,
      statusCode: response.status,
      timestamp: new Date(),
      responseTime: startMs ? Date.now() - startMs : 0
    }

    // Log to MongoDB
    // Persisting to Mongo is disabled in this environment

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', logData)
    }
  }
}

// API Validation Schemas
export const ValidationSchemas = {
  user: {
    create: z.object({
      name: z.string().min(2).max(100),
      email: z.string().email(),
      password: z.string().min(8),
      phoneNumber: z.string().optional(),
      address: z.string().optional(),
      companyName: z.string().optional()
    }),
    update: z.object({
      name: z.string().min(2).max(100).optional(),
      phoneNumber: z.string().optional(),
      address: z.string().optional(),
      companyName: z.string().optional(),
      preferences: z.object({}).optional()
    })
  },
  plantation: {
    create: z.object({
      name: z.string().min(2).max(100),
      description: z.string().optional(),
      location: z.string().min(2),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      area: z.number().positive(),
      soilType: z.string().optional(),
      plantingDate: z.string().datetime().optional(),
      expectedHarvest: z.string().datetime().optional()
    }),
    update: z.object({
      name: z.string().min(2).max(100).optional(),
      description: z.string().optional(),
      location: z.string().min(2).optional(),
      latitude: z.number().optional(),
      longitude: z.number().optional(),
      area: z.number().positive().optional(),
      soilType: z.string().optional(),
      status: z.enum(['ACTIVE', 'INACTIVE', 'MAINTENANCE', 'HARVESTING']).optional()
    })
  },
  worker: {
    create: z.object({
      plantationId: z.string().optional(),
      name: z.string().min(2).max(100),
      email: z.string().email().optional(),
      phoneNumber: z.string().optional(),
      position: z.string().min(2),
      salary: z.number().positive().optional(),
      skills: z.array(z.string()).optional(),
      certifications: z.array(z.string()).optional()
    }),
    update: z.object({
      name: z.string().min(2).max(100).optional(),
      email: z.string().email().optional(),
      phoneNumber: z.string().optional(),
      position: z.string().min(2).optional(),
      salary: z.number().positive().optional(),
      skills: z.array(z.string()).optional(),
      certifications: z.array(z.string()).optional(),
      status: z.enum(['ACTIVE', 'INACTIVE', 'TERMINATED', 'ON_LEAVE']).optional()
    })
  },
  task: {
    create: z.object({
      plantationId: z.string().optional(),
      workerId: z.string().optional(),
      title: z.string().min(2).max(200),
      description: z.string().optional(),
      type: z.enum(['PLANTING', 'HARVESTING', 'MAINTENANCE', 'FERTILIZING', 'PEST_CONTROL', 'IRRIGATION', 'PRUNING', 'OTHER']),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
      dueDate: z.string().datetime().optional(),
      estimatedHours: z.number().positive().optional()
    }),
    update: z.object({
      title: z.string().min(2).max(200).optional(),
      description: z.string().optional(),
      type: z.enum(['PLANTING', 'HARVESTING', 'MAINTENANCE', 'FERTILIZING', 'PEST_CONTROL', 'IRRIGATION', 'PRUNING', 'OTHER']).optional(),
      priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
      status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'ON_HOLD']).optional(),
      dueDate: z.string().datetime().optional(),
      estimatedHours: z.number().positive().optional(),
      actualHours: z.number().positive().optional()
    })
  },
  report: {
    create: z.object({
      plantationId: z.string().optional(),
      title: z.string().min(2).max(200),
      type: z.enum(['MONTHLY', 'WEEKLY', 'DAILY', 'HARVEST', 'MAINTENANCE', 'FINANCIAL', 'CUSTOM']),
      content: z.object({}).passthrough(),
      data: z.object({}).passthrough().optional(),
      attachments: z.array(z.string()).optional()
    }),
    update: z.object({
      title: z.string().min(2).max(200).optional(),
      type: z.enum(['MONTHLY', 'WEEKLY', 'DAILY', 'HARVEST', 'MAINTENANCE', 'FINANCIAL', 'CUSTOM']).optional(),
      content: z.object({}).passthrough().optional(),
      data: z.object({}).passthrough().optional(),
      attachments: z.array(z.string()).optional(),
      status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).optional()
    })
  }
}

// API Middleware Factory
export function createAPIMiddleware(auth: APIAuthentication, rateLimiter: RateLimiter) {
  return async function apiMiddleware(
    request: NextRequest,
    handler: (request: NextRequest, user: any) => Promise<NextResponse>
  ): Promise<NextResponse> {
    try {
      // Add start time for response time calculation
      request.headers.set('x-start-time', Date.now().toString())

      // Rate limiting
      const identifier = request.headers.get('x-forwarded-for') || 
                        request.headers.get('x-real-ip') || 
                        'unknown'
      
      await auth.checkRateLimit(request, identifier)

      // Authentication
      const user = await auth.authenticateRequest(request)

      // Execute handler
      const response = await handler(request, user)

      // Log request
      await APILogger.logRequest(request, response, user.id)

      return response

    } catch (error: any) {
      console.error('API Middleware Error:', error)
      
      if (error.message === 'Rate limit exceeded') {
        return APIResponse.rateLimited()
      }
      
      if (error.message === 'Authentication required' || error.message === 'Invalid token') {
        return APIResponse.unauthorized()
      }
      
      if (error.message === 'Invalid or expired API key') {
        return APIResponse.forbidden('Invalid API key')
      }

      return APIResponse.serverError(error.message)
    }
  }
}

// Export instances
const rateLimiter = new RateLimiter(redis)
export const apiAuth = new APIAuthentication(rateLimiter)
export const apiMiddleware = createAPIMiddleware(apiAuth, rateLimiter)
