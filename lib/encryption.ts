import crypto from 'crypto'
import { encryptionConfig } from './database-config'

// Encryption utility functions
export function encrypt(text: string): string {
  const iv = crypto.randomBytes(encryptionConfig.ivLength)
  const cipher = crypto.createCipher(encryptionConfig.algorithm, encryptionConfig.key)
  
  let encrypted = cipher.update(text, 'utf8', 'hex')
  encrypted += cipher.final('hex')
  
  return iv.toString('hex') + ':' + encrypted
}

export function decrypt(encryptedText: string): string {
  const textParts = encryptedText.split(':')
  const iv = Buffer.from(textParts.shift()!, 'hex')
  const encryptedText_part = textParts.join(':')
  
  const decipher = crypto.createDecipher(encryptionConfig.algorithm, encryptionConfig.key)
  
  let decrypted = decipher.update(encryptedText_part, 'hex', 'utf8')
  decrypted += decipher.final('utf8')
  
  return decrypted
}

// Hash sensitive data for search
export function hashForSearch(text: string): string {
  return crypto.createHash('sha256').update(text).digest('hex')
}

// Generate secure random strings
export function generateSecureToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex')
}

// Verify data integrity
export function verifyIntegrity(data: string, hash: string): boolean {
  const computedHash = crypto.createHash('sha256').update(data).digest('hex')
  return computedHash === hash
}

// Encrypt object fields
export function encryptObjectFields(obj: any): any {
  const encrypted = { ...obj }
  
  encryptionConfig.encryptedFields.forEach(field => {
    if (encrypted[field]) {
      encrypted[field] = encrypt(encrypted[field])
    }
  })
  
  return encrypted
}

// Decrypt object fields
export function decryptObjectFields(obj: any): any {
  const decrypted = { ...obj }
  
  encryptionConfig.encryptedFields.forEach(field => {
    if (decrypted[field]) {
      try {
        decrypted[field] = decrypt(decrypted[field])
      } catch (error) {
        console.error(`Failed to decrypt field ${field}:`, error)
      }
    }
  })
  
  return decrypted
}
