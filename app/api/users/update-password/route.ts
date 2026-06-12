import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken, hashPassword, verifyPassword } from '@/src/lib/auth';
import { getDatabase } from '@/src/lib/db';

export async function PUT(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: 'Current password and new password are required' }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const database = getDatabase();

        try {
            // Haal huidige gebruiker op met wachtwoord
            const user = database
                .prepare('SELECT id, password FROM User WHERE id = ? LIMIT 1')
                .get(session.userId) as { id: number; password: string } | undefined;

            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // Verifieer huidige wachtwoord
            const isValid = await verifyPassword(currentPassword, user.password);
            if (!isValid) {
                return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
            }

            // Hash nieuw wachtwoord en update
            const hashedNewPassword = hashPassword(newPassword);
            database
                .prepare('UPDATE User SET password = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
                .run(hashedNewPassword, session.userId);

            return NextResponse.json({ success: true, message: 'Password updated successfully' }, { status: 200 });
        } finally {
            database.close();
        }
    } catch (error) {
        console.error('Password update failed:', error);
        return NextResponse.json({ error: 'Password update failed' }, { status: 500 });
    }
}