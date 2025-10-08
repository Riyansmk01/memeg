import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/api-middleware'
import { z } from 'zod'
import bcrypt from 'bcryptjs'

export async function PUT(request: NextRequest) {
  try {
    const rl = await rateLimit(request)
    if (!rl.allowed) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
    }
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }
    if (!((session?.user as any)?.id)) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const schema = z.object({
      currentPassword: z.string().min(6).max(128),
      newPassword: z.string().min(6).max(128)
    })
    const { currentPassword, newPassword } = schema.parse(body)

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { message: 'Current password and new password are required' },
        { status: 400 }
      )
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { message: 'User not found or no password set' },
        { status: 404 }
      )
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)
    
    if (!isCurrentPasswordValid) {
      return NextResponse.json(
        { message: 'Current password is incorrect' },
        { status: 400 }
      )
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 12)

    // Update password
    await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        password: hashedNewPassword
      }
    })

    return NextResponse.json({
      message: 'Password updated successfully'
    })
  } catch (error) {
    console.error('Password update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation error', issues: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
