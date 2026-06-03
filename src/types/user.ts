export type User = {
  id: number
  username: string
  email: string
  password: string
  bio?: string | null
  createdAt: Date
  updatedAt: Date
}

export type CreateUserInput = {
  username: string
  email: string
  password: string
}

export type UserResponse = Omit<User, 'password'> // don't expose password

export type PublicProfile = {
  id: number
  username: string
  email: string
  bio: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}
