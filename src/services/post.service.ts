import { getDatabase } from '@/src/lib/db';
import { PostFeedItem } from '@/src/types/post';

type PostRow = {
    id: number;
    title: string;
    description: string;
    username: string;
    createdAt: string;
};

function mapPost(row: PostRow): PostFeedItem {
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        username: row.username,
        createdAt: new Date(row.createdAt)
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
}