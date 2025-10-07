# eSawitKu Database Documentation

## 📊 Database Overview

eSawitKu menggunakan PostgreSQL sebagai database utama dengan Prisma ORM untuk manajemen schema dan query. Database dirancang untuk mendukung aplikasi SaaS kelapa sawit dengan fitur-fitur enterprise.

## 🗄️ Database Schema

### Core Models

#### 1. User Management
- **User**: Data pengguna dengan role-based access
- **Account**: OAuth accounts untuk social login
- **Session**: User sessions dengan device tracking
- **VerificationToken**: Email verification tokens

#### 2. Subscription & Payment
- **Subscription**: Langganan pengguna dengan berbagai plan
- **Payment**: Transaksi pembayaran dengan multiple methods

#### 3. Plantation Management
- **Plantation**: Data perkebunan sawit
- **Worker**: Data pekerja perkebunan
- **Task**: Tugas dan pekerjaan
- **Report**: Laporan dan dokumentasi

#### 4. Team & Collaboration
- **Team**: Tim kerja
- **TeamMember**: Anggota tim dengan roles
- **Document**: Dokumen dan file management
- **Notification**: Sistem notifikasi

#### 5. System & Analytics
- **ApiKey**: API keys untuk integrasi
- **AuditLog**: Audit trail untuk security
- **Analytics**: Event tracking dan analytics
- **SystemConfig**: Konfigurasi sistem

## 🔧 Database Setup

### Prerequisites
- PostgreSQL 13+ installed
- Node.js 18+ installed
- Prisma CLI installed

### Installation Steps

1. **Install Dependencies**
```bash
npm install prisma @prisma/client
```

2. **Setup Environment**
```bash
cp env.example .env.local
# Edit .env.local with your database credentials
```

3. **Generate Prisma Client**
```bash
npm run db:generate
```

4. **Push Schema to Database**
```bash
npm run db:push
```

5. **Run Migrations**
```bash
npm run db:migrate
```

6. **Seed Database**
```bash
npm run db:seed
```

### Automated Setup
```bash
.\setup-database.bat
```

## 📋 Database Models Detail

