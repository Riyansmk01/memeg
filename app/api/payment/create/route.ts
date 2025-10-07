import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import QRCode from 'qrcode'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { plan, amount, method } = await request.json()

    if (!plan || !amount || !method) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique reference ID
    const referenceId = `ESW-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Generate QR code data
    const qrData = JSON.stringify({
      amount: amount,
      reference: referenceId,
      merchant: 'eSawitKu',
      timestamp: new Date().toISOString()
    })

    const qrCode = await QRCode.toDataURL(qrData)

    // Mock bank account data
    const bankAccount = {
      bank: 'Bank Central Asia (BCA)',
      accountNumber: '1234567890',
      accountName: 'PT eSawitKu Indonesia'
    }

    // Create payment record
    const payment = await prisma.payment.create({
      data: {
        userId: session.user.id,
        amount: amount,
        status: 'pending',
        paymentMethod: method,
        referenceId: referenceId,
        qrCode: method === 'qr_code' ? qrCode : null,
        bankCode: method === 'bank_transfer' ? 'BCA' : null,
      }
    })

    return NextResponse.json({
      amount: amount,
      referenceId: referenceId,
      qrCode: method === 'qr_code' ? qrCode : null,
      bankAccount: method === 'bank_transfer' ? bankAccount : null,
      paymentId: payment.id
    })
  } catch (error) {
    console.error('Payment creation error:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}
