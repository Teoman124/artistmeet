'use client'

import { useState } from 'react'

export function UserForm() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    const data = {
      username: formData.get('username'),
      email: formData.get('email'),
      password: formData.get('password')
    }

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(errData.errors?.[0] || errData.error || 'Failed to create user')
      }

      setSuccess(true)
      ;(e.target as HTMLFormElement).reset()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold">Create User</h2>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
      {success && <div className="p-3 bg-green-100 text-green-700 rounded">User created!</div>}

      <input
        type="text"
        name="username"
        placeholder="Username"
        required
        className="w-full px-3 py-2 border rounded"
      />

      <input
        type="email"
        name="email"
        placeholder="Email"
        required
        className="w-full px-3 py-2 border rounded"
      />

      <input
        type="password"
        name="password"
        placeholder="Password (min 8 chars)"
        required
        className="w-full px-3 py-2 border rounded"
      />

      <button
        type="submit"
        disabled={loading}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        {loading ? 'Creating...' : 'Create User'}
      </button>
    </form>
  )
}
