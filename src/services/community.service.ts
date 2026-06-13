import { getDatabase } from '@/src/lib/db';

export type Community = {
    id: number;
    name: string;
    description: string;
    ownerId: number;
    ownerUsername: string;
    createdAt: Date;
    memberCount: number;
    userRole?: 'member' | 'mod' | null;
};

export class CommunityService {
    // Haal alle communities op (voor explore pagina)
    static async getAllCommunities(userId?: number): Promise<Community[]> {
        const db = getDatabase();
        try {
            const communities = db.prepare(`
                SELECT c.*, u.username as ownerUsername,
                    (SELECT COUNT(*) FROM CommunityMember WHERE communityId = c.id) as memberCount,
                    (SELECT role FROM CommunityMember WHERE userId = ? AND communityId = c.id) as userRole
                FROM Community c
                JOIN User u ON u.id = c.ownerId
                ORDER BY c.createdAt DESC
            `).all(userId || null) as any[];

            return communities.map(c => ({
                id: c.id,
                name: c.name,
                description: c.description,
                ownerId: c.ownerId,
                ownerUsername: c.ownerUsername,
                createdAt: new Date(c.createdAt),
                memberCount: c.memberCount,
                userRole: c.userRole || null
            }));
        } finally {
            db.close();
        }
    }

    // Haal een community op met details
    static async getCommunityByName(name: string, userId?: number): Promise<Community | null> {
        const db = getDatabase();
        try {
            const community = db.prepare(`
                SELECT c.*, u.username as ownerUsername,
                    (SELECT COUNT(*) FROM CommunityMember WHERE communityId = c.id) as memberCount,
                    (SELECT role FROM CommunityMember WHERE userId = ? AND communityId = c.id) as userRole
                FROM Community c
                JOIN User u ON u.id = c.ownerId
                WHERE c.name = ?
            `).get(userId || null, name) as any;

            if (!community) return null;
            return {
                id: community.id,
                name: community.name,
                description: community.description,
                ownerId: community.ownerId,
                ownerUsername: community.ownerUsername,
                createdAt: new Date(community.createdAt),
                memberCount: community.memberCount,
                userRole: community.userRole || null
            };
        } finally {
            db.close();
        }
    }

    // Word lid van een community
    static async joinCommunity(userId: number, communityId: number): Promise<void> {
        const db = getDatabase();
        try {
            const existing = db.prepare('SELECT id FROM CommunityMember WHERE userId = ? AND communityId = ?')
                .get(userId, communityId);
            if (existing) return;

            db.prepare(`
                INSERT INTO CommunityMember (userId, communityId, role, joinedAt)
                VALUES (?, ?, 'member', CURRENT_TIMESTAMP)
            `).run(userId, communityId);
        } finally {
            db.close();
        }
    }

    // Verlaat een community
    static async leaveCommunity(userId: number, communityId: number): Promise<void> {
        const db = getDatabase();
        try {
            const isOwner = db.prepare('SELECT id FROM Community WHERE ownerId = ? AND id = ?')
                .get(userId, communityId);
            if (isOwner) {
                throw new Error('Community owner cannot leave. Transfer ownership first.');
            }
            db.prepare('DELETE FROM CommunityMember WHERE userId = ? AND communityId = ?')
                .run(userId, communityId);
        } finally {
            db.close();
        }
    }

    // Communities waar gebruiker lid van is (voor dropdown)
    static async getUserCommunities(userId: number): Promise<{ id: number; name: string; role: string }[]> {
        const db = getDatabase();
        try {
            return db.prepare(`
                SELECT c.id, c.name, cm.role
                FROM CommunityMember cm
                JOIN Community c ON c.id = cm.communityId
                WHERE cm.userId = ?
                ORDER BY c.name ASC
            `).all(userId);
        } finally {
            db.close();
        }
    }
}