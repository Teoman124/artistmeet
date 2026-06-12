import { getDatabase } from '@/src/lib/db';

export type FollowRelation = {
    id: number;
    followerId: number;
    followingId: number;
    createdAt: string;
};

export type FollowUser = {
    id: number;
    username: string;
    avatar_url: string | null;
    bio: string | null;
    followersCount?: number;
    followingCount?: number;
};

export class FollowService {
    // Check of user volgt target
    static async isFollowing(followerId: number, followingId: number): Promise<boolean> {
        const database = getDatabase();

        try {
            const result = database
                .prepare('SELECT id FROM Follow WHERE followerId = ? AND followingId = ? LIMIT 1')
                .get(followerId, followingId) as { id: number } | undefined;

            return !!result;
        } finally {
            database.close();
        }
    }

    // Volg een gebruiker
    static async follow(followerId: number, followingId: number): Promise<boolean> {
        const database = getDatabase();

        try {
            // Check of ze zichzelf proberen te volgen
            if (followerId === followingId) {
                throw new Error('You cannot follow yourself');
            }

            // Check of al volgt
            const existing = database
                .prepare('SELECT id FROM Follow WHERE followerId = ? AND followingId = ? LIMIT 1')
                .get(followerId, followingId) as { id: number } | undefined;

            if (existing) {
                return false; // Al aan het volgen
            }

            database
                .prepare('INSERT INTO Follow (followerId, followingId, createdAt, updatedAt) VALUES (?, ?, datetime("now"), datetime("now"))')
                .run(followerId, followingId);

            return true;
        } finally {
            database.close();
        }
    }

    // Ontvolg een gebruiker
    static async unfollow(followerId: number, followingId: number): Promise<boolean> {
        const database = getDatabase();

        try {
            const result = database
                .prepare('DELETE FROM Follow WHERE followerId = ? AND followingId = ?')
                .run(followerId, followingId);

            return result.changes > 0;
        } finally {
            database.close();
        }
    }

    // Haal followers van een gebruiker op
    static async getFollowers(userId: number): Promise<FollowUser[]> {
        const database = getDatabase();

        try {
            const followers = database
                .prepare(`
                    SELECT u.id, u.username, u.avatar_url, u.bio
                    FROM Follow f
                    JOIN User u ON u.id = f.followerId
                    WHERE f.followingId = ?
                    ORDER BY f.createdAt DESC
                `)
                .all(userId) as any[];

            return followers.map(f => ({
                id: f.id,
                username: f.username,
                avatar_url: f.avatar_url,
                bio: f.bio,
            }));
        } finally {
            database.close();
        }
    }

    // Haal following van een gebruiker op
    static async getFollowing(userId: number): Promise<FollowUser[]> {
        const database = getDatabase();

        try {
            const following = database
                .prepare(`
                    SELECT u.id, u.username, u.avatar_url, u.bio
                    FROM Follow f
                    JOIN User u ON u.id = f.followingId
                    WHERE f.followerId = ?
                    ORDER BY f.createdAt DESC
                `)
                .all(userId) as any[];

            return following.map(f => ({
                id: f.id,
                username: f.username,
                avatar_url: f.avatar_url,
                bio: f.bio,
            }));
        } finally {
            database.close();
        }
    }

    // Haal aantallen op
    static async getFollowCounts(userId: number): Promise<{ followers: number; following: number }> {
        const database = getDatabase();

        try {
            const followers = database
                .prepare('SELECT COUNT(*) as count FROM Follow WHERE followingId = ?')
                .get(userId) as { count: number };

            const following = database
                .prepare('SELECT COUNT(*) as count FROM Follow WHERE followerId = ?')
                .get(userId) as { count: number };

            return {
                followers: followers.count,
                following: following.count
            };
        } finally {
            database.close();
        }
    }

    // Haal posts van mensen die ik volg (voor community feed)
    static async getFollowingPosts(userId: number): Promise<any[]> {
        const database = getDatabase();

        try {
            const posts = database
                .prepare(`
                    SELECT p.id, p.title, p.description, p.createdAt, u.username, u.id as userId
                    FROM Post p
                    JOIN User u ON u.id = p.userId
                    JOIN Follow f ON f.followingId = p.userId
                    WHERE f.followerId = ?
                    ORDER BY p.createdAt DESC
                `)
                .all(userId) as any[];

            return posts.map(post => ({
                id: post.id,
                title: post.title,
                description: post.description,
                username: post.username,
                userId: post.userId,
                createdAt: new Date(post.createdAt)
            }));
        } finally {
            database.close();
        }
    }
}