import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import Link from 'next/link';
import { HomeLayout } from '@/app/components/HomeLayout';
import { getDatabase } from '@/src/lib/db';

export const dynamic = 'force-dynamic';

type Community = {
    id: number;
    name: string;
    description: string;
    ownerUsername: string;
    memberCount: number;
    userRole: string | null;
};

export default async function ExplorePage() {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
    const userId = session?.userId;

    const db = getDatabase();
    let communities: Community[] = [];

    try {
        const rows = db.prepare(`
            SELECT c.*, u.username as ownerUsername,
                (SELECT COUNT(*) FROM CommunityMember WHERE communityId = c.id) as memberCount,
                (SELECT role FROM CommunityMember WHERE userId = ? AND communityId = c.id) as userRole
            FROM Community c
            JOIN User u ON u.id = c.ownerId
            ORDER BY c.createdAt DESC
        `).all(userId || null) as any[];

        communities = rows.map(row => ({
            id: row.id,
            name: row.name,
            description: row.description,
            ownerUsername: row.ownerUsername,
            memberCount: row.memberCount,
            userRole: row.userRole || null
        }));
    } finally {
        db.close();
    }

    return (
        <HomeLayout>
            <div className="space-y-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">Explore Communities</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Discover new communities to join and connect with like-minded artists
                    </p>
                </div>

                {communities.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-black/10 bg-neutral-50 p-8 text-center dark:border-white/10 dark:bg-white/5">
                        <p className="text-neutral-500 dark:text-neutral-400">No communities found.</p>
                        <p className="text-sm text-neutral-400 dark:text-neutral-500 mt-2">
                            Be the first to create a community!
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {communities.map((community) => (
                            <div
                                key={community.id}
                                className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm transition-all hover:shadow-md dark:border-white/10 dark:bg-neutral-950"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <Link
                                            href={`/communities/${community.name}`}
                                            className="text-xl font-semibold text-neutral-950 hover:underline dark:text-white"
                                        >
                                            {community.name}
                                        </Link>
                                        <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
                                            {community.description}
                                        </p>
                                        <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-neutral-500 dark:text-neutral-400">
                                            <span>👥 {community.memberCount} members</span>
                                            <span>👑 Created by {community.ownerUsername}</span>
                                            {community.userRole === 'mod' && (
                                                <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                                    Moderator
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <Link
                                        href={`/communities/${community.name}`}
                                        className="ml-4 rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                                    >
                                        View
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Call to action voor het maken van een community (alleen voor ingelogde gebruikers) */}
                {session && (
                    <div className="mt-8 rounded-2xl border border-dashed border-blue-300 bg-blue-50 p-6 text-center dark:border-blue-800 dark:bg-blue-950/20">
                        <h3 className="font-semibold text-blue-800 dark:text-blue-300">Create your own community</h3>
                        <p className="mt-1 text-sm text-blue-600 dark:text-blue-400">
                            Start a community around your genre, style, or interest
                        </p>
                        <button
                            type="button"
                            disabled
                            className="mt-3 rounded-full bg-blue-600 px-4 py-2 text-sm font-medium text-white opacity-50"
                        >
                            Coming soon
                        </button>
                    </div>
                )}
            </div>
        </HomeLayout>
    );
}