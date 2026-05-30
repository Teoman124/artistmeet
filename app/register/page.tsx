'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data?.error ?? 'Register failed.');
                return;
            }

            router.push('/profile');
            router.refresh();
        } catch {
            setError('Register failed.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="min-h-[60vh] flex items-center justify-center">
            <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                <p className="text-2xl font-semibold text-center">Register</p>

                {error ? <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

                <div className="space-y-2">
                    <label htmlFor="username" className="block text-sm font-medium">
                        Username
                    </label>
                    <input
                        id="username"
                        name="username"
                        type="text"
                        value={username}
                        onChange={(event) => setUsername(event.target.value)}
                        placeholder="Your username"
                        className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium">
                        Email
                    </label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        placeholder="email@example.com"
                        className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium">
                        Password
                    </label>
                    <input
                        id="password"
                        name="password"
                        type="password"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded border border-gray-300 px-3 py-2"
                    />
                </div>

                <button type="submit" disabled={loading} className="w-full rounded bg-black px-4 py-2 text-white disabled:opacity-60">
                    {loading ? 'Creating account...' : 'Register'}
                </button>
            </form>
        </section>
    );
}
