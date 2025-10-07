import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seeding...')

  // Create system configurations
  console.log('📋 Creating system configurations...')
  await prisma.systemConfig.createMany({
    data: [
      {
        key: 'app_name',
        value: 'eSawitKu',
        type: 'STRING',
        isPublic: true
      },
      {
        key: 'app_version',
        value: '1.0.0',
        type: 'STRING',
        isPublic: true
      },
      {
        key: 'max_file_size',
        value: '10485760', // 10MB
        type: 'NUMBER',
        isPublic: false
      },
      {
        key: 'allowed_file_types',
        value: JSON.stringify(['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx', 'xls', 'xlsx']),
        type: 'JSON',
        isPublic: false
      },
      {
        key: 'free_plan_limits',
        value: JSON.stringify({
          plantations: 2,
          workers: 5,
          reports: 10,
          storage: 100 // MB
        }),
        type: 'JSON',
        isPublic: true
      },
      {
        key: 'basic_plan_limits',
        value: JSON.stringify({
          plantations: 10,
          workers: 25,
          reports: 100,
          storage: 1000 // MB
        }),
        type: 'JSON',
        isPublic: true
      },
      {
        key: 'premium_plan_limits',
        value: JSON.stringify({
          plantations: 50,
          workers: 100,
          reports: 500,
          storage: 5000 // MB
        }),
        type: 'JSON',
        isPublic: true
      },
      {
        key: 'enterprise_plan_limits',
        value: JSON.stringify({
          plantations: -1, // unlimited
          workers: -1, // unlimited
          reports: -1, // unlimited
          storage: -1 // unlimited
        }),
        type: 'JSON',
        isPublic: true
      }
    ],
    skipDuplicates: true
  })

  // Create demo admin user
  console.log('👤 Creating demo admin user...')
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@esawitku.com' },
    update: {},
    create: {
      name: 'Admin eSawitKu',
      email: 'admin@esawitku.com',
      password: hashedPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
      isActive: true,
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          sms: false
        },
        dashboard: {
          defaultView: 'overview',
          widgets: ['stats', 'recent_activities', 'quick_actions']
        }
      },
      metadata: {
        createdBy: 'system',
        source: 'seed'
      }
    }
  })

  // Create demo regular user
  console.log('👤 Creating demo regular user...')
  const userPassword = await bcrypt.hash('user123', 12)
  
  const regularUser = await prisma.user.upsert({
    where: { email: 'user@esawitku.com' },
    update: {},
    create: {
      name: 'Petani Sawit',
      email: 'user@esawitku.com',
      password: userPassword,
      role: 'USER',
      status: 'ACTIVE',
      isActive: true,
      phoneNumber: '+6281234567890',
      address: 'Jl. Sawit No. 123, Medan, Sumatera Utara',
      personalId: '1234567890123456',
      companyName: 'PT Sawit Maju',
      companyAddress: 'Jl. Perkebunan Sawit No. 456, Medan',
      preferences: {
        theme: 'light',
        notifications: {
          email: true,
          push: true,
          sms: true
        },
        dashboard: {
          defaultView: 'overview',
          widgets: ['stats', 'plantations', 'recent_activities']
        }
      },
      metadata: {
        createdBy: 'system',
        source: 'seed'
      }
    }
  })

  // Create subscriptions
  console.log('💳 Creating subscriptions...')
  await prisma.subscription.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      plan: 'ENTERPRISE',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
      features: {
        unlimited_plantations: true,
        unlimited_workers: true,
        unlimited_reports: true,
        unlimited_storage: true,
        api_access: true,
        priority_support: true,
        custom_branding: true
      }
    }
  })

  await prisma.subscription.upsert({
    where: { userId: regularUser.id },
    update: {},
    create: {
      userId: regularUser.id,
      plan: 'BASIC',
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      features: {
        plantations: 10,
        workers: 25,
        reports: 100,
        storage: 1000,
        api_access: false,
        priority_support: false,
        custom_branding: false
      }
    }
  })

  // Create demo plantations
  console.log('🌴 Creating demo plantations...')
  const plantation1 = await prisma.plantation.create({
    data: {
      userId: regularUser.id,
      name: 'Kebun Sawit Utama',
      description: 'Kebun sawit utama dengan luas 50 hektar',
      location: 'Medan, Sumatera Utara',
      latitude: 3.5952,
      longitude: 98.6722,
      area: 50.0,
      soilType: 'Tanah Laterit',
      plantingDate: new Date('2020-01-15'),
      expectedHarvest: new Date('2023-01-15'),
      status: 'ACTIVE'
    }
  })

  const plantation2 = await prisma.plantation.create({
    data: {
      userId: regularUser.id,
      name: 'Kebun Sawit Cabang',
      description: 'Kebun sawit cabang dengan luas 25 hektar',
      location: 'Deli Serdang, Sumatera Utara',
      latitude: 3.5300,
      longitude: 98.6800,
      area: 25.0,
      soilType: 'Tanah Podsolik',
      plantingDate: new Date('2021-03-20'),
      expectedHarvest: new Date('2024-03-20'),
      status: 'ACTIVE'
    }
  })

  // Create demo workers
  console.log('👷 Creating demo workers...')
  const workers = await prisma.worker.createMany({
    data: [
      {
        userId: regularUser.id,
        plantationId: plantation1.id,
        name: 'Ahmad Wijaya',
        email: 'ahmad@example.com',
        phoneNumber: '+6281111111111',
        position: 'Mandor',
        salary: 3500000,
        skills: ['Manajemen Tim', 'Pemeliharaan Tanaman', 'Penggunaan Alat'],
        certifications: ['Sertifikat Mandor Sawit', 'K3 Perkebunan']
      },
      {
        userId: regularUser.id,
        plantationId: plantation1.id,
        name: 'Siti Nurhaliza',
        email: 'siti@example.com',
        phoneNumber: '+6282222222222',
        position: 'Pekerja Lapangan',
        salary: 2500000,
        skills: ['Panen Sawit', 'Pemeliharaan Tanaman'],
        certifications: ['Sertifikat Pekerja Sawit']
      },
      {
        userId: regularUser.id,
        plantationId: plantation2.id,
        name: 'Budi Santoso',
        email: 'budi@example.com',
        phoneNumber: '+6283333333333',
        position: 'Mandor',
        salary: 3200000,
        skills: ['Manajemen Tim', 'Pemeliharaan Tanaman'],
        certifications: ['Sertifikat Mandor Sawit']
      }
    ]
  })

  // Create demo tasks
  console.log('📋 Creating demo tasks...')
  await prisma.task.createMany({
    data: [
      {
        userId: regularUser.id,
        plantationId: plantation1.id,
        title: 'Pemupukan Tanaman Sawit',
        description: 'Melakukan pemupukan pada tanaman sawit yang berumur 2 tahun',
        type: 'FERTILIZING',
        priority: 'HIGH',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        estimatedHours: 8.0
      },
      {
        userId: regularUser.id,
        plantationId: plantation1.id,
        title: 'Pemangkasan Daun Tua',
        description: 'Memangkas daun tua pada tanaman sawit untuk pertumbuhan optimal',
        type: 'PRUNING',
        priority: 'MEDIUM',
        status: 'IN_PROGRESS',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        estimatedHours: 6.0
      },
      {
        userId: regularUser.id,
        plantationId: plantation2.id,
        title: 'Pengendalian Hama',
        description: 'Melakukan pengendalian hama pada tanaman sawit',
        type: 'PEST_CONTROL',
        priority: 'URGENT',
        status: 'PENDING',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
        estimatedHours: 4.0
      }
    ]
  })

  // Create demo reports
  console.log('📊 Creating demo reports...')
  await prisma.report.createMany({
    data: [
      {
        userId: regularUser.id,
        plantationId: plantation1.id,
        title: 'Laporan Bulanan Januari 2024',
        type: 'MONTHLY',
        content: {
          summary: 'Produktivitas kebun meningkat 15% dibanding bulan sebelumnya',
          production: {
            totalHarvest: 1250, // kg
            averagePerHectare: 25, // kg/hectare
            quality: 'A'
          },
          expenses: {
            fertilizer: 5000000,
            labor: 15000000,
            maintenance: 3000000,
            total: 23000000
          },
          revenue: {
            totalSales: 35000000,
            profit: 12000000
          }
        },
        status: 'PUBLISHED',
        publishedAt: new Date()
      },
      {
        userId: regularUser.id,
        plantationId: plantation2.id,
        title: 'Laporan Panen Mingguan',
        type: 'WEEKLY',
        content: {
          summary: 'Panen minggu ini mencapai target yang ditetapkan',
          production: {
            totalHarvest: 450, // kg
            averagePerHectare: 18, // kg/hectare
            quality: 'B'
          },
          weather: {
            condition: 'Cerah',
            temperature: '28-32°C',
            humidity: '70-80%'
          }
        },
        status: 'PUBLISHED',
        publishedAt: new Date()
      }
    ]
  })

  // Create demo notifications
  console.log('🔔 Creating demo notifications...')
  await prisma.notification.createMany({
    data: [
      {
        userId: regularUser.id,
        title: 'Pembayaran Berhasil',
        message: 'Pembayaran langganan Basic plan telah berhasil diproses',
        type: 'SUCCESS',
        data: {
          amount: 299000,
          currency: 'IDR',
          plan: 'BASIC'
        }
      },
      {
        userId: regularUser.id,
        title: 'Tugas Baru Ditugaskan',
        message: 'Anda mendapat tugas baru: Pemupukan Tanaman Sawit',
        type: 'TASK_ASSIGNED',
        data: {
          taskId: 'task-1',
          taskTitle: 'Pemupukan Tanaman Sawit',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      },
      {
        userId: regularUser.id,
        title: 'Laporan Siap',
        message: 'Laporan bulanan Januari 2024 telah siap untuk didownload',
        type: 'REPORT_READY',
        data: {
          reportId: 'report-1',
          reportTitle: 'Laporan Bulanan Januari 2024'
        }
      }
    ]
  })

  // Create demo API key
  console.log('🔑 Creating demo API key...')
  await prisma.apiKey.create({
    data: {
      userId: adminUser.id,
      name: 'Development API Key',
      key: 'esk_dev_' + Math.random().toString(36).substr(2, 32),
      permissions: ['read:plantations', 'read:workers', 'read:reports', 'write:tasks'],
      isActive: true,
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
    }
  })

  // Create demo audit logs
  console.log('📝 Creating demo audit logs...')
  await prisma.auditLog.createMany({
    data: [
      {
        userId: adminUser.id,
        action: 'CREATE',
        resource: 'User',
        resourceId: regularUser.id,
        newValues: {
          name: regularUser.name,
          email: regularUser.email,
          role: regularUser.role
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        userId: regularUser.id,
        action: 'LOGIN',
        resource: 'Session',
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        userId: regularUser.id,
        action: 'CREATE',
        resource: 'Plantation',
        resourceId: plantation1.id,
        newValues: {
          name: plantation1.name,
          area: plantation1.area,
          location: plantation1.location
        }
      }
    ]
  })

  // Create demo analytics
  console.log('📈 Creating demo analytics...')
  await prisma.analytics.createMany({
    data: [
      {
        userId: regularUser.id,
        event: 'page_view',
        properties: {
          page: '/dashboard',
          referrer: 'https://google.com',
          duration: 120 // seconds
        },
        ipAddress: '127.0.0.1',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      {
        userId: regularUser.id,
        event: 'button_click',
        properties: {
          button: 'create_plantation',
          page: '/dashboard',
          timestamp: new Date()
        }
      },
      {
        userId: regularUser.id,
        event: 'form_submit',
        properties: {
          form: 'worker_registration',
          success: true,
          fields: ['name', 'email', 'position']
        }
      }
    ]
  })

  console.log('✅ Database seeding completed successfully!')
  console.log('')
  console.log('📊 Summary:')
  console.log(`- System Configs: ${await prisma.systemConfig.count()}`)
  console.log(`- Users: ${await prisma.user.count()}`)
  console.log(`- Subscriptions: ${await prisma.subscription.count()}`)
  console.log(`- Plantations: ${await prisma.plantation.count()}`)
  console.log(`- Workers: ${await prisma.worker.count()}`)
  console.log(`- Tasks: ${await prisma.task.count()}`)
  console.log(`- Reports: ${await prisma.report.count()}`)
  console.log(`- Notifications: ${await prisma.notification.count()}`)
  console.log(`- API Keys: ${await prisma.apiKey.count()}`)
  console.log(`- Audit Logs: ${await prisma.auditLog.count()}`)
  console.log(`- Analytics: ${await prisma.analytics.count()}`)
  console.log('')
  console.log('🔑 Demo Accounts:')
  console.log('Admin: admin@esawitku.com / admin123')
  console.log('User: user@esawitku.com / user123')
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
