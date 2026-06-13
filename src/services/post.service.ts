import { getDatabase } from '@/src/lib/db';
import { PostFeedItem } from '@/src/types/post';
import { NotificationService } from './notification.service';
import { TagService } from './tag.service';

type PostRow = {
    id: number;
    title: string;
    description: string;
    username: string;
    createdAt: string;
    isOwnPost?: number;
    isLiked?: number;
    isSaved?: number;
};

function mapPost(row: PostRow): PostFeedItem {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        username: row.username,
        createdAt: new Date(row.createdAt),
        isOwnPost: row.isOwnPost === 1,
        isLiked: row.isLiked === 1,
        isSaved: row.isSaved === 1
    };
}

export class PostService {
    static async getFeedPosts(): Promise<PostFeedItem[]> {
        const database = getDatabase();

        try {
            const posts = database
                .prepare(
                    `SELECT
            Post.id,
            Post.title,
            Post.description,
            User.username,
                        Post.createdAt
          FROM Post
          INNER JOIN User ON User.id = Post.userId
          ORDER BY Post.id DESC`
                )
                .all() as PostRow[];

            return posts.map(mapPost);
        } finally {
            database.close();
        }
    }

    static async getPostsByUserId(userId: number): Promise<PostFeedItem[]> {
        const database = getDatabase();

        try {
            const posts = database
                .prepare(
                    `SELECT
                        Post.id,
                        Post.title,
                        Post.description,
                        User.username,
                        Post.createdAt
                    FROM Post
                    INNER JOIN User ON User.id = Post.userId
                    WHERE Post.userId = ?
                    ORDER BY Post.id DESC`
                )
                .all(userId) as PostRow[];

            return posts.map(mapPost);
        } finally {
            database.close();
        }
    }

    static async getLikedPostsByUserId(userId: number): Promise<any[]> {
        const database = getDatabase();

        try {
            const posts = database
                .prepare(
                    `SELECT
                    Post.id,
                    Post.title,
                    Post.description,
                    User.username,
                    Post.createdAt
                FROM PostLike
                INNER JOIN Post ON Post.id = PostLike.postId
                INNER JOIN User ON User.id = Post.userId
                WHERE PostLike.userId = ?
                ORDER BY PostLike.createdAt DESC`
                )
                .all(userId) as any[];

            return posts.map(post => ({
                id: post.id,
                title: post.title,
                description: post.description,
                username: post.username,
                createdAt: new Date(post.createdAt)
            }));
        } finally {
            database.close();
        }
    }

    static async getSavedPostsByUserId(userId: number): Promise<any[]> {
        const database = getDatabase();

        try {
            const posts = database
                .prepare(
                    `SELECT
                    Post.id,
                    Post.title,
                    Post.description,
                    User.username,
                    Post.createdAt
                FROM SavedPost
                INNER JOIN Post ON Post.id = SavedPost.postId
                INNER JOIN User ON User.id = Post.userId
                WHERE SavedPost.userId = ?
                ORDER BY SavedPost.createdAt DESC`
                )
                .all(userId) as any[];

            return posts.map(post => ({
                id: post.id,
                title: post.title,
                description: post.description,
                username: post.username,
                createdAt: new Date(post.createdAt)
            }));
        } finally {
            database.close();
        }
    }

    static async getFeedPostsForUser(userId: number): Promise<PostFeedItem[]> {
        const database = getDatabase();

        try {
            const posts = database
                .prepare(
                    `SELECT
                        Post.id,
                        Post.title,
                        Post.description,
                        User.username,
                        Post.createdAt,
                        CASE WHEN Post.userId = ? THEN 1 ELSE 0 END AS isOwnPost,
                        CASE WHEN PostLike.id IS NULL THEN 0 ELSE 1 END AS isLiked,
                        CASE WHEN SavedPost.id IS NULL THEN 0 ELSE 1 END AS isSaved
                    FROM Post
                    INNER JOIN User ON User.id = Post.userId
                    LEFT JOIN PostLike ON PostLike.postId = Post.id AND PostLike.userId = ?
                    LEFT JOIN SavedPost ON SavedPost.postId = Post.id AND SavedPost.userId = ?
                    ORDER BY Post.id DESC`
                )
                .all(userId, userId, userId) as PostRow[];

            return posts.map(mapPost);
        } finally {
            database.close();
        }
    }

    static async toggleLike(postId: number, userId: number) {
        const database = getDatabase();

        try {
            const post = database
                .prepare('SELECT id, userId FROM Post WHERE id = ? LIMIT 1')
                .get(postId) as { id: number; userId: number } | undefined;

            if (!post) {
                throw new Error('Post not found');
            }

            if (post.userId === userId) {
                throw new Error('You cannot like your own post');
            }

            const existingLike = database
                .prepare('SELECT id FROM PostLike WHERE postId = ? AND userId = ? LIMIT 1')
                .get(postId, userId) as { id: number } | undefined;

            if (existingLike) {
                database.prepare('DELETE FROM PostLike WHERE id = ?').run(existingLike.id);
                return { liked: false };
            } else {
                database.prepare('INSERT INTO PostLike (userId, postId, createdAt) VALUES (?, ?, CURRENT_TIMESTAMP)').run(userId, postId);

                // Notificatie voor like
                if (post.userId !== userId) {
                    await NotificationService.createNotification(post.userId, 'like', userId, postId);
                }

                return { liked: true };
            }
        } finally {
            database.close();
        }
    }

