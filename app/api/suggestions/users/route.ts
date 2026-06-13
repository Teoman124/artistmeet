import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '../../../../src/lib/auth';
import { getDatabase } from '../../../../src/lib/db';

export async function GET() {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
    
    if (!session) {
        return NextResponse.json([]);
    }

    const db = getDatabase();
    try {
        const suggestions = db.prepare(`
            SELECT u.id, u.username, u.avatar_url, u.bio
            FROM User u
            WHERE u.id != ?
            AND u.id NOT IN (SELECT followingId FROM Follow WHERE followerId = ?)
            AND u.role != 'owner'
            ORDER BY RANDOM()
            LIMIT 5
        `).all(session.userId, session.userId);
        
        return NextResponse.json(suggestions);
    } catch (error) {
        console.error('Failed to fetch suggestions:', error);
        return NextResponse.json([], { status: 500 });
    } finally {
        db.close();
    }
}