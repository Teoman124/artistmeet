import { getDatabase } from '@/src/lib/db';

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
}