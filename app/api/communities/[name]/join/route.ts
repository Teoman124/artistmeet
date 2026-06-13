import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '../../../../../src/lib/auth';
import { getDatabase } from '../../../../../src/lib/db';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await params;

    const db = getDatabase();
    try {
        const community = db.prepare('SELECT id FROM Community WHERE name = ?').get(name) as { id: number } | undefined;

        if (!community) {
            return NextResponse.json({ error: 'Community not found' }, { status: 404 });
        }

        const existing = db.prepare('SELECT id FROM CommunityMember WHERE userId = ? AND communityId = ?')
            .get(session.userId, community.id);

        if (!existing) {
            db.prepare(`
                INSERT INTO CommunityMember (userId, communityId, role, joinedAt)
                VALUES (?, ?, 'member', CURRENT_TIMESTAMP)
            `).run(session.userId, community.id);
        }

        return NextResponse.json({ success: true });
    } finally {
        db.close();
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name } = await params;

    const db = getDatabase();
    try {
        const community = db.prepare('SELECT id FROM Community WHERE name = ?').get(name) as { id: number } | undefined;

        if (!community) {
            return NextResponse.json({ error: 'Community not found' }, { status: 404 });
        }

        const isOwner = db.prepare('SELECT id FROM Community WHERE ownerId = ? AND id = ?')
            .get(session.userId, community.id);

        if (isOwner) {
            return NextResponse.json({ error: 'Community owner cannot leave' }, { status: 400 });
        }

        db.prepare('DELETE FROM CommunityMember WHERE userId = ? AND communityId = ?')
            .run(session.userId, community.id);

        return NextResponse.json({ success: true });
    } finally {
        db.close();
    }
}