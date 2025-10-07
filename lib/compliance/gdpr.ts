import { prisma } from '@/lib/database/manager'
import { logger } from '@/lib/monitoring/observability'
import { NextRequest, NextResponse } from 'next/server'

// GDPR/PDPA Compliance Manager
export class ComplianceManager {
  private logger: any

  constructor() {
    this.logger = logger
  }

  // Data Subject Rights Implementation
  async handleDataSubjectRequest(userId: string, requestType: 'access' | 'portability' | 'rectification' | 'erasure', data?: any): Promise<any> {
    try {
      await this.logger.info(`Data Subject Request: ${requestType}`, { userId, requestType })

      switch (requestType) {
        case 'access':
          return await this.getUserData(userId)
        
        case 'portability':
          return await this.exportUserData(userId)
        
        case 'rectification':
          return await this.updateUserData(userId, data)
        
        case 'erasure':
          return await this.deleteUserData(userId)
        
        default:
          throw new Error('Invalid request type')
      }
    } catch (error) {
      await this.logger.error('Data Subject Request failed', { userId, requestType, error: error.message })
      throw error
    }
  }

  // Right to Access - Get all user data
  private async getUserData(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        subscription: true,
        plantations: true,
        workers: true,
        reports: true,
        tasks: true,
        notifications: true,
        apiKeys: true,
        accounts: true,
        sessions: true,
        payments: true,
        auditLogs: {
          where: { userId },
          orderBy: { createdAt: 'desc' },
          take: 100
        }
      }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Log data access
    await this.logAuditEvent(userId, 'DATA_ACCESS', 'User data accessed', {
      dataTypes: ['personal', 'subscription', 'plantations', 'workers', 'reports', 'tasks', 'notifications', 'apiKeys', 'accounts', 'sessions', 'payments', 'auditLogs']
    })

