import { getDatabase } from '@/src/lib/db';
import { NotificationService } from './notification.service';

export type Message = {
    id: number;
    content: string;
    senderId: number;
    receiverId: number;
    senderUsername: string;
    senderAvatar: string | null;
    receiverUsername: string;
    receiverAvatar: string | null;
    isRead: boolean;
    createdAt: Date;
};

export type Conversation = {
    userId: number;
    username: string;
    avatar_url: string | null;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
};

export class MessageService {
    // Stuur een bericht
    static async sendMessage(senderId: number, receiverId: number, content: string): Promise<Message | null> {
        const database = getDatabase();

        try {
            // Check of de ontvanger berichten accepteert
            const receiver = database
                .prepare('SELECT messagesOpen FROM User WHERE id = ? LIMIT 1')
                .get(receiverId) as { messagesOpen: number } | undefined;

            if (!receiver || receiver.messagesOpen === 0) {
                throw new Error('This user does not accept messages');
            }

            // Stuur bericht - gebruik CURRENT_TIMESTAMP
            const result = database
                .prepare('INSERT INTO Message (content, senderId, receiverId, isRead, createdAt, updatedAt) VALUES (?, ?, ?, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)')
                .run(content, senderId, receiverId);

            // Notificatie voor nieuw bericht
            if (senderId !== receiverId) {
                await NotificationService.createNotification(receiverId, 'message', senderId);
            }

            // Haal het verstuurde bericht op met gebruikersinformatie
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

            return message ? {
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
            } : null;
        } finally {
            database.close();
        }
    }

    // Haal alle gesprekken voor een gebruiker op
    static async getConversations(userId: number): Promise<Conversation[]> {
        const database = getDatabase();

        try {
            const conversations = database
                .prepare(`
                    SELECT 
                        CASE 
                            WHEN m.senderId = ? THEN m.receiverId
                            ELSE m.senderId
                        END as otherUserId,
                        u.username,
                        u.avatar_url,
                        m.content as lastMessage,
                        m.createdAt as lastMessageTime,
                        SUM(CASE WHEN m.receiverId = ? AND m.isRead = 0 THEN 1 ELSE 0 END) as unreadCount
                    FROM Message m
                    JOIN User u ON u.id = CASE 
                        WHEN m.senderId = ? THEN m.receiverId
                        ELSE m.senderId
                    END
                    WHERE m.senderId = ? OR m.receiverId = ?
                    GROUP BY otherUserId
                    ORDER BY lastMessageTime DESC
                `)
                .all(userId, userId, userId, userId, userId) as any[];

            return conversations.map(c => ({
                userId: c.otherUserId,
                username: c.username,
                avatar_url: c.avatar_url,
                lastMessage: c.lastMessage,
                lastMessageTime: new Date(c.lastMessageTime),
                unreadCount: c.unreadCount || 0
            }));
        } finally {
            database.close();
        }
    }

    // Haal berichten tussen twee gebruikers op
    static async getMessages(userId: number, otherUserId: number): Promise<Message[]> {
        const database = getDatabase();

        try {
            // Markeer berichten als gelezen - gebruik CURRENT_TIMESTAMP
            database
                .prepare('UPDATE Message SET isRead = 1, updatedAt = CURRENT_TIMESTAMP WHERE senderId = ? AND receiverId = ? AND isRead = 0')
                .run(otherUserId, userId);

            // Haal berichten op
            const messages = database
                .prepare(`
                    SELECT m.*, 
                           s.username as senderUsername, s.avatar_url as senderAvatar,
                           r.username as receiverUsername, r.avatar_url as receiverAvatar
                    FROM Message m
                    JOIN User s ON s.id = m.senderId
                    JOIN User r ON r.id = m.receiverId
                    WHERE (m.senderId = ? AND m.receiverId = ?) OR (m.senderId = ? AND m.receiverId = ?)
                    ORDER BY m.createdAt ASC
                `)
                .all(userId, otherUserId, otherUserId, userId) as any[];

            return messages.map(m => ({
                id: m.id,
                content: m.content,
                senderId: m.senderId,
                receiverId: m.receiverId,
                senderUsername: m.senderUsername,
                senderAvatar: m.senderAvatar,
                receiverUsername: m.receiverUsername,
                receiverAvatar: m.receiverAvatar,
                isRead: m.isRead === 1,
                createdAt: new Date(m.createdAt)
            }));
        } finally {
            database.close();
        }
    }

    // Check of gebruiker berichten kan ontvangen
    static async canReceiveMessages(userId: number): Promise<boolean> {
        const database = getDatabase();

        try {
            const result = database
                .prepare('SELECT messagesOpen FROM User WHERE id = ? LIMIT 1')
                .get(userId) as { messagesOpen: number } | undefined;

            return result ? result.messagesOpen === 1 : false;
        } finally {
            database.close();
        }
    }
}