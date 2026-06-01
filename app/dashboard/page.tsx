import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { getDatabase } from '@/src/lib/db';
import { PostService } from '@/src/services/post.service';

export const dynamic = 'force-dynamic';

function PostGrid({ title, description, posts }: { title: string; description: string; posts: Awaited<ReturnType<typeof PostService.getFeedPosts>>; }) {
    return (
        <section className="space-y-4 rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950">
            <div className="space-y-1">
                <h2 className="text-2xl font-semibold text-neutral-950 dark:text-white">{title}</h2>
                <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">{description}</p>
            </div>

            {posts.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                    {posts.map((post) => (
                        <article key={post.id} className="rounded-2xl border border-black/10 bg-neutral-50 p-5 dark:border-white/10 dark:bg-white/5">
                            <p className="text-xs font-medium uppercase tracking-[0.28em] text-neutral-500 dark:text-neutral-400">
                                {post.username}
                            </p>
                            <h3 className="mt-2 text-lg font-semibold text-neutral-950 dark:text-white">{post.title}</h3>
                            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{post.description}</p>
                        </article>
                    ))}
                </div>
            ) : (
                <p className="rounded-2xl border border-dashed border-black/10 bg-neutral-50 px-4 py-5 text-sm text-neutral-500 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
                    No posts yet.
                </p>
            )}
        </section>
    );
}

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

    if (!session) {
        redirect('/login');
    }

    const database = getDatabase();

    try {
        const user = database
            .prepare('SELECT id, username, email, role FROM User WHERE id = ? LIMIT 1')
            .get(session.userId) as { id: number; username: string; email: string; role: string } | undefined;

        if (!user) {
            redirect('/login');
        }

        const [yourPosts, yourLikes, savedPosts] = await Promise.all([
            PostService.getPostsByUserId(user.id),
            PostService.getLikedPostsByUserId(user.id),
            PostService.getSavedPostsByUserId(user.id)
        ]);

        return (
            <section className="space-y-8">
                <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 p-8 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,180,120,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(120,180,255,0.16),_transparent_35%)]" />
                    <div className="relative space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">
                            Dashboard
                        </p>
                        <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-5xl">
                            Welcome back, {user.username}.
                        </h1>
                        <p className="max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300">
                            This is your dashboard with your posts, your likes, and your saved posts.
                        </p>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Your posts</p>
                        <p className="mt-2 text-3xl font-semibold text-neutral-950 dark:text-white">{yourPosts.length}</p>
                    </div>
                    <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Your likes</p>
                        <p className="mt-2 text-3xl font-semibold text-neutral-950 dark:text-white">{yourLikes.length}</p>
                    </div>
                    <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                        <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Saved posts</p>
                        <p className="mt-2 text-3xl font-semibold text-neutral-950 dark:text-white">{savedPosts.length}</p>
                    </div>
                </div>

                <PostGrid
                    title="Your posts"
                    description="Posts you created, shown here first."
                    posts={yourPosts}
                />
                <PostGrid
                    title="Your likes"
                    description="Posts you liked from other people."
                    posts={yourLikes}
                />
                <PostGrid
                    title="Saved posts"
                    description="Posts you bookmarked for later."
                    posts={savedPosts}
                />
            </section>
        );
    } finally {
        database.close();
    }
}