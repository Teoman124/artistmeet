import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { getDatabase } from '@/src/lib/db';

export async function PUT(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { messagesOpen } = body;

        if (typeof messagesOpen !== 'boolean') {
            return NextResponse.json({ error: 'messagesOpen must be a boolean' }, { status: 400 });
        }

        const database = getDatabase();

        try {
            database
                .prepare('UPDATE User SET messagesOpen = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?')
                .run(messagesOpen ? 1 : 0, session.userId);

            return NextResponse.json({ success: true }, { status: 200 });
        } finally {
            database.close();
        }
    } catch (error) {
        console.error('Failed to update privacy:', error);
        return NextResponse.json({ error: 'Failed to update privacy' }, { status: 500 });
    }
}