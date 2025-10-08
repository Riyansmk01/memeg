import { ApolloServer } from '@apollo/server'
import { startServerAndCreateNextHandler } from '@as-integrations/next'
import { NextRequest } from 'next/server'
import { makeExecutableSchema } from '@graphql-tools/schema'
import { prisma } from '@/lib/prisma'
import { apiAuth } from '@/lib/api/core'
import { GraphQLError } from 'graphql'

// GraphQL Type Definitions
const typeDefs = `
  scalar Date
  scalar JSON

  type User {
    id: ID!
    name: String
    email: String!
    image: String
    phoneNumber: String
    address: String
    companyName: String
    role: UserRole!
    status: UserStatus!
    isActive: Boolean!
    createdAt: Date!
    updatedAt: Date!
    lastLoginAt: Date
    subscription: Subscription
    plantations: [Plantation!]!
    workers: [Worker!]!
    reports: [Report!]!
    tasks: [Task!]!
    notifications: [Notification!]!
  }

  type Plantation {
    id: ID!
    userId: String!
    name: String!
    description: String
    location: String!
    latitude: Float
    longitude: Float
    area: Float!
    soilType: String
    plantingDate: Date
    expectedHarvest: Date
    status: PlantationStatus!
    createdAt: Date!
    updatedAt: Date!
    user: User!
    workers: [Worker!]!
    reports: [Report!]!
    tasks: [Task!]!
  }

  type Worker {
    id: ID!
    userId: String!
    plantationId: String
    name: String!
    email: String
    phoneNumber: String
    position: String!
    salary: Float
    startDate: Date!
    endDate: Date
    status: WorkerStatus!
    skills: [String!]!
    certifications: [String!]!
    createdAt: Date!
    updatedAt: Date!
    user: User!
    plantation: Plantation
    tasks: [Task!]!
  }

  type Task {
    id: ID!
    userId: String!
    plantationId: String
    workerId: String
    title: String!
    description: String
    type: TaskType!
    priority: TaskPriority!
    status: TaskStatus!
    dueDate: Date
    completedAt: Date
    estimatedHours: Float
    actualHours: Float
    createdAt: Date!
    updatedAt: Date!
    user: User!
    plantation: Plantation
    worker: Worker
  }

  type Report {
    id: ID!
    userId: String!
    plantationId: String
    title: String!
    type: ReportType!
    content: JSON!
    data: JSON
    attachments: [String!]!
    status: ReportStatus!
    createdAt: Date!
    updatedAt: Date!
    publishedAt: Date
    user: User!
    plantation: Plantation
  }

  type Subscription {
    id: ID!
    userId: String!
    plan: SubscriptionPlan!
    status: SubscriptionStatus!
    currentPeriodStart: Date!
    currentPeriodEnd: Date
    cancelAtPeriodEnd: Boolean!
    createdAt: Date!
    updatedAt: Date!
    cancelledAt: Date
    trialEndsAt: Date
    features: JSON!
    user: User!
  }

  type Payment {
    id: ID!
    userId: String!
    subscriptionId: String
    amount: Float!
    currency: String!
    status: PaymentStatus!
    paymentMethod: PaymentMethod!
    bankCode: String
    bankName: String
    accountNumber: String
    accountName: String
    qrCode: String
    qrCodeUrl: String
    referenceId: String!
    externalId: String
    metadata: JSON
    createdAt: Date!
    updatedAt: Date!
    completedAt: Date
    failedAt: Date
    refundedAt: Date
    expiresAt: Date
    user: User!
  }

  type Notification {
    id: ID!
    userId: String!
    title: String!
    message: String!
    type: NotificationType!
    data: JSON
    isRead: Boolean!
    createdAt: Date!
    readAt: Date
    user: User!
  }

  type ApiKey {
    id: ID!
    userId: String!
    name: String!
    key: String!
    permissions: JSON!
    isActive: Boolean!
    lastUsedAt: Date
    expiresAt: Date
    createdAt: Date!
    updatedAt: Date!
    user: User!
  }

  type AuditLog {
    id: ID!
    userId: String
    action: String!
    resource: String!
    resourceId: String
    oldValues: JSON
    newValues: JSON
    ipAddress: String
    userAgent: String
    createdAt: Date!
    user: User
  }

  type Analytics {
    id: ID!
    event: String!
    userId: String
    sessionId: String
    properties: JSON
    ipAddress: String
    userAgent: String
    createdAt: Date!
  }

  type PaginationInfo {
    page: Int!
    limit: Int!
    total: Int!
    pages: Int!
  }

  type UserConnection {
    users: [User!]!
    pagination: PaginationInfo!
  }

  type PlantationConnection {
    plantations: [Plantation!]!
    pagination: PaginationInfo!
  }

  type WorkerConnection {
    workers: [Worker!]!
    pagination: PaginationInfo!
  }

  type TaskConnection {
    tasks: [Task!]!
    pagination: PaginationInfo!
  }

  type ReportConnection {
    reports: [Report!]!
    pagination: PaginationInfo!
  }

  type NotificationConnection {
    notifications: [Notification!]!
    pagination: PaginationInfo!
  }

  type DashboardStats {
    totalPlantations: Int!
    totalWorkers: Int!
    totalTasks: Int!
    completedTasks: Int!
    pendingTasks: Int!
    totalReports: Int!
    unreadNotifications: Int!
    subscriptionPlan: String!
    subscriptionStatus: String!
  }

  enum UserRole {
    USER
    ADMIN
    SUPER_ADMIN
    MANAGER
    WORKER
  }

  enum UserStatus {
    ACTIVE
    INACTIVE
    SUSPENDED
    PENDING_VERIFICATION
  }

  enum PlantationStatus {
    ACTIVE
    INACTIVE
    MAINTENANCE
    HARVESTING
  }

  enum WorkerStatus {
    ACTIVE
    INACTIVE
    TERMINATED
    ON_LEAVE
  }

  enum TaskType {
    PLANTING
    HARVESTING
    MAINTENANCE
    FERTILIZING
    PEST_CONTROL
    IRRIGATION
    PRUNING
    OTHER
  }

  enum TaskPriority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  enum TaskStatus {
    PENDING
    IN_PROGRESS
    COMPLETED
    CANCELLED
    ON_HOLD
  }

  enum ReportType {
    MONTHLY
    WEEKLY
    DAILY
    HARVEST
    MAINTENANCE
    FINANCIAL
    CUSTOM
  }

  enum ReportStatus {
    DRAFT
    PUBLISHED
    ARCHIVED
  }

  enum SubscriptionPlan {
    FREE
    BASIC
    PREMIUM
    ENTERPRISE
  }

  enum SubscriptionStatus {
    ACTIVE
    CANCELLED
    EXPIRED
    SUSPENDED
    TRIALING
  }

  enum PaymentStatus {
    PENDING
    COMPLETED
    FAILED
    REFUNDED
    CANCELLED
    EXPIRED
  }

  enum PaymentMethod {
    BANK_TRANSFER
    QR_CODE
    CREDIT_CARD
    E_WALLET
    CASH
  }

  enum NotificationType {
    INFO
    WARNING
    ERROR
    SUCCESS
    TASK_ASSIGNED
    PAYMENT_RECEIVED
    REPORT_READY
    SYSTEM_UPDATE
  }

  input UserInput {
    name: String!
    email: String!
    password: String!
    phoneNumber: String
    address: String
    companyName: String
  }

  input PlantationInput {
    name: String!
    description: String
    location: String!
    latitude: Float
    longitude: Float
    area: Float!
    soilType: String
    plantingDate: Date
    expectedHarvest: Date
  }

  input WorkerInput {
    plantationId: String
    name: String!
    email: String
    phoneNumber: String
    position: String!
    salary: Float
    skills: [String!]
    certifications: [String!]
  }

  input TaskInput {
    plantationId: String
    workerId: String
    title: String!
    description: String
    type: TaskType!
    priority: TaskPriority!
    dueDate: Date
    estimatedHours: Float
  }

  input ReportInput {
    plantationId: String
    title: String!
    type: ReportType!
    content: JSON!
    data: JSON
    attachments: [String!]
  }

  input PaginationInput {
    page: Int = 1
    limit: Int = 10
  }

  input UserFilters {
    role: UserRole
    status: UserStatus
    search: String
  }

  input PlantationFilters {
    status: PlantationStatus
    search: String
  }

  input WorkerFilters {
    plantationId: String
    status: WorkerStatus
    search: String
  }

  input TaskFilters {
    plantationId: String
    workerId: String
    status: TaskStatus
    type: TaskType
    priority: TaskPriority
  }

  input ReportFilters {
    plantationId: String
    type: ReportType
    status: ReportStatus
  }

  type Query {
    # User Queries
    me: User
    user(id: ID!): User
    users(pagination: PaginationInput, filters: UserFilters): UserConnection

    # Plantation Queries
    plantation(id: ID!): Plantation
    plantations(pagination: PaginationInput, filters: PlantationFilters): PlantationConnection

    # Worker Queries
    worker(id: ID!): Worker
    workers(pagination: PaginationInput, filters: WorkerFilters): WorkerConnection

    # Task Queries
    task(id: ID!): Task
    tasks(pagination: PaginationInput, filters: TaskFilters): TaskConnection

    # Report Queries
    report(id: ID!): Report
    reports(pagination: PaginationInput, filters: ReportFilters): ReportConnection

    # Dashboard Queries
    dashboardStats: DashboardStats

    # Notification Queries
    notifications(pagination: PaginationInput): NotificationConnection
    unreadNotificationCount: Int!

    # Analytics Queries
    analytics(event: String, days: Int = 30): [Analytics!]!
    eventStats(days: Int = 30): [Analytics!]!

    # System Queries
    auditLogs(pagination: PaginationInput): [AuditLog!]!
    apiKeys: [ApiKey!]!
  }

  type Mutation {
    # User Mutations
    createUser(input: UserInput!): User!
    updateUser(id: ID!, input: UserInput!): User!
    deleteUser(id: ID!): Boolean!

    # Plantation Mutations
    createPlantation(input: PlantationInput!): Plantation!
    updatePlantation(id: ID!, input: PlantationInput!): Plantation!
    deletePlantation(id: ID!): Boolean!

    # Worker Mutations
    createWorker(input: WorkerInput!): Worker!
    updateWorker(id: ID!, input: WorkerInput!): Worker!
    deleteWorker(id: ID!): Boolean!

    # Task Mutations
    createTask(input: TaskInput!): Task!
    updateTask(id: ID!, input: TaskInput!): Task!
    completeTask(id: ID!, actualHours: Float): Task!
    deleteTask(id: ID!): Boolean!

    # Report Mutations
    createReport(input: ReportInput!): Report!
    updateReport(id: ID!, input: ReportInput!): Report!
    publishReport(id: ID!): Report!
    deleteReport(id: ID!): Boolean!

    # Notification Mutations
    markNotificationAsRead(id: ID!): Notification!
    markAllNotificationsAsRead: Boolean!

    # API Key Mutations
    createApiKey(name: String!, permissions: [String!]!): ApiKey!
    revokeApiKey(id: ID!): Boolean!

    # Subscription Mutations
    updateSubscription(plan: SubscriptionPlan!): Subscription!
    cancelSubscription: Subscription!
  }
`

