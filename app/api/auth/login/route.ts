import { createSessionToken, SESSION_COOKIE_NAME, verifyPassword } from '@/src/lib/auth';
import { getDatabase } from '@/src/lib/db';
import { NextRequest, NextResponse } from 'next/server';

type LoginBody = {
    email?: string;
    password?: string;
};

async function readBody(request: NextRequest): Promise<LoginBody> {
    const contentType = request.headers.get('content-type') ?? '';

    if (contentType.includes('application/json')) {
        return (await request.json()) as LoginBody;
    }

    const formData = await request.formData();
    return Object.fromEntries(formData.entries()) as LoginBody;
}

export async function POST(request: NextRequest) {
    const body = await readBody(request);
    const email = String(body.email ?? '').trim().toLowerCase();
    const password = String(body.password ?? '');

    if (!email || !password) {
        return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
    }

    const database = getDatabase();

    try {
        const user = database
            .prepare('SELECT id, username, email, password, role FROM User WHERE lower(email) = lower(?) LIMIT 1')
            .get(email) as
            | { id: number; username: string; email: string; password: string; role: string }
            | undefined;

        if (!user || !verifyPassword(password, user.password)) {
            return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
        }

        const response = NextResponse.json({
            ok: true,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                role: user.role ?? 'user'
            }
        });

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
