import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import path from 'path'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const prisma = new PrismaClient()

interface BackupOptions {
  outputDir?: string
  includeData?: boolean
  compress?: boolean
  timestamp?: boolean
}

class DatabaseBackup {
  private outputDir: string
  private includeData: boolean
  private compress: boolean
  private timestamp: boolean

  constructor(options: BackupOptions = {}) {
    this.outputDir = options.outputDir || './backups'
    this.includeData = options.includeData ?? true
    this.compress = options.compress ?? true
    this.timestamp = options.timestamp ?? true
  }

  async createBackup(): Promise<string> {
    const timestamp = this.timestamp ? new Date().toISOString().replace(/[:.]/g, '-') : ''
    const filename = `esawitku-backup${timestamp ? `-${timestamp}` : ''}.sql`
    const filepath = path.join(this.outputDir, filename)

    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true })
    }

    console.log('🔄 Starting database backup...')
    console.log(`📁 Output directory: ${this.outputDir}`)
    console.log(`📄 Backup file: ${filename}`)

    try {
      // Get database URL from environment
      const databaseUrl = process.env.DATABASE_URL
      if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set')
      }

      // Parse database URL
      const url = new URL(databaseUrl)
      const host = url.hostname
      const port = url.port || '5432'
      const database = url.pathname.slice(1)
      const username = url.username
      const password = url.password

      // Create pg_dump command
      const pgDumpCmd = [
        'pg_dump',
        `--host=${host}`,
        `--port=${port}`,
        `--username=${username}`,
        `--dbname=${database}`,
        '--verbose',
        '--clean',
        '--if-exists',
        '--create',
        '--format=plain'
      ].join(' ')

      // Set password environment variable
      const env = { ...process.env, PGPASSWORD: password }

      console.log('📊 Executing pg_dump...')
      const { stdout, stderr } = await execAsync(pgDumpCmd, { env })

      if (stderr && !stderr.includes('WARNING')) {
        console.warn('⚠️ pg_dump warnings:', stderr)
      }

      // Write backup to file
      fs.writeFileSync(filepath, stdout)
      console.log(`✅ Backup created successfully: ${filepath}`)

      // Compress if requested
      if (this.compress) {
        const compressedFile = `${filepath}.gz`
        console.log('🗜️ Compressing backup...')
        await execAsync(`gzip -c "${filepath}" > "${compressedFile}"`)
        
        // Remove uncompressed file
        fs.unlinkSync(filepath)
        console.log(`✅ Compressed backup created: ${compressedFile}`)
        return compressedFile
      }

      return filepath
    } catch (error) {
      console.error('❌ Backup failed:', error)
      throw error
    }
  }

  async restoreBackup(backupFile: string): Promise<void> {
    console.log(`🔄 Starting database restore from: ${backupFile}`)

    try {
      const databaseUrl = process.env.DATABASE_URL
      if (!databaseUrl) {
        throw new Error('DATABASE_URL environment variable is not set')
      }

      const url = new URL(databaseUrl)
      const host = url.hostname
      const port = url.port || '5432'
      const database = url.pathname.slice(1)
      const username = url.username
      const password = url.password

      // Check if file exists
      if (!fs.existsSync(backupFile)) {
        throw new Error(`Backup file not found: ${backupFile}`)
      }

      // Determine if file is compressed
      const isCompressed = backupFile.endsWith('.gz')
      let restoreCmd: string

      if (isCompressed) {
        restoreCmd = `gunzip -c "${backupFile}" | psql --host=${host} --port=${port} --username=${username} --dbname=${database}`
      } else {
        restoreCmd = `psql --host=${host} --port=${port} --username=${username} --dbname=${database} -f "${backupFile}"`
      }

      const env = { ...process.env, PGPASSWORD: password }

      console.log('📊 Executing restore...')
      const { stdout, stderr } = await execAsync(restoreCmd, { env })

      if (stderr && !stderr.includes('WARNING')) {
        console.warn('⚠️ Restore warnings:', stderr)
      }

      console.log('✅ Database restored successfully')
    } catch (error) {
      console.error('❌ Restore failed:', error)
      throw error
    }
  }

  async listBackups(): Promise<string[]> {
    if (!fs.existsSync(this.outputDir)) {
      return []
    }

    const files = fs.readdirSync(this.outputDir)
    return files
      .filter(file => file.startsWith('esawitku-backup') && (file.endsWith('.sql') || file.endsWith('.sql.gz')))
      .sort()
      .reverse()
  }

  async cleanupOldBackups(keepCount: number = 10): Promise<void> {
    const backups = await this.listBackups()
    
    if (backups.length <= keepCount) {
      console.log(`📁 Keeping all ${backups.length} backups`)
      return
    }

    const toDelete = backups.slice(keepCount)
    console.log(`🗑️ Cleaning up ${toDelete.length} old backups...`)

    for (const backup of toDelete) {
      const filepath = path.join(this.outputDir, backup)
      fs.unlinkSync(filepath)
      console.log(`✅ Deleted: ${backup}`)
    }
  }

  async getBackupInfo(backupFile: string): Promise<any> {
    const filepath = path.join(this.outputDir, backupFile)
    
    if (!fs.existsSync(filepath)) {
      throw new Error(`Backup file not found: ${backupFile}`)
    }

    const stats = fs.statSync(filepath)
    const isCompressed = backupFile.endsWith('.gz')
    
    return {
      filename: backupFile,
      size: stats.size,
      sizeFormatted: this.formatBytes(stats.size),
      created: stats.birthtime,
      modified: stats.mtime,
      compressed: isCompressed
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }
}

// CLI usage
async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  const backup = new DatabaseBackup({
    outputDir: './backups',
    includeData: true,
    compress: true,
    timestamp: true
  })

  try {
    switch (command) {
      case 'backup':
        const backupFile = await backup.createBackup()
        console.log(`🎉 Backup completed: ${backupFile}`)
        break

      case 'restore':
        const backupFileToRestore = args[1]
        if (!backupFileToRestore) {
          console.error('❌ Please specify backup file to restore')
          process.exit(1)
        }
        await backup.restoreBackup(backupFileToRestore)
        console.log('🎉 Restore completed')
        break

      case 'list':
        const backups = await backup.listBackups()
        console.log('📁 Available backups:')
        for (const backupFile of backups) {
          const info = await backup.getBackupInfo(backupFile)
          console.log(`  ${info.filename} (${info.sizeFormatted}) - ${info.created.toISOString()}`)
        }
        break

      case 'cleanup':
        const keepCount = parseInt(args[1]) || 10
        await backup.cleanupOldBackups(keepCount)
        console.log('🎉 Cleanup completed')
        break

      default:
        console.log('Usage:')
        console.log('  npm run db:backup backup     - Create a new backup')
        console.log('  npm run db:backup restore <file> - Restore from backup')
        console.log('  npm run db:backup list       - List available backups')
        console.log('  npm run db:backup cleanup [count] - Cleanup old backups')
        break
    }
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}

export { DatabaseBackup }
