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
        const { username, email, currentPassword, newPassword } = body;

        const database = getDatabase();

        try {
            // Haal huidige gebruiker op
            const user = database
                .prepare('SELECT id, password FROM User WHERE id = ? LIMIT 1')
                .get(session.userId) as { id: number; password: string } | undefined;

            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // Check of username al bestaat (als het veranderd is)
            if (username) {
                const existingUser = database
                    .prepare('SELECT id FROM User WHERE lower(username) = lower(?) AND id != ? LIMIT 1')
                    .get(username, session.userId) as { id: number } | undefined;

                if (existingUser) {
                    return NextResponse.json({ error: 'Username already taken' }, { status: 409 });
                }
            }

            // Check of email al bestaat (als het veranderd is)
            if (email) {
                const existingEmail = database
                    .prepare('SELECT id FROM User WHERE lower(email) = lower(?) AND id != ? LIMIT 1')
                    .get(email, session.userId) as { id: number } | undefined;

                if (existingEmail) {
                    return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
                }
            }

            // Bouw update query
            let updateQuery = 'UPDATE User SET username = ?, email = ?, updatedAt = CURRENT_TIMESTAMP';
            const params: any[] = [username, email];

            // Check of wachtwoord veranderd moet worden
            if (newPassword) {
                if (!currentPassword) {
                    return NextResponse.json({ error: 'Current password is required to change password' }, { status: 400 });
                }

                const isValid = await verifyPassword(currentPassword, user.password);
                if (!isValid) {
                    return NextResponse.json({ error: 'Current password is incorrect' }, { status: 401 });
                }

                const hashedNewPassword = hashPassword(newPassword);
                updateQuery += ', password = ?';
                params.push(hashedNewPassword);
            }

            updateQuery += ' WHERE id = ?';
            params.push(session.userId);

            database.prepare(updateQuery).run(...params);

            return NextResponse.json({ success: true, message: 'Profile updated' }, { status: 200 });
        } finally {
            database.close();
        }
    } catch (error) {
        console.error('Update failed:', error);
        return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }
}