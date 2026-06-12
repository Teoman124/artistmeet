import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/src/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;
        const database = getDatabase();

        try {
            const user = database
                .prepare('SELECT id, username, avatar_url FROM User WHERE lower(username) = lower(?) LIMIT 1')
                .get(username) as { id: number; username: string; avatar_url: string | null } | undefined;

            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            return NextResponse.json({
                id: user.id,
                username: user.username,
                avatar_url: user.avatar_url,
            }, { status: 200 });
        } finally {
            database.close();
        }
    } catch (error) {
        console.error('Failed to fetch user profile:', error);
        return NextResponse.json({ error: 'Failed to fetch user profile' }, { status: 500 });
    }
}