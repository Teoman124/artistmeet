import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import Link from 'next/link';
import { getDatabase } from '@/src/lib/db';
import { PostService } from '@/src/services/post.service';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { PostCardActions } from '@/app/components/post-card-actions';

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
        <div className="max-w-3xl mx-auto py-8">
            {/* Community header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold">{community.name}</h1>
                <p className="text-neutral-600 dark:text-neutral-400 mt-2">{community.description}</p>
                <div className="flex flex-wrap gap-4 mt-4 text-sm">
                    <span>{community.memberCount} members</span>
                    <span>Owner: {community.ownerUsername}</span>
                </div>

                {/* Join/Leave button */}
                {userId && (
                    <form action={`/api/communities/${community.name}/join`} method="POST" className="mt-4">
                        {community.userRole ? (
                            <div className="flex items-center gap-3">
                                <button
                                    formMethod="DELETE"
                                    className="px-4 py-2 rounded-full bg-red-100 text-red-700 hover:bg-red-200 transition"
                                >
                                    Leave
                                </button>
                                {community.userRole === 'mod' && (
                                    <span className="text-xs bg-yellow-100 px-2 py-1 rounded">Moderator</span>
                                )}
                            </div>
                        ) : (
                            <button
                                type="submit"
                                className="px-4 py-2 rounded-full bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 transition"
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
                    <p className="text-neutral-500 dark:text-neutral-400">No posts yet in this community.</p>
                ) : (
                    posts.map((post: any) => (
                        <article key={post.id} className="border rounded-2xl p-4 bg-white dark:bg-neutral-950">
                            <Link href={`/post/${post.id}`} className="text-xl font-semibold hover:underline">
                                {post.title}
                            </Link>
                            <p className="mt-2 text-neutral-600 dark:text-neutral-300">{post.description}</p>

                            {/* Tags */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {post.tags.map((tag: string) => (
                                        <Link key={tag} href={`/tags/${tag}`} className="text-xs text-blue-600 hover:underline">
                                            #{tag}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            <div className="mt-3 flex items-center gap-3 text-sm text-neutral-500">
                                <Link href={`/profile/${post.username}`} className="hover:underline">
                                    {post.username}
                                </Link>
                                <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="mt-3">
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
    );
}