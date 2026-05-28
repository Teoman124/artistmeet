import { UserService } from '@/services/user.service'
import { validateCreateUser } from '@/validators/user'
import { NextRequest, NextResponse } from 'next/server'

/**
 * GET /api/users
 * Fetch all users
 */
export async function GET() {
  try {
    const users = await UserService.getAllUsers()
    return NextResponse.json(users, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch users:', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

/**
 * POST /api/users
 * Create a new user
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const validation = validateCreateUser(body)
    if (!validation.valid) {
      return NextResponse.json({ errors: validation.errors }, { status: 400 })
    }

    // TODO: Hash password before saving
    // const hashedPassword = await bcrypt.hash(body.password, 10)

    const user = await UserService.createUser({
      username: body.username,
      email: body.email,
      password: body.password // should be hashed!
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error: any) {
    console.error('Failed to create user:', error)

    // Prisma unique constraint error
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: `${error.meta?.target?.[0]} already exists` },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 })
  }
}
