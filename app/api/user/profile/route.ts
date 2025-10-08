import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimit } from '@/lib/api-middleware'
import { z } from 'zod'

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
      name: z.string().min(2).max(100),
      email: z.string().email()
    })
    const { name, email } = schema.parse(body)

    if (!name || !email) {
      return NextResponse.json(
        { message: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email,
        id: { not: (session.user as any).id }
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { message: 'Email sudah digunakan oleh pengguna lain' },
        { status: 400 }
      )
    }

    const updatedUser = await prisma.user.update({
      where: { id: (session.user as any).id },
      data: {
        name,
        email,
      }
    })

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        image: updatedUser.image
      }
    })
  } catch (error) {
    console.error('Profile update error:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation error', issues: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
