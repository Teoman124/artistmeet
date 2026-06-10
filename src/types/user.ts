export type User = {
  id: number
  username: string
  email: string
  password: string
  bio?: string | null
  avatar_url?: string | null  // Voeg deze toe
  role?: string  // Voeg role toe
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
  role: string  // Dit is nu verplicht in PublicProfile
  avatar_url: string | null  // Voeg deze toe
  createdAt: Date
  updatedAt: Date
}