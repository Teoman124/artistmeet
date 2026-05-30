import { createSessionToken, hashPassword, SESSION_COOKIE_NAME } from '@/src/lib/auth';
import { getDatabase } from '@/src/lib/db';
import { NextRequest, NextResponse } from 'next/server';

type RegisterBody = {
    username?: string;
    email?: string;
    password?: string;
};

async function readBody(request: NextRequest): Promise<RegisterBody> {
    const contentType = request.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
        return (await request.json()) as RegisterBody;
    }

    const formData = await request.formData();
    return Object.fromEntries(formData.entries()) as RegisterBody;
}

export async function POST(request: NextRequest) {
    const body = await readBody(request);
    const username = String(body.username ?? '').trim();
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (!username || !email || !password) {
        return NextResponse.json({ error: 'Username, email and password are required.' }, { status: 400 });
    }

    const database = getDatabase();

    try {
        const existingUser = database
            .prepare('SELECT id FROM User WHERE lower(email) = lower(?) OR lower(username) = lower(?) LIMIT 1')
            .get(email, username) as { id: number } | undefined;

        if (existingUser) {
            return NextResponse.json({ error: 'A user with that email or username already exists.' }, { status: 409 });
        }

        const hashedPassword = hashPassword(password);

        const result = database
            .prepare("INSERT INTO User (username, email, password, role, updatedAt) VALUES (?, ?, ?, 'user', datetime('now'))")
            .run(username, email, hashedPassword);

        const user = database
            .prepare('SELECT id, username, email, role FROM User WHERE id = ? LIMIT 1')
            .get(result.lastInsertRowid) as
            | { id: number; username: string; email: string; role: string }
            | undefined;

        if (!user) {
            return NextResponse.json({ error: 'User could not be created.' }, { status: 500 });
        }

        const response = NextResponse.json({ ok: true, user });
        response.cookies.set(
            SESSION_COOKIE_NAME,
            createSessionToken({
                userId: user.id,
                username: user.username,
                role: user.role ?? 'user'
            }),
            {
                httpOnly: true,
                sameSite: 'lax',
                secure: process.env.NODE_ENV === 'production',
                path: '/',
                maxAge: 60 * 60 * 24 * 7
            }
        );

        return response;
    } finally {
        database.close();
    }
}
