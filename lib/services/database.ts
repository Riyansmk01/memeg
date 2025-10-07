import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// User Management
export class UserService {
  static async createUser(data: {
    name: string
    email: string
    password: string
    phoneNumber?: string
    address?: string
    personalId?: string
    companyName?: string
    role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'MANAGER' | 'WORKER'
  }) {
    return await prisma.user.create({
      data: {
        ...data,
        role: data.role || 'USER',
        status: 'ACTIVE',
        isActive: true
      }
    })
  }

  static async getUserById(id: string) {
    return await prisma.user.findUnique({
      where: { id },
      include: {
        subscription: true,
        plantations: true,
        workers: true,
        reports: true,
        tasks: true
      }
    })
  }

  static async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email }
    })
  }

  static async updateUser(id: string, data: any) {
    return await prisma.user.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
  }

  static async deleteUser(id: string) {
    return await prisma.user.delete({
      where: { id }
    })
  }

  static async getUsers(page: number = 1, limit: number = 10, filters?: any) {
    const skip = (page - 1) * limit
    
    const where = filters ? {
      ...(filters.role && { role: filters.role }),
      ...(filters.status && { status: filters.status }),
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
      ...(filters.search && {
        OR: [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { email: { contains: filters.search, mode: 'insensitive' } }
        ]
      })
    } : {}

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          subscription: true,
          _count: {
            select: {
              plantations: true,
              workers: true,
              reports: true
            }
          }
        }
      }),
      prisma.user.count({ where })
    ])

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }
}

// Plantation Management
export class PlantationService {
  static async createPlantation(userId: string, data: {
    name: string
    description?: string
    location: string
    latitude?: number
    longitude?: number
    area: number
    soilType?: string
    plantingDate?: Date
    expectedHarvest?: Date
  }) {
    return await prisma.plantation.create({
      data: {
        ...data,
        userId,
        status: 'ACTIVE'
      }
    })
  }

  static async getPlantationById(id: string) {
    return await prisma.plantation.findUnique({
      where: { id },
      include: {
        user: true,
        workers: true,
        reports: true,
        tasks: true,
        _count: {
          select: {
            workers: true,
            reports: true,
            tasks: true
          }
        }
      }
    })
  }

  static async getPlantationsByUser(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const [plantations, total] = await Promise.all([
      prisma.plantation.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              workers: true,
              reports: true,
              tasks: true
            }
          }
        }
      }),
      prisma.plantation.count({ where: { userId } })
    ])

    return {
      plantations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  static async updatePlantation(id: string, data: any) {
    return await prisma.plantation.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
  }

  static async deletePlantation(id: string) {
    return await prisma.plantation.delete({
      where: { id }
    })
  }
}

// Worker Management
export class WorkerService {
  static async createWorker(userId: string, data: {
    plantationId?: string
    name: string
    email?: string
    phoneNumber?: string
    position: string
    salary?: number
    skills?: string[]
    certifications?: string[]
  }) {
    return await prisma.worker.create({
      data: {
        ...data,
        userId,
        status: 'ACTIVE'
      }
    })
  }

  static async getWorkerById(id: string) {
    return await prisma.worker.findUnique({
      where: { id },
      include: {
        user: true,
        plantation: true,
        tasks: true
      }
    })
  }

  static async getWorkersByUser(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const [workers, total] = await Promise.all([
      prisma.worker.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          plantation: true,
          _count: {
            select: {
              tasks: true
            }
          }
        }
      }),
      prisma.worker.count({ where: { userId } })
    ])

    return {
      workers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  static async updateWorker(id: string, data: any) {
    return await prisma.worker.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
  }

  static async deleteWorker(id: string) {
    return await prisma.worker.delete({
      where: { id }
    })
  }
}

// Task Management
export class TaskService {
  static async createTask(userId: string, data: {
    plantationId?: string
    workerId?: string
    title: string
    description?: string
    type: 'PLANTING' | 'HARVESTING' | 'MAINTENANCE' | 'FERTILIZING' | 'PEST_CONTROL' | 'IRRIGATION' | 'PRUNING' | 'OTHER'
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
    dueDate?: Date
    estimatedHours?: number
  }) {
    return await prisma.task.create({
      data: {
        ...data,
        userId,
        status: 'PENDING'
      }
    })
  }

  static async getTaskById(id: string) {
    return await prisma.task.findUnique({
      where: { id },
      include: {
        user: true,
        plantation: true,
        worker: true
      }
    })
  }

  static async getTasksByUser(userId: string, page: number = 1, limit: number = 10, filters?: any) {
    const skip = (page - 1) * limit

    const where = {
      userId,
      ...(filters?.status && { status: filters.status }),
      ...(filters?.type && { type: filters.type }),
      ...(filters?.priority && { priority: filters.priority }),
      ...(filters?.plantationId && { plantationId: filters.plantationId }),
      ...(filters?.workerId && { workerId: filters.workerId })
    }

    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          plantation: true,
          worker: true
        }
      }),
      prisma.task.count({ where })
    ])

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  static async updateTask(id: string, data: any) {
    return await prisma.task.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
  }

  static async completeTask(id: string, actualHours?: number) {
    return await prisma.task.update({
      where: { id },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        actualHours,
        updatedAt: new Date()
      }
    })
  }

  static async deleteTask(id: string) {
    return await prisma.task.delete({
      where: { id }
    })
  }
}

