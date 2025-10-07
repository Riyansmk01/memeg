import '@testing-library/jest-dom'

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    }
  },
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
  usePathname() {
    return '/'
  },
}))

// Mock NextAuth
jest.mock('next-auth/react', () => ({
  useSession: () => ({
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
      },
    },
    status: 'authenticated',
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  getSession: jest.fn(),
}))

// Mock Prisma
jest.mock('@/lib/database', () => ({
  prisma: {
    user: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    subscription: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    payment: {
      findMany: jest.fn(),
      create: jest.fn(),
      aggregate: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    analytics: {
      create: jest.fn(),
      count: jest.fn(),
      aggregate: jest.fn(),
    },
    $queryRaw: jest.fn(),
    $executeRaw: jest.fn(),
  },
  redis: {
    get: jest.fn(),
    set: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
    exists: jest.fn(),
    ping: jest.fn(),
    quit: jest.fn(),
  },
  mongoDb: {
    collection: jest.fn(() => ({
      insertOne: jest.fn(),
      find: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    })),
    admin: jest.fn(() => ({
      ping: jest.fn(),
    })),
  },
}))

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.NEXTAUTH_SECRET = 'test-secret'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test'
process.env.REDIS_URL = 'redis://localhost:6379'
process.env.MONGODB_URL = 'mongodb://localhost:27017/test'

// Global test setup
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks()
})

// Global test teardown
afterAll(() => {
  // Clean up any resources
})