    static async toggleSaved(postId: number, userId: number) {
        const database = getDatabase();

        try {
            const post = database
                .prepare('SELECT id, userId FROM Post WHERE id = ? LIMIT 1')
                .get(postId) as { id: number; userId: number } | undefined;

            if (!post) {
                throw new Error('Post not found');
            }

            if (post.userId === userId) {
                throw new Error('You cannot save your own post');
            }

            const existingSaved = database
                .prepare('SELECT id FROM SavedPost WHERE postId = ? AND userId = ? LIMIT 1')
                .get(postId, userId) as { id: number } | undefined;

            if (existingSaved) {
                database.prepare('DELETE FROM SavedPost WHERE id = ?').run(existingSaved.id);
                return { saved: false };
            } else {
                database.prepare('INSERT INTO SavedPost (userId, postId, createdAt) VALUES (?, ?, CURRENT_TIMESTAMP)').run(userId, postId);

                // Notificatie voor save
                if (post.userId !== userId) {
                    await NotificationService.createNotification(post.userId, 'save', userId, postId);
                }

                return { saved: true };
            }
        } finally {
            database.close();
        }
    }
    static async createPost(userId: number, title: string, description: string): Promise<any> {
        const database = getDatabase();

        try {
            const result = database
                .prepare('INSERT INTO Post (title, description, userId, createdAt, updatedAt) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)')
                .run(title, description, userId);

            const postId = result.lastInsertRowid as number;

            // Tags extraheren en toevoegen
            const tags = TagService.extractTags(`${title} ${description}`);
            if (tags.length > 0) {
                await TagService.addTagsToPost(postId, tags);
            }

            return { id: postId, title, description, userId };
        } finally {
            database.close();
        }
    }

    static async getFeedPostsWithTags(userId?: number): Promise<any[]> {
        const database = getDatabase();

        try {
            const posts = database
                .prepare(`
                SELECT p.id, p.title, p.description, p.createdAt, u.username, u.id as userId,
                       GROUP_CONCAT(DISTINCT t.name) as tags,
                       CASE WHEN ? IS NOT NULL AND pl.id IS NOT NULL THEN 1 ELSE 0 END as isLiked,
                       CASE WHEN ? IS NOT NULL AND sp.id IS NOT NULL THEN 1 ELSE 0 END as isSaved
                FROM Post p
                JOIN User u ON u.id = p.userId
                LEFT JOIN PostTag pt ON pt.postId = p.id
                LEFT JOIN Tag t ON t.id = pt.tagId
                LEFT JOIN PostLike pl ON pl.postId = p.id AND pl.userId = ?
                LEFT JOIN SavedPost sp ON sp.postId = p.id AND sp.userId = ?
                GROUP BY p.id
                ORDER BY p.createdAt DESC
            `)
                .all(userId || null, userId || null, userId || null, userId || null) as any[];

            return posts.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                username: p.username,
                userId: p.userId,
                createdAt: new Date(p.createdAt),
                tags: p.tags ? p.tags.split(',') : [],
                isLiked: p.isLiked === 1,
                isSaved: p.isSaved === 1
            }));
        } finally {
            database.close();
        }
    }

    static async getPostsByCommunityId(communityId: number, userId?: number): Promise<any[]> {
        const db = getDatabase();
        try {
            const posts = db.prepare(`
            SELECT p.*, u.username,
                CASE WHEN ? IS NOT NULL AND pl.id IS NOT NULL THEN 1 ELSE 0 END as isLiked,
                CASE WHEN ? IS NOT NULL AND sp.id IS NOT NULL THEN 1 ELSE 0 END as isSaved,
                CASE WHEN p.userId = ? THEN 1 ELSE 0 END as isOwnPost,
                GROUP_CONCAT(DISTINCT t.name) as tags
            FROM Post p
            JOIN User u ON u.id = p.userId
            LEFT JOIN PostLike pl ON pl.postId = p.id AND pl.userId = ?
            LEFT JOIN SavedPost sp ON sp.postId = p.id AND sp.userId = ?
            LEFT JOIN PostTag pt ON pt.postId = p.id
            LEFT JOIN Tag t ON t.id = pt.tagId
            WHERE p.communityId = ?
            GROUP BY p.id
            ORDER BY p.createdAt DESC
        `).all(userId || null, userId || null, userId || null, userId || null, userId || null, communityId) as any[];

            return posts.map((p: any) => ({
                id: p.id,
                title: p.title,
                description: p.description,
                username: p.username,
                userId: p.userId,
                createdAt: new Date(p.createdAt),
                isLiked: p.isLiked === 1,
                isSaved: p.isSaved === 1,
                isOwnPost: p.isOwnPost === 1,
                tags: p.tags ? p.tags.split(',') : []
            }));
        } finally {
            db.close();
        }
    }
}