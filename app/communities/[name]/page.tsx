import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getDatabase } from '@/src/lib/db';
import { PostService } from '@/src/services/post.service';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { PostCardActions } from '@/app/components/post-card-actions';
import { HomeLayout } from '@/app/components/HomeLayout';

type CommunityPageProps = {
    params: Promise<{ name: string }>;
};

export default async function CommunityPage({ params }: CommunityPageProps) {
    const { name } = await params;
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
    const userId = session?.userId;

    const db = getDatabase();
    let community = null;

    try {
        const row = db.prepare(`
            SELECT c.*, u.username as ownerUsername,
                (SELECT COUNT(*) FROM CommunityMember WHERE communityId = c.id) as memberCount,
                (SELECT role FROM CommunityMember WHERE userId = ? AND communityId = c.id) as userRole
            FROM Community c
            JOIN User u ON u.id = c.ownerId
            WHERE c.name = ?
        `).get(userId || null, name) as any;

        if (row) {
            community = {
                id: row.id,
                name: row.name,
                description: row.description,
                ownerId: row.ownerId,
                ownerUsername: row.ownerUsername,
                createdAt: new Date(row.createdAt),
                memberCount: row.memberCount,
                userRole: row.userRole || null
            };
        }
    } finally {
        db.close();
    }

    if (!community) notFound();

    const posts = await PostService.getPostsByCommunityId(community.id, userId);

    return (
        <HomeLayout>
            <div className="space-y-6">
                {/* Community header */}
                <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                    <h1 className="text-3xl font-bold">{community.name}</h1>
                    <p className="text-neutral-600 dark:text-neutral-400 mt-2">{community.description}</p>
                    <div className="flex flex-wrap gap-4 mt-4 text-sm">
                        <span>👥 {community.memberCount} members</span>
                        <span>👑 Owner: {community.ownerUsername}</span>
                    </div>

                    {/* Join/Leave button */}
                    {userId && (
                        <form action={`/api/communities/${community.name}/join`} method="POST" className="mt-4">
                            {community.userRole ? (
                                <div className="flex items-center gap-3">
                                    <button
                                        formMethod="DELETE"
                                        className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                                    >
                                        Leave
                                    </button>
                                    {community.userRole === 'mod' && (
                                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">
                                            Moderator
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <button
                                    type="submit"
                                    className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                                >
                                    Join Community
                                </button>
                            )}
                        </form>
                    )}
                </div>

                {/* Posts in community */}
                <div className="space-y-4">
                    <h2 className="text-xl font-semibold">Posts in {community.name}</h2>
                    {posts.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-black/10 bg-neutral-50 p-8 text-center dark:border-white/10 dark:bg-white/5">
                            <p className="text-neutral-500 dark:text-neutral-400">No posts yet in this community.</p>
                            <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-500">
                                Be the first to post here!
                            </p>
                        </div>
                    ) : (
                        posts.map((post: any) => (
                            <article key={post.id} className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                                    <Link href={`/profile/${post.username}`} className="hover:underline">
                                        {post.username}
                                    </Link>
                                </p>
                                <h2 className="mt-2 text-xl font-semibold text-neutral-950 dark:text-white">
                                    {post.title}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                                    {post.description}
                                </p>

                                {/* Tags */}
                                {post.tags && post.tags.length > 0 && (
                                    <div className="mt-2 flex flex-wrap gap-1">
                                        {post.tags.map((tag: string) => (
                                            <Link key={tag} href={`/tags/${tag}`} className="text-xs text-blue-600 hover:underline">
                                                #{tag}
                                            </Link>
                                        ))}
                                    </div>
                                )}

                                <div className="mt-4">
                                    <PostCardActions
                                        postId={post.id}
                                        isLiked={post.isLiked ?? false}
                                        isSaved={post.isSaved ?? false}
                                        isOwnPost={post.isOwnPost ?? false}
                                        canInteract={!!session}
                                        tags={post.tags}
                                    />
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </HomeLayout>
    );
}