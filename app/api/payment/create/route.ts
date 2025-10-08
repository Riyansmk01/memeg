import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/api-middleware'
import { z } from 'zod'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const rl = await rateLimit(request)
    if (!rl.allowed) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
    }
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    if (!((session?.user as any)?.id)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const schema = z.object({
      plan: z.enum(['free', 'basic', 'premium', 'enterprise']),
      amount: z.number().nonnegative(),
      method: z.string().min(2).max(50),
    })
    const { plan, amount, method } = schema.parse(body)

    // input tervalidasi oleh zod

    // Generate secure reference ID
    const timestamp = Date.now()
    const randomBytes = crypto.randomBytes(8).toString('hex')
    const referenceId = `ESK-${timestamp}-${randomBytes.toUpperCase()}`

    // Generate secure QR code data
    const qrData = JSON.stringify({
      ref: referenceId,
      amount: amount,
      timestamp: timestamp,
      user: (session.user as any).id
    })

    // Mock payment data with better security
    const paymentData = {
      amount: amount,
      referenceId: referenceId,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`,
      bankAccount: {
        bank: 'BCA',
        accountNumber: '1234567890',
        accountName: 'PT eSawitKu Indonesia',
        swiftCode: 'CENAIDJA'
      },
      expiryTime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      status: 'pending'
    }

    // Log payment creation (in production, save to database)
    console.log(`Payment created for user ${(session.user as any).id}: ${referenceId}`)

    return NextResponse.json(paymentData)
  } catch (error) {
    console.error('Error creating payment:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation error', issues: error.flatten() }, { status: 400 })
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}