    return {
      personalData: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        phoneNumber: user.phoneNumber,
        address: user.address,
        personalId: user.personalId,
        bankAccount: user.bankAccount,
        companyName: user.companyName,
        companyAddress: user.companyAddress,
        taxId: user.taxId,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
        preferences: user.preferences,
        metadata: user.metadata,
        timezone: user.timezone,
        language: user.language,
        currency: user.currency
      },
      subscription: user.subscription,
      plantations: user.plantations,
      workers: user.workers,
      reports: user.reports,
      tasks: user.tasks,
      notifications: user.notifications,
      apiKeys: user.apiKeys,
      accounts: user.accounts,
      sessions: user.sessions,
      payments: user.payments,
      auditLogs: user.auditLogs,
      requestDate: new Date().toISOString(),
      requestType: 'access'
    }
  }

  // Right to Data Portability - Export user data
  private async exportUserData(userId: string): Promise<any> {
    const userData = await this.getUserData(userId)
    
    // Create exportable format
    const exportData = {
      ...userData,
      exportDate: new Date().toISOString(),
      exportFormat: 'JSON',
      version: '1.0',
      schema: {
        personalData: 'User personal information',
        subscription: 'Subscription and billing information',
        plantations: 'Plantation management data',
        workers: 'Worker management data',
        reports: 'Reports and documentation',
        tasks: 'Task management data',
        notifications: 'Notification history',
        apiKeys: 'API access keys',
        accounts: 'OAuth account connections',
        sessions: 'Session history',
        payments: 'Payment history',
        auditLogs: 'Audit trail'
      }
    }

    // Log data export
    await this.logAuditEvent(userId, 'DATA_EXPORT', 'User data exported', {
      exportFormat: 'JSON',
      dataSize: JSON.stringify(exportData).length
    })

    return exportData
  }

  // Right to Rectification - Update user data
  private async updateUserData(userId: string, data: any): Promise<any> {
    const oldUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!oldUser) {
      throw new Error('User not found')
    }

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    // Log data rectification
    await this.logAuditEvent(userId, 'DATA_RECTIFICATION', 'User data updated', {
      oldValues: oldUser,
      newValues: updatedUser,
      changedFields: Object.keys(data)
    })

    return updatedUser
  }

  // Right to Erasure (Right to be Forgotten) - Delete user data
  private async deleteUserData(userId: string): Promise<any> {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      throw new Error('User not found')
    }

    // Log data erasure request
    await this.logAuditEvent(userId, 'DATA_ERASURE_REQUEST', 'Data erasure requested', {
      dataTypes: ['all']
    })

    // Soft delete - mark as deleted instead of hard delete
    const deletedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isActive: false,
        status: 'INACTIVE',
        email: `deleted_${Date.now()}@deleted.com`,
        name: 'Deleted User',
        phoneNumber: null,
        address: null,
        personalId: null,
        bankAccount: null,
        companyName: null,
        companyAddress: null,
        taxId: null,
        preferences: null,
        metadata: { deletedAt: new Date().toISOString(), reason: 'GDPR_RIGHT_TO_ERASURE' },
        updatedAt: new Date()
      }
    })

    // Delete related data
    await Promise.all([
      prisma.plantation.deleteMany({ where: { userId } }),
      prisma.worker.deleteMany({ where: { userId } }),
      prisma.task.deleteMany({ where: { userId } }),
      prisma.report.deleteMany({ where: { userId } }),
      prisma.notification.deleteMany({ where: { userId } }),
      prisma.apiKey.deleteMany({ where: { userId } }),
      prisma.session.deleteMany({ where: { userId } }),
      prisma.payment.deleteMany({ where: { userId } }),
      prisma.subscription.deleteMany({ where: { userId } })
    ])

    // Log data erasure completion
    await this.logAuditEvent(userId, 'DATA_ERASURE_COMPLETED', 'Data erasure completed', {
      deletedDataTypes: ['personal', 'subscription', 'plantations', 'workers', 'reports', 'tasks', 'notifications', 'apiKeys', 'sessions', 'payments']
    })

    return {
      message: 'Data erasure completed',
      deletedAt: new Date().toISOString(),
      userId: userId
    }
  }

  // Consent Management
  async recordConsent(userId: string, consentType: string, granted: boolean, purpose: string): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'CONSENT_RECORDED',
        resource: 'Consent',
        resourceId: consentType,
        newValues: {
          consentType,
          granted,
          purpose,
          timestamp: new Date().toISOString()
        }
      }
    })

    await this.logger.info('Consent recorded', { userId, consentType, granted, purpose })
  }

  // Data Processing Lawfulness
  async recordDataProcessing(userId: string, purpose: string, legalBasis: string, dataTypes: string[]): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId,
        action: 'DATA_PROCESSING_RECORDED',
        resource: 'DataProcessing',
        newValues: {
          purpose,
          legalBasis,
          dataTypes,
          timestamp: new Date().toISOString()
        }
      }
    })

    await this.logger.info('Data processing recorded', { userId, purpose, legalBasis, dataTypes })
  }

  // Data Breach Notification
  async recordDataBreach(description: string, affectedUsers: string[], severity: 'low' | 'medium' | 'high' | 'critical'): Promise<void> {
    await prisma.auditLog.create({
      data: {
        action: 'DATA_BREACH_RECORDED',
        resource: 'DataBreach',
        newValues: {
          description,
          affectedUsers,
          severity,
          timestamp: new Date().toISOString(),
          reported: false
        }
      }
    })

    await this.logger.error('Data breach recorded', { description, affectedUsers, severity })

    // In production, this would trigger notifications to authorities and affected users
    console.log(`🚨 DATA BREACH ALERT: ${description}`)
    console.log(`Affected Users: ${affectedUsers.length}`)
    console.log(`Severity: ${severity}`)
  }

  // Privacy Impact Assessment
  async conductPrivacyImpactAssessment(processName: string, dataTypes: string[], purposes: string[]): Promise<any> {
    const assessment = {
      processName,
      dataTypes,
      purposes,
      riskLevel: this.calculateRiskLevel(dataTypes, purposes),
      recommendations: this.generateRecommendations(dataTypes, purposes),
      conductedAt: new Date().toISOString(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    }

    await prisma.auditLog.create({
      data: {
        action: 'PRIVACY_IMPACT_ASSESSMENT',
        resource: 'PIA',
        resourceId: processName,
        newValues: assessment
      }
    })

    await this.logger.info('Privacy Impact Assessment conducted', assessment)
    return assessment
  }

  private calculateRiskLevel(dataTypes: string[], purposes: string[]): 'low' | 'medium' | 'high' {
    const sensitiveDataTypes = ['personalId', 'bankAccount', 'phoneNumber', 'address']
    const highRiskPurposes = ['marketing', 'profiling', 'automated_decision_making']
    
    const hasSensitiveData = dataTypes.some(type => sensitiveDataTypes.includes(type))
    const hasHighRiskPurpose = purposes.some(purpose => highRiskPurposes.includes(purpose))
    
    if (hasSensitiveData && hasHighRiskPurpose) return 'high'
    if (hasSensitiveData || hasHighRiskPurpose) return 'medium'
    return 'low'
  }

  private generateRecommendations(dataTypes: string[], purposes: string[]): string[] {
    const recommendations = []
    
    if (dataTypes.includes('personalId')) {
      recommendations.push('Implement additional encryption for personal ID data')
    }
    
    if (dataTypes.includes('bankAccount')) {
      recommendations.push('Use PCI DSS compliant storage for bank account data')
    }
    
    if (purposes.includes('marketing')) {
      recommendations.push('Obtain explicit consent for marketing purposes')
    }
    
    if (purposes.includes('profiling')) {
      recommendations.push('Implement data subject rights for profiling activities')
    }
    
    recommendations.push('Regular data retention review')
    recommendations.push('Implement data minimization principles')
    
    return recommendations
  }

  // Audit Trail
  private async logAuditEvent(userId: string, action: string, description: string, metadata?: any): Promise<void> {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        resource: 'Compliance',
        newValues: {
          description,
          metadata,
          timestamp: new Date().toISOString()
        }
      }
    })
  }

  // Data Retention Management
  async manageDataRetention(): Promise<void> {
    const retentionPolicies = {
      auditLogs: 7 * 365 * 24 * 60 * 60 * 1000, // 7 years
      sessions: 30 * 24 * 60 * 60 * 1000, // 30 days
      notifications: 90 * 24 * 60 * 60 * 1000, // 90 days
      analytics: 2 * 365 * 24 * 60 * 60 * 1000, // 2 years
      payments: 7 * 365 * 24 * 60 * 60 * 1000 // 7 years
    }

    for (const [dataType, retentionPeriod] of Object.entries(retentionPolicies)) {
      const cutoffDate = new Date(Date.now() - retentionPeriod)
      
      let deletedCount = 0
      
      switch (dataType) {
        case 'auditLogs':
          const auditResult = await prisma.auditLog.deleteMany({
            where: { createdAt: { lt: cutoffDate } }
          })
          deletedCount = auditResult.count
          break
        
        case 'sessions':
          const sessionResult = await prisma.session.deleteMany({
            where: { createdAt: { lt: cutoffDate } }
          })
          deletedCount = sessionResult.count
          break
        
        case 'notifications':
          const notificationResult = await prisma.notification.deleteMany({
            where: { createdAt: { lt: cutoffDate } }
          })
          deletedCount = notificationResult.count
          break
        
        case 'analytics':
          // MongoDB cleanup would go here
          break
        
        case 'payments':
          const paymentResult = await prisma.payment.deleteMany({
            where: { createdAt: { lt: cutoffDate } }
          })
          deletedCount = paymentResult.count
          break
      }
      
      if (deletedCount > 0) {
        await this.logger.info(`Data retention cleanup: ${dataType}`, { deletedCount, cutoffDate })
      }
    }
  }

  // Compliance Reporting
  async generateComplianceReport(): Promise<any> {
    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    const [
      dataAccessRequests,
      dataExportRequests,
      dataRectificationRequests,
      dataErasureRequests,
      consentRecords,
      dataBreaches,
      privacyAssessments
    ] = await Promise.all([
      prisma.auditLog.count({
        where: {
          action: 'DATA_ACCESS',
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.auditLog.count({
        where: {
          action: 'DATA_EXPORT',
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.auditLog.count({
        where: {
          action: 'DATA_RECTIFICATION',
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.auditLog.count({
        where: {
          action: 'DATA_ERASURE_REQUEST',
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.auditLog.count({
        where: {
          action: 'CONSENT_RECORDED',
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.auditLog.count({
        where: {
          action: 'DATA_BREACH_RECORDED',
          createdAt: { gte: thirtyDaysAgo }
        }
      }),
      prisma.auditLog.count({
        where: {
          action: 'PRIVACY_IMPACT_ASSESSMENT',
          createdAt: { gte: thirtyDaysAgo }
        }
      })
    ])

    return {
      reportPeriod: {
        from: thirtyDaysAgo.toISOString(),
        to: now.toISOString()
      },
      dataSubjectRequests: {
        access: dataAccessRequests,
        portability: dataExportRequests,
        rectification: dataRectificationRequests,
        erasure: dataErasureRequests,
        total: dataAccessRequests + dataExportRequests + dataRectificationRequests + dataErasureRequests
      },
      complianceActivities: {
        consentRecords,
        dataBreaches,
        privacyAssessments
      },
      generatedAt: now.toISOString()
    }
  }
}

// Privacy Policy Generator
export class PrivacyPolicyGenerator {
  static generatePrivacyPolicy(): string {
    return `
# Privacy Policy - eSawitKu

## 1. Information We Collect

### Personal Information
- Name and contact information
- Email address and phone number
- Company information
- Bank account details (encrypted)
- Personal identification numbers (encrypted)

### Usage Information
- Plantation management data
- Worker information
- Task and report data
- Payment information
- System usage analytics

## 2. How We Use Your Information

### Primary Purposes
- Provide plantation management services
- Process payments and subscriptions
- Manage user accounts and authentication
- Generate reports and analytics

### Legal Basis
- Contract performance (service provision)
- Legitimate interest (service improvement)
- Consent (marketing communications)
- Legal obligation (tax and compliance)

## 3. Data Sharing

We do not sell your personal information. We may share data with:
- Service providers (payment processors, cloud hosting)
- Legal authorities (when required by law)
- Business partners (with your consent)

## 4. Data Security

- Encryption of sensitive data (AES-256-GCM)
- Secure data transmission (HTTPS/TLS)
- Access controls and authentication
- Regular security audits
- Data breach notification procedures

## 5. Your Rights

### GDPR Rights
- Right to access your data
- Right to data portability
- Right to rectification
- Right to erasure (right to be forgotten)
- Right to restrict processing
- Right to object to processing
- Right to withdraw consent

### PDPA Rights (Indonesia)
- Right to access personal data
- Right to correct personal data
- Right to delete personal data
- Right to withdraw consent

## 6. Data Retention

- Personal data: Until account deletion or 7 years (legal requirement)
- Transaction data: 7 years (tax compliance)
- Usage analytics: 2 years
- Audit logs: 7 years

## 7. Contact Information

For privacy-related inquiries:
- Email: privacy@esawitku.com
- Address: [Company Address]
- Data Protection Officer: [DPO Contact]

## 8. Changes to Privacy Policy

We will notify users of material changes to this policy via email and in-app notifications.

Last Updated: ${new Date().toISOString().split('T')[0]}
    `.trim()
  }
}

// Terms of Service Generator
export class TermsOfServiceGenerator {
  static generateTermsOfService(): string {
    return `
# Terms of Service - eSawitKu

## 1. Acceptance of Terms

By accessing and using eSawitKu, you accept and agree to be bound by the terms and provision of this agreement.

## 2. Description of Service

eSawitKu provides plantation management software as a service (SaaS) including:
- Plantation data management
- Worker management
- Task tracking and reporting
- Payment processing
- Analytics and reporting

## 3. User Accounts

### Account Creation
- Users must provide accurate information
- Users are responsible for account security
- One account per person/entity

### Account Responsibilities
- Maintain accurate information
- Protect account credentials
- Notify us of unauthorized access
- Comply with all applicable laws

## 4. Acceptable Use

### Permitted Uses
- Legitimate plantation management
- Business operations
- Compliance with applicable laws

### Prohibited Uses
- Illegal activities
- Harassment or abuse
- System interference
- Unauthorized access
- Data scraping or mining

## 5. Payment Terms

### Subscription Fees
- Monthly/annual subscription fees
- Payment due in advance
- Automatic renewal unless cancelled

### Refund Policy
- 30-day money-back guarantee
- No refunds for partial periods
- Refunds processed within 14 days

## 6. Data and Privacy

- Users retain ownership of their data
- We process data according to our Privacy Policy
- Users can export their data at any time
- Data deletion available upon request

## 7. Intellectual Property

### Our Rights
- eSawitKu software and platform
- Trademarks and branding
- Proprietary algorithms and methods

### User Rights
- User-generated content
- Plantation and business data
- Custom reports and analytics

## 8. Limitation of Liability

- Service provided "as is"
- No warranty of uninterrupted service
- Limitation of damages
- Force majeure provisions

## 9. Termination

### By User
- Cancel subscription at any time
- Account deletion available
- Data export before termination

### By Company
- Breach of terms
- Non-payment
- Illegal activities
- 30-day notice for other reasons

## 10. Governing Law

These terms are governed by Indonesian law and any disputes will be resolved in Indonesian courts.

## 11. Changes to Terms

We may update these terms and will notify users of material changes.

Last Updated: ${new Date().toISOString().split('T')[0]}
    `.trim()
  }
}

// Export instances
export const complianceManager = new ComplianceManager()

// API Routes for Compliance
export async function handleDataSubjectRequest(request: NextRequest): Promise<NextResponse> {
  try {
    const { userId, requestType, data } = await request.json()
    
    const result = await complianceManager.handleDataSubjectRequest(userId, requestType, data)
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 400 })
  }
}

export async function generateComplianceReport(): Promise<NextResponse> {
  try {
    const report = await complianceManager.generateComplianceReport()
    
    return NextResponse.json({
      success: true,
      data: report,
      timestamp: new Date().toISOString()
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
