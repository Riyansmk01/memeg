import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/api-middleware'
import { z } from 'zod'

export async function PUT(request: NextRequest) {
  try {
    const rl = await rateLimit(request)
    if (!rl.allowed) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
    }
    const session = await getServerSession(authOptions)
    
    if (!((session?.user as any)?.id)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const schema = z.object({
      name: z.string().min(2).max(100).optional(),
      email: z.string().email().optional(),
      notifications: z.object({
        email: z.boolean(),
        push: z.boolean(),
        sms: z.boolean()
      }).optional(),
      privacy: z.object({
        profileVisible: z.boolean(),
        dataSharing: z.boolean()
      }).optional()
    })
    const settings = schema.parse(body)

    // In a real application, you would save these settings to the database
    // For now, we'll just return success
    console.log('User settings updated:', settings)

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings
    })
  } catch (error) {
    console.error('Settings update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation error', issues: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