// GraphQL Resolvers
const resolvers = {
  Date: {
    serialize: (date: Date) => date.toISOString(),
    parseValue: (value: string) => new Date(value),
    parseLiteral: (ast: any) => new Date(ast.value)
  },
  JSON: {
    serialize: (value: any) => value,
    parseValue: (value: any) => value,
    parseLiteral: (ast: any) => ast.value
  },

  Query: {
    me: async (_: any, __: any, { user }: any) => {
      if (!user) throw new GraphQLError('Authentication required')
      
      return await prisma.user.findUnique({
        where: { id: user.id },
        include: {
          subscription: true,
          plantations: true,
          workers: true,
          reports: true,
          tasks: true,
          notifications: { where: { isRead: false } }
        }
      })
    },

    user: async (_: any, { id }: any, { user }: any) => {
      if (!user) throw new GraphQLError('Authentication required')
      
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
    },

    users: async (_: any, { pagination = {}, filters = {} }: any, { user }: any) => {
      if (!user || user.role !== 'ADMIN') throw new GraphQLError('Admin access required')
      
      const { page = 1, limit = 10 } = pagination
      const skip = (page - 1) * limit

      const where = {
        ...(filters.role && { role: filters.role }),
        ...(filters.status && { status: filters.status }),
        ...(filters.search && {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { email: { contains: filters.search, mode: 'insensitive' } }
          ]
        })
      }

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
    },

    plantation: async (_: any, { id }: any, { user }: any) => {
      if (!user) throw new GraphQLError('Authentication required')
      
      const plantation = await prisma.plantation.findUnique({
        where: { id },
        include: {
          user: true,
          workers: true,
          reports: true,
          tasks: true
        }
      })

      if (!plantation || plantation.userId !== user.id) {
        throw new GraphQLError('Plantation not found')
      }

      return plantation
    },

    plantations: async (_: any, { pagination = {}, filters = {} }: any, { user }: any) => {
      if (!user) throw new GraphQLError('Authentication required')
      
      const { page = 1, limit = 10 } = pagination
      const skip = (page - 1) * limit

      const where = {
        userId: user.id,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && {
          OR: [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { location: { contains: filters.search, mode: 'insensitive' } }
          ]
        })
      }

      const [plantations, total] = await Promise.all([
        prisma.plantation.findMany({
          where,
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
        prisma.plantation.count({ where })
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
    },

    dashboardStats: async (_: any, __: any, { user }: any) => {
      if (!user) throw new GraphQLError('Authentication required')
      
      const [
        totalPlantations,
        totalWorkers,
        totalTasks,
        completedTasks,
        pendingTasks,
        totalReports,
        unreadNotifications,
        subscription
      ] = await Promise.all([
        prisma.plantation.count({ where: { userId: user.id } }),
        prisma.worker.count({ where: { userId: user.id } }),
        prisma.task.count({ where: { userId: user.id } }),
        prisma.task.count({ where: { userId: user.id, status: 'COMPLETED' } }),
        prisma.task.count({ where: { userId: user.id, status: 'PENDING' } }),
        prisma.report.count({ where: { userId: user.id } }),
        prisma.notification.count({ where: { userId: user.id, isRead: false } }),
        prisma.subscription.findUnique({ where: { userId: user.id } })
      ])

      return {
        totalPlantations,
        totalWorkers,
        totalTasks,
        completedTasks,
        pendingTasks,
        totalReports,
        unreadNotifications,
        subscriptionPlan: subscription?.plan || 'FREE',
        subscriptionStatus: subscription?.status || 'ACTIVE'
      }
    },

    notifications: async (_: any, { pagination = {} }: any, { user }: any) => {
      if (!user) throw new GraphQLError('Authentication required')
      
      const { page = 1, limit = 10 } = pagination
      const skip = (page - 1) * limit

      const [notifications, total] = await Promise.all([
        prisma.notification.findMany({
          where: { userId: user.id },
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' }
        }),
        prisma.notification.count({ where: { userId: user.id } })
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
    },

    unreadNotificationCount: async (_: any, __: any, { user }: any) => {
      if (!user) throw new GraphQLError('Authentication required')
      
      return await prisma.notification.count({
        where: { userId: user.id, isRead: false }
      })
    }
  },

  Mutation: {
    createPlantation: async (_: any, { input }: any, { user }: any) => {
      if (!user) throw new GraphQLError('Authentication required')
      
      return await prisma.plantation.create({
        data: {
          ...input,
          userId: user.id,
          status: 'ACTIVE'
        }
      })
    },

    updatePlantation: async (_: any, { id, input }: any, { user }: any) => {
      if (!user) throw new GraphQLError('Authentication required')
      
      const plantation = await prisma.plantation.findUnique({
        where: { id }
      })

      if (!plantation || plantation.userId !== user.id) {
        throw new GraphQLError('Plantation not found')
      }

      return await prisma.plantation.update({
        where: { id },
        data: {
          ...input,
          updatedAt: new Date()
        }
      })
    },

    createWorker: async (_: any, { input }: any, { user }: any) => {
      if (!user) throw new GraphQLError('Authentication required')
      
      return await prisma.worker.create({
        data: {
          ...input,
          userId: user.id,
          status: 'ACTIVE'
        }
      })
    },

    createTask: async (_: any, { input }: any, { user }: any) => {
      if (!user) throw new GraphQLError('Authentication required')
      
      return await prisma.task.create({
        data: {
          ...input,
          userId: user.id,
          status: 'PENDING'
        }
      })
    },

    completeTask: async (_: any, { id, actualHours }: any, { user }: any) => {
      if (!user) throw new GraphQLError('Authentication required')
      
      const task = await prisma.task.findUnique({
        where: { id }
      })

      if (!task || task.userId !== user.id) {
        throw new GraphQLError('Task not found')
      }

      return await prisma.task.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
          actualHours,
          updatedAt: new Date()
        }
      })
    },

    markNotificationAsRead: async (_: any, { id }: any, { user }: any) => {
      if (!user) throw new GraphQLError('Authentication required')
      
      const notification = await prisma.notification.findUnique({
        where: { id }
      })

      if (!notification || notification.userId !== user.id) {
        throw new GraphQLError('Notification not found')
      }

      return await prisma.notification.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })
    },

    markAllNotificationsAsRead: async (_: any, __: any, { user }: any) => {
      if (!user) throw new GraphQLError('Authentication required')
      
      await prisma.notification.updateMany({
        where: { userId: user.id, isRead: false },
        data: {
          isRead: true,
          readAt: new Date()
        }
      })

      return true
    }
  }
}

