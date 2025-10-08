import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { rateLimit } from '@/lib/api-middleware'
import { prisma } from '@/lib/database'

export const dynamic = 'force-dynamic'

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

    // Get subscription from database
    const subscription = await prisma.subscription.findUnique({
      where: { userId: (session.user as any).id }
    })

    if (!subscription) {
      // Create default free subscription if none exists
      const newSubscription = await prisma.subscription.create({
        data: {
          userId: (session.user as any).id,
          plan: 'FREE',
          status: 'ACTIVE',
          currentPeriodStart: new Date(),
          currentPeriodEnd: null
        }
      })
      
      return NextResponse.json({
        plan: newSubscription.plan,
        status: newSubscription.status,
        startDate: newSubscription.currentPeriodStart,
        endDate: newSubscription.currentPeriodEnd,
        features: getPlanFeatures(newSubscription.plan)
      })
    }

    return NextResponse.json({
      plan: subscription.plan,
      status: subscription.status,
      startDate: subscription.currentPeriodStart,
      endDate: subscription.currentPeriodEnd,
      features: getPlanFeatures(subscription.plan)
    })
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    )
  }
}

function getPlanFeatures(plan: string) {
  const features = {
    FREE: {
      maxHectares: 5,
      maxWorkers: 3,
      reports: false,
      apiAccess: false,
      prioritySupport: false
    },
    BASIC: {
      maxHectares: 50,
      maxWorkers: 20,
      reports: true,
      apiAccess: false,
      prioritySupport: false
    },
    PREMIUM: {
      maxHectares: -1, // unlimited
      maxWorkers: -1, // unlimited
      reports: true,
      apiAccess: true,
      prioritySupport: true
    }
  }
  
  return features[plan as keyof typeof features] || features.FREE
}