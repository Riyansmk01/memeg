import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const { plan, amount, method } = await request.json()

    // Generate reference ID
    const referenceId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Mock payment data
    const paymentData = {
      amount: amount,
      referenceId: referenceId,
      qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${referenceId}`,
      bankAccount: {
        bank: 'BCA',
        accountNumber: '1234567890',
        accountName: 'PT eSawitKu Indonesia'
      }
    }

    return NextResponse.json(paymentData)
  } catch (error) {
    console.error('Error creating payment:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}