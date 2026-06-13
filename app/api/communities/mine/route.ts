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
        const communities = db.prepare(`
            SELECT c.id, c.name, cm.role
            FROM CommunityMember cm
            JOIN Community c ON c.id = cm.communityId
            WHERE cm.userId = ?
            ORDER BY c.name ASC
        `).all(session.userId);

        return NextResponse.json(communities);
    } finally {
        db.close();
    }
}