// Report Management
export class ReportService {
  static async createReport(userId: string, data: {
    plantationId?: string
    title: string
    type: 'MONTHLY' | 'WEEKLY' | 'DAILY' | 'HARVEST' | 'MAINTENANCE' | 'FINANCIAL' | 'CUSTOM'
    content: any
    data?: any
    attachments?: string[]
  }) {
    return await prisma.report.create({
      data: {
        ...data,
        userId,
        status: 'DRAFT'
      }
    })
  }

  static async getReportById(id: string) {
    return await prisma.report.findUnique({
      where: { id },
      include: {
        user: true,
        plantation: true
      }
    })
  }

  static async getReportsByUser(userId: string, page: number = 1, limit: number = 10, filters?: any) {
    const skip = (page - 1) * limit

    const where = {
      userId,
      ...(filters?.type && { type: filters.type }),
      ...(filters?.status && { status: filters.status }),
      ...(filters?.plantationId && { plantationId: filters.plantationId })
    }

    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          plantation: true
        }
      }),
      prisma.report.count({ where })
    ])

    return {
      reports,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  static async publishReport(id: string) {
    return await prisma.report.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: new Date(),
        updatedAt: new Date()
      }
    })
  }

  static async updateReport(id: string, data: any) {
    return await prisma.report.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
  }

  static async deleteReport(id: string) {
    return await prisma.report.delete({
      where: { id }
    })
  }
}

// Subscription Management
export class SubscriptionService {
  static async createSubscription(userId: string, plan: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE') {
    return await prisma.subscription.create({
      data: {
        userId,
        plan,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        features: this.getPlanFeatures(plan)
      }
    })
  }

  static async getSubscriptionByUserId(userId: string) {
    return await prisma.subscription.findUnique({
      where: { userId },
      include: {
        user: true
      }
    })
  }

  static async updateSubscription(userId: string, data: any) {
    return await prisma.subscription.update({
      where: { userId },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })
  }

  static async cancelSubscription(userId: string) {
    return await prisma.subscription.update({
      where: { userId },
      data: {
        status: 'CANCELLED',
        cancelledAt: new Date(),
        cancelAtPeriodEnd: true,
        updatedAt: new Date()
      }
    })
  }

  private static getPlanFeatures(plan: string) {
    const features = {
      FREE: {
        plantations: 2,
        workers: 5,
        reports: 10,
        storage: 100,
        api_access: false,
        priority_support: false
      },
      BASIC: {
        plantations: 10,
        workers: 25,
        reports: 100,
        storage: 1000,
        api_access: false,
        priority_support: false
      },
      PREMIUM: {
        plantations: 50,
        workers: 100,
        reports: 500,
        storage: 5000,
        api_access: true,
        priority_support: true
      },
      ENTERPRISE: {
        plantations: -1,
        workers: -1,
        reports: -1,
        storage: -1,
        api_access: true,
        priority_support: true,
        custom_branding: true
      }
    }
    return features[plan as keyof typeof features]
  }
}

// Analytics Service
export class AnalyticsService {
  static async trackEvent(userId: string | null, event: string, properties?: any, sessionId?: string) {
    return await prisma.analytics.create({
      data: {
        userId,
        event,
        properties,
        sessionId,
        createdAt: new Date()
      }
    })
  }

  static async getAnalytics(userId?: string, event?: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    const where = {
      createdAt: { gte: startDate },
      ...(userId && { userId }),
      ...(event && { event })
    }

    return await prisma.analytics.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 1000
    })
  }

  static async getEventStats(userId?: string, days: number = 30) {
    const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000)
    
    const where = {
      createdAt: { gte: startDate },
      ...(userId && { userId })
    }

    return await prisma.analytics.groupBy({
      by: ['event'],
      where,
      _count: {
        event: true
      },
      orderBy: {
        _count: {
          event: 'desc'
        }
      }
    })
  }
}

// Notification Service
export class NotificationService {
  static async createNotification(userId: string, data: {
    title: string
    message: string
    type: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS' | 'TASK_ASSIGNED' | 'PAYMENT_RECEIVED' | 'REPORT_READY' | 'SYSTEM_UPDATE'
    data?: any
  }) {
    return await prisma.notification.create({
      data: {
        ...data,
        userId,
        isRead: false
      }
    })
  }

  static async getNotificationsByUser(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.notification.count({ where: { userId } })
    ])

    return {
      notifications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  static async markAsRead(notificationId: string) {
    return await prisma.notification.update({
      where: { id: notificationId },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })
  }

  static async markAllAsRead(userId: string) {
    return await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: {
        isRead: true,
        readAt: new Date()
      }
    })
  }

  static async getUnreadCount(userId: string) {
    return await prisma.notification.count({
      where: { userId, isRead: false }
    })
  }
}

export { prisma }
