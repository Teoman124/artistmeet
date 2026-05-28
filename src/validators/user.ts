export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): boolean {
  return password.length >= 8
}

export function validateUsername(username: string): boolean {
  // alphanumeric, 3-20 chars
  const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
  return usernameRegex.test(username)
}

export function validateCreateUser(data: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!data.username || !validateUsername(data.username)) {
    errors.push('Username must be 3-20 alphanumeric characters')
  }

  if (!data.email || !validateEmail(data.email)) {
    errors.push('Invalid email format')
  }

  if (!data.password || !validatePassword(data.password)) {
    errors.push('Password must be at least 8 characters')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}
