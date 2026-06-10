import { hashPassword } from '@/src/lib/auth'
import { prisma } from '@/src/lib/prisma'
import { CreateUserInput, PublicProfile, UserResponse } from '@/src/types/user'

export class UserService {
  /**
   * Create a new user
   */
  static async createUser(data: CreateUserInput): Promise<UserResponse> {
    const hashedPassword = hashPassword(data.password)
    
    const user = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: hashedPassword,
        bio: "",
      },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar_url: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    
    return user
  }

  /**
   * Get user by ID
   */
  static async getUserById(id: number): Promise<UserResponse | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar_url: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    
    return user
  }

  /**
   * Get user by email (with password for auth)
   */
  static async getUserByEmail(email: string) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    
    return user
  }

  /**
   * Get all users
   */
  static async getAllUsers(): Promise<UserResponse[]> {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar_url: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        id: 'asc'
      }
    })
    
    return users
  }

  /**
   * Delete user
   */
  static async deleteUser(id: number): Promise<void> {
    await prisma.user.delete({
      where: { id }
    })
  }

  /**
   * Get user by username
   */
  static async getUserByUsername(username: string): Promise<PublicProfile | null> {
    const user = await prisma.user.findUnique({
      where: { username: username.toLowerCase() },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar_url: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    
    if (!user) return null
    
    return {
      ...user,
      role: 'user', // Default role since it's not in schema yet
    }
  }

  /**
   * Update user avatar
   */
  static async updateUserAvatar(userId: number, avatarUrl: string | null): Promise<UserResponse | null> {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        avatar_url: avatarUrl,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        username: true,
        email: true,
        bio: true,
        avatar_url: true,
        createdAt: true,
        updatedAt: true,
      }
    })
    
    return user
  }
}