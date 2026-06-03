import { getDatabase } from '@/src/lib/db';
import { PostFeedItem } from '@/src/types/post';

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

    static async getLikedPostsByUserId(userId: number): Promise<PostFeedItem[]> {
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
                .all(userId) as PostRow[];

            return posts.map(mapPost);
        } finally {
            database.close();
        }
    }

    static async getSavedPostsByUserId(userId: number): Promise<PostFeedItem[]> {
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
                .all(userId) as PostRow[];

            return posts.map(mapPost);
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
            }

            database.prepare('INSERT INTO PostLike (userId, postId, createdAt) VALUES (?, ?, datetime(\'now\'))').run(userId, postId);
            return { liked: true };
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
            }

            database.prepare('INSERT INTO SavedPost (userId, postId, createdAt) VALUES (?, ?, datetime(\'now\'))').run(userId, postId);
            return { saved: true };
        } finally {
            database.close();
        }
    }
}