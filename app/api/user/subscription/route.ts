import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/api-middleware'

export async function GET(request: NextRequest) {
  try {
    const rl = await rateLimit(request)
    if (!rl.allowed) {
      return NextResponse.json({ message: 'Too many requests' }, { status: 429 })
    }
    const session = await getServerSession(authOptions)
    
    if (!((session?.user as any)?.id)) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    // Mock subscription data for demo purposes
    const subscription = {
      id: 'sub_123',
      plan: 'free',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}