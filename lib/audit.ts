import { prisma } from '@/lib/database'

interface AuditLogData {
  userId?: string
  action: string
  resource: string
  resourceId?: string
  oldValues?: any
  newValues?: any
  ipAddress?: string
  userAgent?: string
}

export async function createAuditLog(data: AuditLogData) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        resource: data.resource,
        resourceId: data.resourceId,
        oldValues: data.oldValues,
        newValues: data.newValues,
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      }
    })
  } catch (error) {
    console.error('Audit log creation failed:', error)
  }
}

// Audit trail for user actions
export async function auditUserAction(
  userId: string,
  action: string,
  resource: string,
  resourceId?: string,
  oldValues?: any,
  newValues?: any,
  request?: Request
) {
  await createAuditLog({
    userId,
    action,
    resource,
    resourceId,
    oldValues,
    newValues,
    ipAddress: (request?.headers.get('x-forwarded-for') || request?.headers.get('x-real-ip') || undefined) as string | undefined,
    userAgent: (request?.headers.get('user-agent') || undefined) as string | undefined,
  })
}

// GDPR compliance functions
export async function getUserData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscription: true,
      payments: true,
      auditLogs: true,
      apiKeys: true,
    }
  })

  return user
}

export async function deleteUserData(userId: string) {
  try {
    // Create audit log before deletion
    await createAuditLog({
      userId,
      action: 'DELETE_USER_DATA',
      resource: 'User',
      resourceId: userId,
    })

    // Delete user data (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId }
    })

    return { success: true }
  } catch (error) {
    console.error('User data deletion failed:', error)
    const message = (error as any)?.message || 'Unknown error'
    return { success: false, error: message }
  }
}

export async function anonymizeUserData(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Create audit log
    await createAuditLog({
      userId,
      action: 'ANONYMIZE_USER_DATA',
      resource: 'User',
      resourceId: userId,
      oldValues: {
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        address: user.address,
      },
      newValues: {
        name: 'Anonymized User',
        email: `anonymized_${userId}@deleted.com`,
        phoneNumber: null,
        address: null,
      }
    })

    // Anonymize user data
    await prisma.user.update({
      where: { id: userId },
      data: {
        name: 'Anonymized User',
        email: `anonymized_${userId}@deleted.com`,
        phoneNumber: null,
        address: null,
        personalId: null,
        bankAccount: null,
        isActive: false,
      }
    })

    return { success: true }
  } catch (error) {
    console.error('User data anonymization failed:', error)
    const message = (error as any)?.message || 'Unknown error'
    return { success: false, error: message }
  }
}

// Data export for GDPR compliance
export async function exportUserData(userId: string) {
  const userData = await getUserData(userId)
  
  if (!userData) {
    throw new Error('User not found')
  }

  // Create audit log
  await createAuditLog({
    userId,
    action: 'EXPORT_USER_DATA',
    resource: 'User',
    resourceId: userId,
  })

  return {
    user: {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      createdAt: userData.createdAt,
      updatedAt: userData.updatedAt,
      lastLoginAt: userData.lastLoginAt,
    },
    subscription: userData.subscription,
    payments: userData.payments.map(payment => ({
      id: payment.id,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      createdAt: payment.createdAt,
    })),
    auditLogs: userData.auditLogs.map(log => ({
      action: log.action,
      resource: log.resource,
      createdAt: log.createdAt,
    })),
    exportedAt: new Date().toISOString(),
  }
}