// Context function for authentication
const context = async ({ req }: any) => {
  try {
    const authHeader = req.headers.authorization
    const apiKey = req.headers['x-api-key']
    
    if (!authHeader && !apiKey) {
      return { user: null }
    }

    if (apiKey) {
      const key = await apiAuth.verifyApiKey(apiKey)
      return { user: key.user }
    }

    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.substring(7)
      const payload = apiAuth.verifyToken(token)
      return { user: payload }
    }

    return { user: null }
  } catch (error) {
    return { user: null }
  }
}

// Create GraphQL schema
const schema = makeExecutableSchema({
  typeDefs,
  resolvers
})

// Create Apollo Server
const server = new ApolloServer({
  schema,
  introspection: process.env.NODE_ENV === 'development',
  plugins: [
    {
      async requestDidStart() {
        return {
          async willSendResponse(requestContext: any) {
            if (process.env.NODE_ENV === 'development') {
              console.log('GraphQL Query:', requestContext.request.query)
              console.log('GraphQL Variables:', requestContext.request.variables)
            }
          }
        }
      }
    }
  ]
})

// Create a Next-compatible handler and expose per-method handlers
const nextHandler = startServerAndCreateNextHandler(server, { context })

export async function POST(req: NextRequest) {
  return nextHandler(req)
}

export async function GET(req: NextRequest) {
  return nextHandler(req)
}
