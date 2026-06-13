import { cookies } from 'next/headers';
import Link from 'next/link';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { getDatabase } from '@/src/lib/db';
import { PostCardActions } from '@/app/components/post-card-actions';
import { HomeLayout } from '@/app/components/HomeLayout';

type TagPageProps = {
    params: Promise<{ name: string }>;
};

export default async function TagPage({ params }: TagPageProps) {
    const { name } = await params;
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
    const userId = session?.userId;

    const db = getDatabase();
    let posts = [];

    try {
        posts = db.prepare(`
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
        `).all(userId || null, userId || null, userId || null, userId || null, userId || null, name) as any[];
    } finally {
        db.close();
    }

    return (
        <HomeLayout>
            <div className="space-y-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">#{name}</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">{posts.length} posts with this tag</p>
                </div>

                {posts.length === 0 ? (
                    <p className="text-center text-neutral-500 dark:text-neutral-400 py-10">
                        No posts found with tag #{name}
                    </p>
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
                            <div className="mt-4">
                                <PostCardActions
                                    postId={post.id}
                                    isLiked={post.isLiked === 1}
                                    isSaved={post.isSaved === 1}
                                    isOwnPost={post.isOwnPost === 1}
                                    canInteract={Boolean(session)}
                                />
                            </div>
                        </article>
                    ))
                )}
            </div>
        </HomeLayout>
    );
}