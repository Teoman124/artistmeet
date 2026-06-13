import { getDatabase } from '@/src/lib/db';

export type Tag = {
    id: number;
    name: string;
    count?: number;
};

export class TagService {
    // Tags uit tekst halen (bijv. "Hallo #world dit is #cool" -> ["world", "cool"])
    static extractTags(text: string): string[] {
        const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
        const matches = text.match(hashtagRegex);
        if (!matches) return [];

        return matches.map(tag => tag.slice(1).toLowerCase());
    }

    // Tag aanmaken als die niet bestaat
    static async getOrCreateTag(tagName: string): Promise<number> {
        const database = getDatabase();

        try {
            const existing = database
                .prepare('SELECT id FROM Tag WHERE name = ? LIMIT 1')
                .get(tagName) as { id: number } | undefined;

            if (existing) {
                return existing.id;
            }

            const result = database
                .prepare('INSERT INTO Tag (name, createdAt) VALUES (?, CURRENT_TIMESTAMP)')
                .run(tagName);

            return result.lastInsertRowid as number;
        } finally {
            database.close();
        }
    }

    // Tags toevoegen aan een post
    static async addTagsToPost(postId: number, tags: string[]): Promise<void> {
        const database = getDatabase();

        try {
            const insert = database.prepare('INSERT OR IGNORE INTO PostTag (postId, tagId, createdAt) VALUES (?, ?, CURRENT_TIMESTAMP)');

            for (const tagName of tags) {
                const tagId = await this.getOrCreateTag(tagName);
                insert.run(postId, tagId);
            }
        } finally {
            database.close();
        }
    }

    // Tags ophalen voor een post
    static async getTagsForPost(postId: number): Promise<Tag[]> {
        const database = getDatabase();

        try {
            const tags = database
                .prepare(`
                    SELECT t.id, t.name
                    FROM Tag t
                    JOIN PostTag pt ON pt.tagId = t.id
                    WHERE pt.postId = ?
                    ORDER BY pt.createdAt ASC
                `)
                .all(postId) as any[];

            return tags.map(t => ({ id: t.id, name: t.name }));
        } finally {
            database.close();
        }
    }

    // Populaire tags ophalen
    static async getPopularTags(limit: number = 10): Promise<Tag[]> {
        const database = getDatabase();

        try {
            const tags = database
                .prepare(`
                    SELECT t.id, t.name, COUNT(pt.postId) as count
                    FROM Tag t
                    JOIN PostTag pt ON pt.tagId = t.id
                    GROUP BY t.id
                    ORDER BY count DESC
                    LIMIT ?
                `)
                .all(limit) as any[];

            return tags.map(t => ({ id: t.id, name: t.name, count: t.count }));
        } finally {
            database.close();
        }
    }

    // Posts ophalen met een specifieke tag
    static async getPostsByTag(tagName: string, userId?: number): Promise<any[]> {
        const database = getDatabase();

        try {
            const posts = database
                .prepare(`
                    SELECT p.id, p.title, p.description, p.createdAt, u.username, u.id as userId,
                           CASE WHEN ? IS NOT NULL AND pl.id IS NOT NULL THEN 1 ELSE 0 END as isLiked,
                           CASE WHEN ? IS NOT NULL AND sp.id IS NOT NULL THEN 1 ELSE 0 END as isSaved,
                           CASE WHEN p.userId = ? THEN 1 ELSE 0 END as isOwnPost
                    FROM Post p
                    JOIN User u ON u.id = p.userId
                    JOIN PostTag pt ON pt.postId = p.id
                    JOIN Tag t ON t.id = pt.tagId
                    LEFT JOIN PostLike pl ON pl.postId = p.id AND pl.userId = ?
                    LEFT JOIN SavedPost sp ON sp.postId = p.id AND sp.userId = ?
                    WHERE t.name = ?
                    ORDER BY p.createdAt DESC
                `)
                .all(userId || null, userId || null, userId || null, userId || null, userId || null, tagName) as any[];

            return posts.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                username: p.username,
                userId: p.userId,
                createdAt: new Date(p.createdAt),
                isLiked: p.isLiked === 1,
                isSaved: p.isSaved === 1,
                isOwnPost: p.isOwnPost === 1
            }));
        } finally {
            database.close();
        }
    }

    // Zoek posts op tags
    static async searchByTags(query: string): Promise<any[]> {
        const database = getDatabase();

        try {
            const posts = database
                .prepare(`
                    SELECT DISTINCT p.id, p.title, p.description, p.createdAt, u.username, u.id as userId,
                           GROUP_CONCAT(t.name) as tags
                    FROM Post p
                    JOIN User u ON u.id = p.userId
                    JOIN PostTag pt ON pt.postId = p.id
                    JOIN Tag t ON t.id = pt.tagId
                    WHERE t.name LIKE ?
                    GROUP BY p.id
                    ORDER BY p.createdAt DESC
                    LIMIT 50
                `)
                .all(`%${query.toLowerCase()}%`) as any[];

            return posts.map(p => ({
                id: p.id,
                title: p.title,
                description: p.description,
                username: p.username,
                userId: p.userId,
                createdAt: new Date(p.createdAt),
                tags: p.tags ? p.tags.split(',') : []
            }));
        } finally {
            database.close();
        }
    }
}