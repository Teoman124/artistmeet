import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '../../../../src/lib/auth';
import { getDatabase } from '../../../../src/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
    const userId = session?.userId;
    const { name } = await params;

    const db = getDatabase();
    let community = null;
    try {
        const row = db.prepare(`
            SELECT c.*, u.username as ownerUsername,
                (SELECT COUNT(*) FROM CommunityMember WHERE communityId = c.id) as memberCount,
                (SELECT role FROM CommunityMember WHERE userId = ? AND communityId = c.id) as userRole
            FROM Community c
            JOIN User u ON u.id = c.ownerId
            WHERE c.name = ?
        `).get(userId || null, name) as any;

        if (row) {
            community = {
                id: row.id,
                name: row.name,
                description: row.description,
                ownerId: row.ownerId,
                ownerUsername: row.ownerUsername,
                createdAt: new Date(row.createdAt),
                memberCount: row.memberCount,
                userRole: row.userRole || null
            };
        }
    } finally {
        db.close();
    }

    if (!community) {
        return NextResponse.json({ error: 'Community not found' }, { status: 404 });
    }
    return NextResponse.json(community);
}