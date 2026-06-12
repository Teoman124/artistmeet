import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { getDatabase } from '@/src/lib/db';

export async function DELETE() {
    try {
        const cookieStore = await cookies();
        const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const database = getDatabase();

        try {
            // Verwijder gebruiker (cascade delete doet de rest)
            database.prepare('DELETE FROM User WHERE id = ?').run(session.userId);

            return NextResponse.json({ success: true }, { status: 200 });
        } finally {
            database.close();
        }
    } catch (error) {
        console.error('Delete account failed:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}