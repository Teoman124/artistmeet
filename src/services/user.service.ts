import { hashPassword } from '@/src/lib/auth'
import { getDatabase } from '@/src/lib/db'
import { CreateUserInput, UserResponse } from '@/src/types/user'

type UserRow = {
  id: number
  username: string
  email: string
  password?: string
  createdAt: string
  updatedAt: string
}

function mapUser(row: UserRow): UserResponse {
  return {
    id: row.id,
    username: row.username,
    email: row.email,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt)
  }
}

export class UserService {
  /**
   * Create a new user (password should be hashed before calling this)
   */
  static async createUser(data: CreateUserInput): Promise<UserResponse> {
    const database = getDatabase()

    try {
      const hashedPassword = hashPassword(data.password)
      const result = database
        .prepare("INSERT INTO User (username, email, password, role, updatedAt) VALUES (?, ?, ?, 'user', datetime('now'))")
        .run(data.username, data.email, hashedPassword)

      const user = database
        .prepare('SELECT id, username, email, createdAt, updatedAt FROM User WHERE id = ? LIMIT 1')
        .get(result.lastInsertRowid) as UserRow | undefined

      if (!user) {
        throw new Error('User could not be created')
      }

      return mapUser(user)
    } finally {
      database.close()
    }
  }

  /**
   * Get user by ID (without password)
   */
  static async getUserById(id: number): Promise<UserResponse | null> {
    const database = getDatabase()

    try {
      const user = database
        .prepare('SELECT id, username, email, createdAt, updatedAt FROM User WHERE id = ? LIMIT 1')
        .get(id) as UserRow | undefined

      return user ? mapUser(user) : null
    } finally {
      database.close()
    }
  }

  /**
   * Get user by email (with password for auth)
   */
  static async getUserByEmail(email: string) {
    const database = getDatabase()

    try {
      return database
        .prepare('SELECT * FROM User WHERE lower(email) = lower(?) LIMIT 1')
        .get(email)
    } finally {
      database.close()
    }
  }

  /**
   * Get all users (without passwords)
   */
  static async getAllUsers(): Promise<UserResponse[]> {
    const database = getDatabase()

    try {
      const users = database
        .prepare('SELECT id, username, email, createdAt, updatedAt FROM User ORDER BY id ASC')
        .all() as UserRow[]

      return users.map(mapUser)
    } finally {
      database.close()
    }
  }

  /**
   * Delete user
   */
  static async deleteUser(id: number): Promise<void> {
    const database = getDatabase()

    try {
      database.prepare('DELETE FROM User WHERE id = ?').run(id)
    } finally {
      database.close()
    }
  }
}
