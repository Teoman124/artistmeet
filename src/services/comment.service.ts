import { getDatabase } from '@/src/lib/db';
import { NotificationService } from './notification.service';

export type CommentWithPost = {
    id: number;
    content: string;
    postId: number;
    postTitle: string;
    createdAt: Date;
};

export class CommentService {
    static async getCommentsByUserId(userId: number): Promise<CommentWithPost[]> {
        const database = getDatabase();

        try {
            const comments = database.prepare(`
                SELECT c.id, c.content, c.postId, c.createdAt, p.title as postTitle
                FROM Comment c
                JOIN Post p ON p.id = c.postId
                WHERE c.userId = ?
                ORDER BY c.createdAt DESC
            `).all(userId) as any[];

            return comments.map(comment => ({
                id: comment.id,
                content: comment.content,
                postId: comment.postId,
                postTitle: comment.postTitle,
                createdAt: new Date(comment.createdAt)
            }));
        } finally {
            database.close();
        }
    }

    // Nieuwe functie om een comment aan te maken
    static async createComment(userId: number, postId: number, content: string): Promise<any> {
        const database = getDatabase();

        try {
            const post = database
                .prepare('SELECT userId FROM Post WHERE id = ? LIMIT 1')
                .get(postId) as { userId: number } | undefined;

            if (!post) {
                throw new Error('Post not found');
            }

            const result = database
                .prepare('INSERT INTO Comment (content, userId, postId, createdAt, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)')
                .run(content, userId, postId);

            // Notificatie voor comment
            if (post.userId !== userId) {
                await NotificationService.createNotification(post.userId, 'comment', userId, postId, result.lastInsertRowid as number);
            }

            const comment = database
                .prepare('SELECT * FROM Comment WHERE id = ?')
                .get(result.lastInsertRowid) as any;

            return comment;
        } finally {
            database.close();
        }
    }
}