import { getDatabase } from '@/src/lib/db';

export type Notification = {
    id: number;
    type: 'like' | 'comment' | 'save' | 'follow' | 'message';
    actorId: number;
    actorUsername: string;
    actorAvatar: string | null;
    postId: number | null;
    postTitle: string | null;
    commentId: number | null;
    commentContent: string | null;
    isRead: boolean;
    createdAt: Date;
};

export class NotificationService {
    // Maak een notificatie aan
    static async createNotification(
        userId: number,
        type: 'like' | 'comment' | 'save' | 'follow' | 'message',
        actorId: number,
        postId?: number,
        commentId?: number
    ): Promise<void> {
        const database = getDatabase();

        try {
            // Niet je eigen notificatie ontvangen
            if (userId === actorId) return;

            database
                .prepare(`INSERT INTO Notification (userId, type, actorId, postId, commentId, createdAt, updatedAt) 
                         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
                .run(userId, type, actorId, postId || null, commentId || null);
        } finally {
            database.close();
        }
    }

    // Haal notificaties op voor een gebruiker
    static async getNotifications(userId: number, limit: number = 50): Promise<Notification[]> {
        const database = getDatabase();

        try {
            const notifications = database
                .prepare(`
                    SELECT n.*, 
                           u.username as actorUsername, u.avatar_url as actorAvatar,
                           p.title as postTitle,
                           c.content as commentContent
                    FROM Notification n
                    JOIN User u ON u.id = n.actorId
                    LEFT JOIN Post p ON p.id = n.postId
                    LEFT JOIN Comment c ON c.id = n.commentId
                    WHERE n.userId = ?
                    ORDER BY n.createdAt DESC
                    LIMIT ?
                `)
                .all(userId, limit) as any[];

            return notifications.map(n => ({
                id: n.id,
                type: n.type,
                actorId: n.actorId,
                actorUsername: n.actorUsername,
                actorAvatar: n.actorAvatar,
                postId: n.postId,
                postTitle: n.postTitle,
                commentId: n.commentId,
                commentContent: n.commentContent,
                isRead: n.isRead === 1,
                createdAt: new Date(n.createdAt)
            }));
        } finally {
            database.close();
        }
    }

    // Haal aantal ongelezen notificaties op
    static async getUnreadCount(userId: number): Promise<number> {
        const database = getDatabase();

        try {
            const result = database
                .prepare('SELECT COUNT(*) as count FROM Notification WHERE userId = ? AND isRead = 0')
                .get(userId) as { count: number };

            return result.count;
        } finally {
            database.close();
        }
    }

    // Markeer notificatie als gelezen
    static async markAsRead(notificationId: number, userId: number): Promise<void> {
        const database = getDatabase();

        try {
            database
                .prepare('UPDATE Notification SET isRead = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ? AND userId = ?')
                .run(notificationId, userId);
        } finally {
            database.close();
        }
    }

    // Markeer alle notificaties als gelezen
    static async markAllAsRead(userId: number): Promise<void> {
        const database = getDatabase();

        try {
            database
                .prepare('UPDATE Notification SET isRead = 1, updatedAt = CURRENT_TIMESTAMP WHERE userId = ? AND isRead = 0')
                .run(userId);
        } finally {
            database.close();
        }
    }
}