### User Model
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   @db.Text
  phoneNumber   String?   @db.Text // Encrypted
  address       String?   @db.Text // Encrypted
  personalId    String?   @db.Text // Encrypted (KTP/NIK)
  bankAccount   String?   @db.Text // Encrypted
  companyName   String?   @db.Text // Encrypted
  companyAddress String?  @db.Text // Encrypted
  taxId         String?   @db.Text // Encrypted (NPWP)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  lastLoginAt   DateTime?
  isActive      Boolean   @default(true)
  role          UserRole  @default(USER)
  status        UserStatus @default(ACTIVE)
  preferences   Json?     // User preferences
  metadata      Json?     // Additional metadata
  timezone      String    @default("Asia/Jakarta")
  language      String    @default("id")
  currency      String    @default("IDR")
}
```

**Fields:**
- `id`: Unique identifier (CUID)
- `name`: User's full name
- `email`: Unique email address
- `password`: Hashed password (bcrypt)
- `phoneNumber`: Encrypted phone number
- `address`: Encrypted address
- `personalId`: Encrypted KTP/NIK
- `bankAccount`: Encrypted bank account
- `companyName`: Encrypted company name
- `companyAddress`: Encrypted company address
- `taxId`: Encrypted NPWP
- `role`: User role (USER, ADMIN, SUPER_ADMIN, MANAGER, WORKER)
- `status`: User status (ACTIVE, INACTIVE, SUSPENDED, PENDING_VERIFICATION)
- `preferences`: JSON object for user preferences
- `metadata`: Additional metadata
- `timezone`: User timezone
- `language`: User language preference
- `currency`: User currency preference

### Plantation Model
```prisma
model Plantation {
  id          String   @id @default(cuid())
  userId      String
  name        String
  description String?
  location    String
  latitude    Decimal? @db.Decimal(10, 8)
  longitude   Decimal? @db.Decimal(11, 8)
  area        Decimal  @db.Decimal(10, 2) // in hectares
  soilType    String?
  plantingDate DateTime?
  expectedHarvest DateTime?
  status      PlantationStatus @default(ACTIVE)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Fields:**
- `id`: Unique identifier
- `userId`: Owner user ID
- `name`: Plantation name
- `description`: Plantation description
- `location`: Physical location
- `latitude`: GPS latitude
- `longitude`: GPS longitude
- `area`: Area in hectares
- `soilType`: Type of soil
- `plantingDate`: Date when planted
- `expectedHarvest`: Expected harvest date
- `status`: Plantation status (ACTIVE, INACTIVE, MAINTENANCE, HARVESTING)

### Worker Model
```prisma
model Worker {
  id          String   @id @default(cuid())
  userId      String
  plantationId String?
  name        String
  email       String?
  phoneNumber String?
  position    String
  salary      Decimal? @db.Decimal(10, 2)
  startDate   DateTime @default(now())
  endDate     DateTime?
  status      WorkerStatus @default(ACTIVE)
  skills      String[] // Array of skills
  certifications String[] // Array of certifications
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Fields:**
- `id`: Unique identifier
- `userId`: Owner user ID
- `plantationId`: Associated plantation ID
- `name`: Worker's name
- `email`: Worker's email
- `phoneNumber`: Worker's phone number
- `position`: Worker's position
- `salary`: Monthly salary
- `startDate`: Employment start date
- `endDate`: Employment end date
- `status`: Worker status (ACTIVE, INACTIVE, TERMINATED, ON_LEAVE)
- `skills`: Array of skills
- `certifications`: Array of certifications

### Task Model
```prisma
model Task {
  id          String   @id @default(cuid())
  userId      String
  plantationId String?
  workerId    String?
  title       String
  description String?
  type        TaskType
  priority    TaskPriority @default(MEDIUM)
  status      TaskStatus @default(PENDING)
  dueDate     DateTime?
  completedAt DateTime?
  estimatedHours Decimal? @db.Decimal(5, 2)
  actualHours   Decimal? @db.Decimal(5, 2)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

**Fields:**
- `id`: Unique identifier
- `userId`: Owner user ID
- `plantationId`: Associated plantation ID
- `workerId`: Assigned worker ID
- `title`: Task title
- `description`: Task description
- `type`: Task type (PLANTING, HARVESTING, MAINTENANCE, FERTILIZING, PEST_CONTROL, IRRIGATION, PRUNING, OTHER)
- `priority`: Task priority (LOW, MEDIUM, HIGH, URGENT)
- `status`: Task status (PENDING, IN_PROGRESS, COMPLETED, CANCELLED, ON_HOLD)
- `dueDate`: Due date
- `completedAt`: Completion date
- `estimatedHours`: Estimated hours to complete
- `actualHours`: Actual hours spent

### Report Model
```prisma
model Report {
  id          String   @id @default(cuid())
  userId      String
  plantationId String?
  title       String
  type        ReportType
  content     Json     // Report content as JSON
  data        Json?    // Additional data
  attachments String[] // File URLs
  status      ReportStatus @default(DRAFT)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  publishedAt DateTime?
}
```

**Fields:**
- `id`: Unique identifier
- `userId`: Owner user ID
- `plantationId`: Associated plantation ID
- `title`: Report title
- `type`: Report type (MONTHLY, WEEKLY, DAILY, HARVEST, MAINTENANCE, FINANCIAL, CUSTOM)
- `content`: Report content as JSON
- `data`: Additional data as JSON
- `attachments`: Array of file URLs
- `status`: Report status (DRAFT, PUBLISHED, ARCHIVED)
- `publishedAt`: Publication date

## 🔐 Security Features

### Data Encryption
- Sensitive fields encrypted using AES-256-GCM
- Password hashing with bcrypt (salt rounds: 12)
- Personal data encryption for compliance

### Audit Trail
- Complete audit logging for all operations
- IP address and user agent tracking
- Change tracking for sensitive data

### Access Control
- Role-based access control (RBAC)
- API key management with permissions
- Session management with device tracking

## 📊 Database Operations

### CRUD Operations
Semua operasi database menggunakan service classes:

```typescript
// User operations
const user = await UserService.createUser(data)
const user = await UserService.getUserById(id)
const user = await UserService.updateUser(id, data)
await UserService.deleteUser(id)

// Plantation operations
const plantation = await PlantationService.createPlantation(userId, data)
const plantations = await PlantationService.getPlantationsByUser(userId)

// Worker operations
const worker = await WorkerService.createWorker(userId, data)
const workers = await WorkerService.getWorkersByUser(userId)

// Task operations
const task = await TaskService.createTask(userId, data)
const tasks = await TaskService.getTasksByUser(userId)

// Report operations
const report = await ReportService.createReport(userId, data)
const reports = await ReportService.getReportsByUser(userId)
```

### Pagination
Semua list operations mendukung pagination:

```typescript
const result = await UserService.getUsers(page, limit, filters)
// Returns: { users, pagination: { page, limit, total, pages } }
```

### Filtering
Support untuk filtering berdasarkan berbagai criteria:

```typescript
const filters = {
  role: 'USER',
  status: 'ACTIVE',
  search: 'keyword',
  isActive: true
}
```

## 🔄 Database Migrations

### Creating Migrations
```bash
npm run db:migrate
```

### Production Migrations
```bash
npm run db:migrate:prod
```

### Reset Database
```bash
npm run db:reset
```

## 🌱 Database Seeding

### Seed Data
Database diisi dengan data demo untuk development:

- **Admin User**: admin@esawitku.com / admin123
- **Regular User**: user@esawitku.com / user123
- **Demo Plantations**: 2 perkebunan dengan data lengkap
- **Demo Workers**: 3 pekerja dengan skills dan certifications
- **Demo Tasks**: 3 tugas dengan berbagai status
- **Demo Reports**: 2 laporan dengan data produksi
- **System Configs**: Konfigurasi sistem dan plan limits

### Running Seed
```bash
npm run db:seed
```

## 💾 Database Backup

### Backup System
Sistem backup otomatis dengan fitur:

- **Automatic Backups**: Scheduled backups
- **Compression**: Gzip compression untuk space efficiency
- **Retention**: Configurable retention policy
- **Restore**: Easy restore functionality

### Backup Commands
```bash
# Create backup
npm run db:backup:create

# List backups
npm run db:backup:list

# Restore backup
npm run db:backup:restore <backup-file>

# Cleanup old backups
npm run db:backup:cleanup [keep-count]
```

### Backup Features
- **Timestamped**: Automatic timestamping
- **Compressed**: Gzip compression
- **Retention**: Configurable retention (default: 10 backups)
- **Info**: Detailed backup information
- **Cleanup**: Automatic cleanup of old backups

## 📈 Performance Optimization

### Indexing
Database dioptimasi dengan indexes:

- **Primary Keys**: Automatic indexes
- **Foreign Keys**: Automatic indexes
- **Search Fields**: Email, name, status
- **Date Fields**: CreatedAt, updatedAt
- **Composite Indexes**: User + status, plantation + status

### Query Optimization
- **Selective Fields**: Only select needed fields
- **Pagination**: Limit results with pagination
- **Relations**: Eager loading with include
- **Filtering**: Efficient where clauses

### Connection Pooling
- **Prisma Client**: Built-in connection pooling
- **Max Connections**: Configurable max connections
- **Connection Timeout**: Configurable timeout

## 🔍 Database Monitoring

### Prisma Studio
Visual database browser:

```bash
npm run db:studio
```

Access: http://localhost:5555

### Health Checks
```bash
npm run monitor:health
```

### Metrics
```bash
npm run monitor:metrics
```

## 🚀 Production Considerations

### Environment Variables
```env
DATABASE_URL="postgresql://user:pass@host:port/db?schema=public"
NODE_ENV="production"
```

### Security
- **SSL**: Enable SSL connections
- **Encryption**: Encrypt sensitive data
- **Access Control**: Restrict database access
- **Backup Encryption**: Encrypt backups

### Performance
- **Connection Pooling**: Optimize connection pool
- **Indexing**: Add indexes for queries
- **Partitioning**: Consider table partitioning
- **Monitoring**: Monitor query performance

### Backup Strategy
- **Daily Backups**: Automated daily backups
- **Offsite Storage**: Store backups offsite
- **Testing**: Regular restore testing
- **Monitoring**: Monitor backup success

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Database Best Practices](https://www.prisma.io/docs/guides/database-best-practices)
- [Performance Optimization](https://www.prisma.io/docs/guides/performance-and-optimization)

---

**eSawitKu Database** - Enterprise-ready database untuk platform SaaS kelapa sawit 🇮🇩
