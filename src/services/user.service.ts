import { prisma } from '@/lib/prisma'
import { CreateUserInput, UserResponse } from '@/types/user'

export class UserService {
  /**
   * Create a new user (password should be hashed before calling this)
   */
  static async createUser(data: CreateUserInput): Promise<UserResponse> {
    const user = await prisma.user.create({
      data,
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true
        // explicitly exclude password
      }
    })

    return user as UserResponse
  }

  /**
   * Get user by ID (without password)
   */
  static async getUserById(id: number): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return user as UserResponse | null
  }

  /**
   * Get user by email (with password for auth)
   */
  static async getUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email }
    })
  }

  /**
   * Get all users (without passwords)
   */
  static async getAllUsers(): Promise<UserResponse[]> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return users as UserResponse[]
  }

  /**
   * Delete user
   */
  static async deleteUser(id: number): Promise<void> {
    await prisma.user.delete({
      where: { id }
    })
  }
}
