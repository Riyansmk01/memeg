import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redis } from '@/lib/database'
import { prisma } from '@/lib/database'
import { createAuditLog } from '@/lib/audit'

// Rate limiting configuration
const rateLimitConfig = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // limit each IP to 100 requests per windowMs
  skipSuccessfulRequests: false,
}

// API Key validation
export async function validateApiKey(request: NextRequest): Promise<{ valid: boolean; userId?: string; permissions?: string[] }> {
  const apiKey = request.headers.get('x-api-key')
  
  if (!apiKey) {
    return { valid: false }
  }

  try {
    const keyData = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: { user: true }
    })

    if (!keyData || !keyData.isActive) {
      return { valid: false }
    }

    // Check if key is expired
    if (keyData.expiresAt && keyData.expiresAt < new Date()) {
      return { valid: false }
    }

    // Update last used timestamp
    await prisma.apiKey.update({
      where: { id: keyData.id },
      data: { lastUsedAt: new Date() }
    })

    return {
      valid: true,
      userId: keyData.userId,
      permissions: keyData.permissions as string[]
    }
  } catch (error) {
    console.error('API key validation error:', error)
    return { valid: false }
  }
}

// Rate limiting middleware
export async function rateLimit(request: NextRequest): Promise<{ allowed: boolean; remaining?: number }> {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const key = `rate_limit:${ip}`
  
  try {
    const current = await redis.incr(key)
    
    if (current === 1) {
      await redis.expire(key, Math.floor(rateLimitConfig.windowMs / 1000))
    }
    
    const remaining = Math.max(0, rateLimitConfig.maxRequests - current)
    
    return {
      allowed: current <= rateLimitConfig.maxRequests,
      remaining
    }
  } catch (error) {
    console.error('Rate limiting error:', error)
    return { allowed: true } // Allow on error
  }
}

// Authentication middleware
export async function authenticateRequest(request: NextRequest): Promise<{ authenticated: boolean; user?: any; method: 'session' | 'apikey' }> {
  // Try API key authentication first
  const apiKeyAuth = await validateApiKey(request)
  if (apiKeyAuth.valid) {
    const user = await prisma.user.findUnique({
      where: { id: apiKeyAuth.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      }
    })
    
    if (user && user.isActive) {
      return { authenticated: true, user, method: 'apikey' }
    }
  }

  // Try session authentication
  const session = await getServerSession(authOptions)
  if (session?.user) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
      }
    })
    
    if (user && user.isActive) {
      return { authenticated: true, user, method: 'session' }
    }
  }

  return { authenticated: false }
}

// Permission checking
export function checkPermission(userPermissions: string[], requiredPermissions: string[]): boolean {
  return requiredPermissions.every(permission => userPermissions.includes(permission))
}

// API Response wrapper
export class ApiResponse {
  static success(data: any, message?: string, status: number = 200) {
    return NextResponse.json({
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    }, { status })
  }

  static error(message: string, status: number = 400, details?: any) {
    return NextResponse.json({
      success: false,
      error: message,
      details,
      timestamp: new Date().toISOString()
    }, { status })
  }

  static unauthorized(message: string = 'Unauthorized') {
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }, { status: 401 })
  }

  static forbidden(message: string = 'Forbidden') {
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }, { status: 403 })
  }

  static rateLimited(message: string = 'Too many requests') {
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }, { status: 429 })
  }

  static notFound(message: string = 'Resource not found') {
    return NextResponse.json({
      success: false,
      error: message,
      timestamp: new Date().toISOString()
    }, { status: 404 })
  }

  static serverError(message: string = 'Internal server error', details?: any) {
    return NextResponse.json({
      success: false,
      error: message,
      details,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Request logging middleware
export async function logRequest(request: NextRequest, response: NextResponse, userId?: string) {
  try {
    const logData = {
      method: request.method,
      url: request.url,
      userAgent: request.headers.get('user-agent'),
      ip: request.ip || request.headers.get('x-forwarded-for'),
      userId,
      status: response.status,
      timestamp: new Date().toISOString(),
    }

    // Store in MongoDB for analytics
    await prisma.analytics.create({
      data: {
        event: 'api_request',
        userId,
        properties: logData,
        ipAddress: logData.ip,
        userAgent: logData.userAgent,
      }
    })

    // Also log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', logData)
    }
  } catch (error) {
    console.error('Request logging error:', error)
  }
}

// API middleware wrapper
export function withApiAuth(
  handler: (request: NextRequest, context: { user: any; method: 'session' | 'apikey' }) => Promise<NextResponse>,
  options: {
    requiredPermissions?: string[]
    rateLimit?: boolean
    auditLog?: boolean
  } = {}
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      // Rate limiting
      if (options.rateLimit !== false) {
        const rateLimitResult = await rateLimit(request)
        if (!rateLimitResult.allowed) {
          return ApiResponse.rateLimited()
        }
      }

      // Authentication
      const authResult = await authenticateRequest(request)
      if (!authResult.authenticated || !authResult.user) {
        return ApiResponse.unauthorized()
      }

      // Permission checking
      if (options.requiredPermissions && options.requiredPermissions.length > 0) {
        const userPermissions = authResult.user.role === 'admin' ? ['*'] : ['read'] // Simplified for demo
        if (!checkPermission(userPermissions, options.requiredPermissions)) {
          return ApiResponse.forbidden('Insufficient permissions')
        }
      }

      // Execute handler
      const response = await handler(request, { user: authResult.user, method: authResult.method })

      // Audit logging
      if (options.auditLog !== false) {
        await createAuditLog({
          userId: authResult.user.id,
          action: `${request.method} ${request.url}`,
          resource: 'API',
          ipAddress: request.ip || request.headers.get('x-forwarded-for'),
          userAgent: request.headers.get('user-agent'),
        })
      }

      // Request logging
      await logRequest(request, response, authResult.user.id)

      return response
    } catch (error) {
      console.error('API middleware error:', error)
      return ApiResponse.serverError('Internal server error', process.env.NODE_ENV === 'development' ? error : undefined)
    }
  }
}
