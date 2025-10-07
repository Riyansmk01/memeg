import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { plan, amount, method } = await request.json()

    // Validate input
    if (!plan || !amount || !method) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate plan
    const validPlans = ['free', 'basic', 'premium', 'enterprise']
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { message: 'Invalid plan' },
        { status: 400 }
      )
    }

    // Validate amount
    if (amount < 0) {
      return NextResponse.json(
        { message: 'Invalid amount' },
        { status: 400 }
      )
    }

    // Generate secure reference ID
    const timestamp = Date.now()
    const randomBytes = crypto.randomBytes(8).toString('hex')
    const referenceId = `ESK-${timestamp}-${randomBytes.toUpperCase()}`

    // Generate secure QR code data
    const qrData = JSON.stringify({
      ref: referenceId,
      amount: amount,
      timestamp: timestamp,
      user: session.user.id
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
    console.log(`Payment created for user ${session.user.id}: ${referenceId}`)

    return NextResponse.json(paymentData)
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}