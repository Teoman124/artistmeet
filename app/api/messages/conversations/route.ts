import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { MessageService } from '@/src/services/message.service';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const conversations = await MessageService.getConversations(session.userId);
        return NextResponse.json(conversations, { status: 200 });
    } catch (error) {
        console.error('Failed to get conversations:', error);
        return NextResponse.json({ error: 'Failed to get conversations' }, { status: 500 });
    }
}