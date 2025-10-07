import { describe, it, expect, beforeEach, afterEach } from '@jest/globals'
import { prisma } from '@/lib/database/manager'
import { UserService, PlantationService, WorkerService, TaskService, ReportService } from '@/lib/services/database'
import { cacheManager } from '@/lib/performance/cache'
import { complianceManager } from '@/lib/compliance/gdpr'

// Test Database Setup
const TEST_DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/esawitku_test'

describe('eSawitKu Unit Tests', () => {
  beforeEach(async () => {
    // Clean database before each test
    await prisma.user.deleteMany()
    await prisma.plantation.deleteMany()
    await prisma.worker.deleteMany()
    await prisma.task.deleteMany()
    await prisma.report.deleteMany()
    await prisma.subscription.deleteMany()
    await prisma.payment.deleteMany()
    await prisma.notification.deleteMany()
    await prisma.apiKey.deleteMany()
    await prisma.auditLog.deleteMany()
  })

  afterEach(async () => {
    // Clean up after each test
    await prisma.$disconnect()
  })

  describe('UserService', () => {
    it('should create a user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        phoneNumber: '+6281234567890',
        companyName: 'Test Company'
      }

      const user = await UserService.createUser(userData)

      expect(user).toBeDefined()
      expect(user.name).toBe(userData.name)
      expect(user.email).toBe(userData.email)
      expect(user.role).toBe('USER')
      expect(user.status).toBe('ACTIVE')
      expect(user.isActive).toBe(true)
    })

    it('should get user by ID', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const createdUser = await UserService.createUser(userData)
      const user = await UserService.getUserById(createdUser.id)

      expect(user).toBeDefined()
      expect(user.id).toBe(createdUser.id)
      expect(user.name).toBe(userData.name)
    })

    it('should update user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      }

      const user = await UserService.createUser(userData)
      const updatedUser = await UserService.updateUser(user.id, { name: 'Updated Name' })

      expect(updatedUser.name).toBe('Updated Name')
      expect(updatedUser.email).toBe(userData.email)
    })

    it('should get users with pagination', async () => {
      // Create multiple users
      for (let i = 0; i < 15; i++) {
        await UserService.createUser({
          name: `User ${i}`,
          email: `user${i}@example.com`,
          password: 'password123'
        })
      }

      const result = await UserService.getUsers(1, 10)
      
      expect(result.users).toHaveLength(10)
      expect(result.pagination.total).toBe(15)
      expect(result.pagination.pages).toBe(2)
    })

    it('should filter users by role', async () => {
      await UserService.createUser({
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'password123',
        role: 'ADMIN'
      })

      await UserService.createUser({
        name: 'Regular User',
        email: 'user@example.com',
        password: 'password123',
        role: 'USER'
      })

      const result = await UserService.getUsers(1, 10, { role: 'ADMIN' })
      
      expect(result.users).toHaveLength(1)
      expect(result.users[0].role).toBe('ADMIN')
    })
  })

  describe('PlantationService', () => {
    let userId: string

    beforeEach(async () => {
      const user = await UserService.createUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
      userId = user.id
    })

    it('should create a plantation successfully', async () => {
      const plantationData = {
        name: 'Test Plantation',
        description: 'A test plantation',
        location: 'Medan, Indonesia',
        latitude: 3.5952,
        longitude: 98.6722,
        area: 50.0,
        soilType: 'Laterit'
      }

      const plantation = await PlantationService.createPlantation(userId, plantationData)

      expect(plantation).toBeDefined()
      expect(plantation.name).toBe(plantationData.name)
      expect(plantation.userId).toBe(userId)
      expect(plantation.status).toBe('ACTIVE')
    })

    it('should get plantations by user', async () => {
      // Create multiple plantations
      for (let i = 0; i < 5; i++) {
        await PlantationService.createPlantation(userId, {
          name: `Plantation ${i}`,
          location: `Location ${i}`,
          area: 10.0
        })
      }

      const result = await PlantationService.getPlantationsByUser(userId, 1, 10)
      
      expect(result.plantations).toHaveLength(5)
      expect(result.pagination.total).toBe(5)
    })

    it('should update plantation successfully', async () => {
      const plantation = await PlantationService.createPlantation(userId, {
        name: 'Test Plantation',
        location: 'Medan, Indonesia',
        area: 50.0
      })

      const updatedPlantation = await PlantationService.updatePlantation(plantation.id, {
        name: 'Updated Plantation',
        area: 75.0
      })

      expect(updatedPlantation.name).toBe('Updated Plantation')
      expect(updatedPlantation.area).toBe(75.0)
    })
  })

  describe('WorkerService', () => {
    let userId: string
    let plantationId: string

    beforeEach(async () => {
      const user = await UserService.createUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
      userId = user.id

      const plantation = await PlantationService.createPlantation(userId, {
        name: 'Test Plantation',
        location: 'Medan, Indonesia',
        area: 50.0
      })
      plantationId = plantation.id
    })

    it('should create a worker successfully', async () => {
      const workerData = {
        plantationId,
        name: 'Test Worker',
        email: 'worker@example.com',
        phoneNumber: '+6281234567890',
        position: 'Field Worker',
        salary: 2500000,
        skills: ['Planting', 'Harvesting'],
        certifications: ['Safety Certificate']
      }

      const worker = await WorkerService.createWorker(userId, workerData)

      expect(worker).toBeDefined()
      expect(worker.name).toBe(workerData.name)
      expect(worker.userId).toBe(userId)
      expect(worker.plantationId).toBe(plantationId)
      expect(worker.status).toBe('ACTIVE')
    })

    it('should get workers by user', async () => {
      // Create multiple workers
      for (let i = 0; i < 3; i++) {
        await WorkerService.createWorker(userId, {
          plantationId,
          name: `Worker ${i}`,
          position: 'Field Worker'
        })
      }

      const result = await WorkerService.getWorkersByUser(userId, 1, 10)
      
      expect(result.workers).toHaveLength(3)
      expect(result.pagination.total).toBe(3)
    })
  })

  describe('TaskService', () => {
    let userId: string
    let plantationId: string
    let workerId: string

    beforeEach(async () => {
      const user = await UserService.createUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
      userId = user.id

      const plantation = await PlantationService.createPlantation(userId, {
        name: 'Test Plantation',
        location: 'Medan, Indonesia',
        area: 50.0
      })
      plantationId = plantation.id

      const worker = await WorkerService.createWorker(userId, {
        plantationId,
        name: 'Test Worker',
        position: 'Field Worker'
      })
      workerId = worker.id
    })

    it('should create a task successfully', async () => {
      const taskData = {
        plantationId,
        workerId,
        title: 'Planting Task',
        description: 'Plant new palm trees',
        type: 'PLANTING',
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        estimatedHours: 8.0
      }

      const task = await TaskService.createTask(userId, taskData)

      expect(task).toBeDefined()
      expect(task.title).toBe(taskData.title)
      expect(task.userId).toBe(userId)
      expect(task.status).toBe('PENDING')
    })

    it('should complete a task', async () => {
      const task = await TaskService.createTask(userId, {
        plantationId,
        title: 'Test Task',
        type: 'PLANTING',
        priority: 'MEDIUM'
      })

      const completedTask = await TaskService.completeTask(task.id, 6.5)

      expect(completedTask.status).toBe('COMPLETED')
      expect(completedTask.actualHours).toBe(6.5)
      expect(completedTask.completedAt).toBeDefined()
    })

    it('should get tasks by user with filters', async () => {
      // Create tasks with different statuses
      await TaskService.createTask(userId, {
        plantationId,
        title: 'Pending Task',
        type: 'PLANTING',
        priority: 'HIGH'
      })

      const inProgressTask = await TaskService.createTask(userId, {
        plantationId,
        title: 'In Progress Task',
        type: 'HARVESTING',
        priority: 'MEDIUM'
      })

      await TaskService.updateTask(inProgressTask.id, { status: 'IN_PROGRESS' })

      const pendingTasks = await TaskService.getTasksByUser(userId, 1, 10, { status: 'PENDING' })
      const inProgressTasks = await TaskService.getTasksByUser(userId, 1, 10, { status: 'IN_PROGRESS' })

      expect(pendingTasks.tasks).toHaveLength(1)
      expect(inProgressTasks.tasks).toHaveLength(1)
    })
  })

  describe('ReportService', () => {
    let userId: string
    let plantationId: string

    beforeEach(async () => {
      const user = await UserService.createUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
      userId = user.id

      const plantation = await PlantationService.createPlantation(userId, {
        name: 'Test Plantation',
        location: 'Medan, Indonesia',
        area: 50.0
      })
      plantationId = plantation.id
    })

    it('should create a report successfully', async () => {
      const reportData = {
        plantationId,
        title: 'Monthly Report',
        type: 'MONTHLY',
        content: {
          production: 1000,
          expenses: 5000000,
          revenue: 8000000
        },
        attachments: ['report.pdf']
      }

      const report = await ReportService.createReport(userId, reportData)

      expect(report).toBeDefined()
      expect(report.title).toBe(reportData.title)
      expect(report.userId).toBe(userId)
      expect(report.status).toBe('DRAFT')
    })

    it('should publish a report', async () => {
      const report = await ReportService.createReport(userId, {
        plantationId,
        title: 'Test Report',
        type: 'MONTHLY',
        content: { data: 'test' }
      })

      const publishedReport = await ReportService.publishReport(report.id)

      expect(publishedReport.status).toBe('PUBLISHED')
      expect(publishedReport.publishedAt).toBeDefined()
    })
  })

  describe('Cache Manager', () => {
    it('should cache and retrieve data', async () => {
      const testData = { message: 'Hello World' }
      const key = 'test-key'

      await cacheManager.set(key, testData, 60)
      const retrievedData = await cacheManager.get(key)

      expect(retrievedData).toEqual(testData)
    })

    it('should return null for non-existent key', async () => {
      const retrievedData = await cacheManager.get('non-existent-key')
      expect(retrievedData).toBeNull()
    })

    it('should check if key exists', async () => {
      const key = 'existence-test'
      
      const existsBefore = await cacheManager.exists(key)
      expect(existsBefore).toBe(false)

      await cacheManager.set(key, 'test', 60)
      const existsAfter = await cacheManager.exists(key)
      expect(existsAfter).toBe(true)
    })
  })

  describe('Compliance Manager', () => {
    let userId: string

    beforeEach(async () => {
      const user = await UserService.createUser({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123'
      })
      userId = user.id
    })

    it('should handle data access request', async () => {
      const userData = await complianceManager.handleDataSubjectRequest(userId, 'access')

      expect(userData).toBeDefined()
      expect(userData.personalData.id).toBe(userId)
      expect(userData.requestType).toBe('access')
    })

    it('should handle data export request', async () => {
      const exportData = await complianceManager.handleDataSubjectRequest(userId, 'portability')

      expect(exportData).toBeDefined()
      expect(exportData.exportFormat).toBe('JSON')
      expect(exportData.personalData.id).toBe(userId)
    })

    it('should record consent', async () => {
      await complianceManager.recordConsent(userId, 'marketing', true, 'Email marketing')

      const auditLogs = await prisma.auditLog.findMany({
        where: { userId, action: 'CONSENT_RECORDED' }
      })

      expect(auditLogs).toHaveLength(1)
      expect(auditLogs[0].newValues.consentType).toBe('marketing')
    })

    it('should conduct privacy impact assessment', async () => {
      const assessment = await complianceManager.conductPrivacyImpactAssessment(
        'User Registration',
        ['email', 'name', 'phoneNumber'],
        ['authentication', 'communication']
      )

      expect(assessment).toBeDefined()
      expect(assessment.processName).toBe('User Registration')
      expect(assessment.riskLevel).toBeDefined()
      expect(assessment.recommendations).toBeDefined()
    })
  })

  describe('API Authentication', () => {
    it('should generate and verify JWT token', async () => {
      const { apiAuth } = await import('@/lib/api/core')
      
      const payload = { userId: 'test-user', role: 'USER' }
      const token = apiAuth.generateToken(payload)
      
      expect(token).toBeDefined()
      expect(typeof token).toBe('string')

      const verifiedPayload = apiAuth.verifyToken(token)
      expect(verifiedPayload.userId).toBe(payload.userId)
      expect(verifiedPayload.role).toBe(payload.role)
    })

    it('should throw error for invalid token', async () => {
      const { apiAuth } = await import('@/lib/api/core')
      
      expect(() => {
        apiAuth.verifyToken('invalid-token')
      }).toThrow('Invalid token')
    })
  })

  describe('Performance Monitoring', () => {
    it('should monitor function execution time', async () => {
      const { performanceMonitor } = await import('@/lib/monitoring/observability')
      
      const result = await performanceMonitor.monitorFunction(
        'test-function',
        async () => {
          await new Promise(resolve => setTimeout(resolve, 100))
          return 'success'
        }
      )

      expect(result).toBe('success')
    })

    it('should collect metrics', async () => {
      const { metricsCollector } = await import('@/lib/monitoring/observability')
      
      metricsCollector.collect('test-metric', 100, { label: 'test' })
      const metrics = metricsCollector.getMetrics('test-metric')
      
      expect(metrics).toHaveLength(1)
      expect(metrics[0].name).toBe('test-metric')
      expect(metrics[0].value).toBe(100)
    })
  })
})
