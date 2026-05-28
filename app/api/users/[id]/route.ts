import { UserService } from '@/services/user.service'
import { NextResponse } from 'next/server'

interface Props {
  params: Promise<{ id: string }>
}

/**
 * GET /api/users/[id]
 * Fetch a specific user by ID
 */
export async function GET(request: Request, { params }: Props) {
  try {
    const { id } = await params
    const userId = parseInt(id, 10)

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    const user = await UserService.getUserById(userId)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user, { status: 200 })
  } catch (error) {
    console.error('Failed to fetch user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

/**
 * DELETE /api/users/[id]
 * Delete a user
 */
export async function DELETE(request: Request, { params }: Props) {
  try {
    const { id } = await params
    const userId = parseInt(id, 10)

    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 })
    }

    await UserService.deleteUser(userId)

    return NextResponse.json({ message: 'User deleted' }, { status: 200 })
  } catch (error: any) {
    console.error('Failed to delete user:', error)

    if (error.code === 'P2025') {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
