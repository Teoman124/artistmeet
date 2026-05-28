/**
 * User model - mirrors Prisma schema
 * Source of truth is in prisma/schema.prisma
 */
export type User = {
  id: number
  username: string
  email: string
  password: string // always hashed
  createdAt: Date
  updatedAt: Date
}

export type UserResponse = Omit<User, 'password'> // safe to send to client
