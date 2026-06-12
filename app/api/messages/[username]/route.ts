import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { MessageService } from '@/src/services/message.service';
import { getDatabase } from '@/src/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const cookieStore = await cookies();
        const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { username } = await params;
        const database = getDatabase();

        try {
            const otherUser = database
                .prepare('SELECT id FROM User WHERE lower(username) = lower(?) LIMIT 1')
                .get(username) as { id: number } | undefined;

            if (!otherUser) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            const messages = await MessageService.getMessages(session.userId, otherUser.id);
            return NextResponse.json(messages, { status: 200 });
        } finally {
            database.close();
        }
    } catch (error) {
        console.error('Failed to get messages:', error);
        return NextResponse.json({ error: 'Failed to get messages' }, { status: 500 });
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const cookieStore = await cookies();
        const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { username } = await params;
        const body = await request.json();
        const { content } = body;

        if (!content || content.trim() === '') {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
        }

        const database = getDatabase();

        try {
            const receiver = database
                .prepare('SELECT id, messagesOpen FROM User WHERE lower(username) = lower(?) LIMIT 1')
                .get(username) as { id: number; messagesOpen: number } | undefined;

            if (!receiver) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            if (receiver.messagesOpen === 0) {
                return NextResponse.json({ error: 'This user does not accept messages' }, { status: 403 });
            }

            if (receiver.id === session.userId) {
                return NextResponse.json({ error: 'You cannot message yourself' }, { status: 400 });
            }

            // Gebruik CURRENT_TIMESTAMP ipv datetime("now")
            const result = database
                .prepare('INSERT INTO Message (content, senderId, receiverId, isRead, createdAt, updatedAt) VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)')
                .run(content.trim(), session.userId, receiver.id);

            // Haal het verstuurde bericht op
            const message = database
                .prepare(`
                    SELECT m.*, 
                           s.username as senderUsername, s.avatar_url as senderAvatar,
                           r.username as receiverUsername, r.avatar_url as receiverAvatar
                    FROM Message m
                    JOIN User s ON s.id = m.senderId
                    JOIN User r ON r.id = m.receiverId
                    WHERE m.id = ?
                `)
                .get(result.lastInsertRowid) as any;

            return NextResponse.json({
                id: message.id,
                content: message.content,
                senderId: message.senderId,
                receiverId: message.receiverId,
                senderUsername: message.senderUsername,
                senderAvatar: message.senderAvatar,
                receiverUsername: message.receiverUsername,
                receiverAvatar: message.receiverAvatar,
                isRead: message.isRead === 1,
                createdAt: new Date(message.createdAt)
            }, { status: 201 });
        } finally {
            database.close();
        }
    } catch (error: any) {
        console.error('Failed to send message:', error);
        return NextResponse.json({ error: error.message || 'Failed to send message' }, { status: 500 });
    }
}