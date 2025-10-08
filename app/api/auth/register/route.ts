import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/database'

export const dynamic = 'force-dynamic'

// Input validation helpers
const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

const validatePassword = (password: string): { valid: boolean; message?: string } => {
  if (password.length < 6) {
    return { valid: false, message: 'Password minimal 6 karakter' }
  }
  if (password.length > 128) {
    return { valid: false, message: 'Password maksimal 128 karakter' }
  }
  return { valid: true }
}

const validateName = (name: string): { valid: boolean; message?: string } => {
  if (name.length < 2) {
    return { valid: false, message: 'Nama minimal 2 karakter' }
  }
  if (name.length > 100) {
    return { valid: false, message: 'Nama maksimal 100 karakter' }
  }
  // Check for potentially dangerous characters
  const dangerousChars = /[<>'"&]/
  if (dangerousChars.test(name)) {
    return { valid: false, message: 'Nama mengandung karakter yang tidak diizinkan' }
  }
  return { valid: true }
}

const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>'"&]/g, '')
}

export async function POST(request: NextRequest) {
  try {
    console.log('Register API called')
    
    // Parse JSON with better error handling
    let body
    try {
      body = await request.json()
      console.log('Request body:', body)
    } catch (jsonError) {
      console.error('JSON parsing error:', jsonError)
      return NextResponse.json(
        { message: 'Invalid JSON format' },
        { status: 400 }
      )
    }
    
    const { name, email, password } = body

    // Validate input
    if (!name || !email || !password) {
      console.log('Missing fields:', { name: !!name, email: !!email, password: !!password })
      return NextResponse.json(
        { message: 'Semua field harus diisi' },
        { status: 400 }
      )
    }

    // Sanitize inputs
    const sanitizedName = sanitizeInput(name)
    const sanitizedEmail = sanitizeInput(email.toLowerCase())

    // Validate email
    if (!validateEmail(sanitizedEmail)) {
      return NextResponse.json(
        { message: 'Format email tidak valid' },
        { status: 400 }
      )
    }

    // Validate name
    const nameValidation = validateName(sanitizedName)
    if (!nameValidation.valid) {
      return NextResponse.json(
        { message: nameValidation.message },
        { status: 400 }
      )
    }

    // Validate password
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { message: passwordValidation.message },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail }
    })
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user in database
    const newUser = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        password: hashedPassword,
        image: null,
        role: 'USER',
        subscription: {
          create: {
            plan: 'FREE',
            status: 'ACTIVE',
            currentPeriodStart: new Date(),
            currentPeriodEnd: null
          }
        }
      }
    })

    // Log successful registration
    console.log(`New user registered: ${sanitizedEmail}`)

    return NextResponse.json(
      { message: 'Akun berhasil dibuat', userId: newUser.id },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}