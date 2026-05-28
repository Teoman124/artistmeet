export type User = {
  id: number
  username: string
  email: string
  password: string
  createdAt: Date
  updatedAt: Date
}

export type CreateUserInput = {
  username: string
  email: string
  password: string
}

export type UserResponse = Omit<User, 'password'> // don't expose password
