import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { getDatabase } from '@/src/lib/db';

export async function GET() {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
    const userId = session?.userId;

    const db = getDatabase();
    try {
        const communities = db.prepare(`
            SELECT c.*, u.username as ownerUsername,
                (SELECT COUNT(*) FROM CommunityMember WHERE communityId = c.id) as memberCount,
                (SELECT role FROM CommunityMember WHERE userId = ? AND communityId = c.id) as userRole
            FROM Community c
            JOIN User u ON u.id = c.ownerId
            ORDER BY c.createdAt DESC
        `).all(userId || null) as any[];

        const result = communities.map(c => ({
            id: c.id,
            name: c.name,
            description: c.description,
            ownerId: c.ownerId,
            ownerUsername: c.ownerUsername,
            createdAt: new Date(c.createdAt),
            memberCount: c.memberCount,
            userRole: c.userRole || null
        }));

        return NextResponse.json(result);
    } finally {
        db.close();
    }
}