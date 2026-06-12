import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { getDatabase } from '@/src/lib/db';

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const { username } = body;

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const database = getDatabase();

        try {
            // Haal de te volgen gebruiker op
            const targetUser = database
                .prepare('SELECT id FROM User WHERE lower(username) = lower(?) LIMIT 1')
                .get(username) as { id: number } | undefined;

            if (!targetUser) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            if (session.userId === targetUser.id) {
                return NextResponse.json({ error: 'You cannot follow yourself' }, { status: 400 });
            }

            // Check of al volgt
            const existing = database
                .prepare('SELECT id FROM Follow WHERE followerId = ? AND followingId = ? LIMIT 1')
                .get(session.userId, targetUser.id) as { id: number } | undefined;

            if (existing) {
                // Ontvolg
                database
                    .prepare('DELETE FROM Follow WHERE id = ?')
                    .run(existing.id);
                return NextResponse.json({ following: false, message: 'Unfollowed' }, { status: 200 });
            } else {
                // Volg - gebruik CURRENT_TIMESTAMP ipv datetime("now")
                database
                    .prepare('INSERT INTO Follow (followerId, followingId, createdAt, updatedAt) VALUES (?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)')
                    .run(session.userId, targetUser.id);
                return NextResponse.json({ following: true, message: 'Followed' }, { status: 200 });
            }
        } finally {
            database.close();
        }
    } catch (error: any) {
        console.error('Follow action failed:', error);
        return NextResponse.json({ error: error.message || 'Failed to process follow' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');

        if (!username) {
            return NextResponse.json({ error: 'Username is required' }, { status: 400 });
        }

        const database = getDatabase();

        try {
            const user = database
                .prepare('SELECT id FROM User WHERE lower(username) = lower(?) LIMIT 1')
                .get(username) as { id: number } | undefined;

            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            // Haal followers op
            const followers = database
                .prepare(`
                    SELECT u.id, u.username, u.avatar_url, u.bio
                    FROM Follow f
                    JOIN User u ON u.id = f.followerId
                    WHERE f.followingId = ?
                    ORDER BY f.createdAt DESC
                `)
                .all(user.id) as any[];

            // Haal following op
            const following = database
                .prepare(`
                    SELECT u.id, u.username, u.avatar_url, u.bio
                    FROM Follow f
                    JOIN User u ON u.id = f.followingId
                    WHERE f.followerId = ?
                    ORDER BY f.createdAt DESC
                `)
                .all(user.id) as any[];

            // Aantallen
            const followersCount = database
                .prepare('SELECT COUNT(*) as count FROM Follow WHERE followingId = ?')
                .get(user.id) as { count: number };

            const followingCount = database
                .prepare('SELECT COUNT(*) as count FROM Follow WHERE followerId = ?')
                .get(user.id) as { count: number };

            let isFollowing = false;
            if (session) {
                const followCheck = database
                    .prepare('SELECT id FROM Follow WHERE followerId = ? AND followingId = ? LIMIT 1')
                    .get(session.userId, user.id) as { id: number } | undefined;
                isFollowing = !!followCheck;
            }

            return NextResponse.json({
                followers: followers.map(f => ({ id: f.id, username: f.username, avatar_url: f.avatar_url, bio: f.bio })),
                following: following.map(f => ({ id: f.id, username: f.username, avatar_url: f.avatar_url, bio: f.bio })),
                followersCount: followersCount.count,
                followingCount: followingCount.count,
                isFollowing
            }, { status: 200 });
        } finally {
            database.close();
        }
    } catch (error) {
        console.error('Failed to get follow data:', error);
        return NextResponse.json({ error: 'Failed to get follow data' }, { status: 500 });
    }
}