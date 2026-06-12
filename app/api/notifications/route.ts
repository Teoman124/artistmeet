import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { NotificationService } from '@/src/services/notification.service';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const [notifications, unreadCount] = await Promise.all([
            NotificationService.getNotifications(session.userId),
            NotificationService.getUnreadCount(session.userId)
        ]);

        return NextResponse.json({ notifications, unreadCount }, { status: 200 });
    } catch (error) {
        console.error('Failed to get notifications:', error);
        return NextResponse.json({ error: 'Failed to get notifications' }, { status: 500 });
    }
}

