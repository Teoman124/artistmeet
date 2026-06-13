import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { PostService } from '@/src/services/post.service';
import { PostCardActions } from '@/app/components/post-card-actions';
import Link from 'next/link';
import { HomeLayout } from '@/app/components/HomeLayout';

export const dynamic = 'force-dynamic';

export default async function ForYouPage() {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

    if (!session) {
        redirect('/login');
    }

    const posts = await PostService.getForYouFeed(session.userId);

    return (
        <HomeLayout>
            <div className="space-y-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">For You</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Personalized posts from people and communities you follow
                    </p>
                </div>

                {posts.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-black/10 bg-neutral-50 p-8 text-center dark:border-white/10 dark:bg-white/5">
                        <p className="text-neutral-500 dark:text-neutral-400">No personalized posts yet.</p>
                        <p className="mt-2 text-sm text-neutral-400 dark:text-neutral-500">
                            Follow more users or join communities to see posts here!
                        </p>
                        <div className="mt-4 flex gap-3 justify-center">
                            <Link href="/explore" className="rounded-full bg-neutral-950 px-4 py-2 text-sm text-white dark:bg-white dark:text-neutral-950">
                                Explore Users
                            </Link>
                            <Link href="/communities" className="rounded-full border border-black/10 px-4 py-2 text-sm dark:border-white/10">
                                Find Communities
                            </Link>
                        </div>
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

                            {post.tags && post.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {post.tags.map((tag: string) => (
                                        <Link key={tag} href={`/tags/${tag}`} className="text-xs text-blue-600 hover:underline">
                                            #{tag}
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {post.communityName && (
                                <div className="mt-2">
                                    <Link href={`/communities/${post.communityName}`} className="text-xs text-green-600 hover:underline">
                                        c/{post.communityName}
                                    </Link>
                                </div>
                            )}

                            <div className="mt-4">
                                <PostCardActions
                                    postId={post.id}
                                    isLiked={post.isLiked ?? false}
                                    isSaved={post.isSaved ?? false}
                                    isOwnPost={post.isOwnPost ?? false}
                                    canInteract={true}
                                    tags={post.tags}
                                />
                            </div>
                        </article>
                    ))
                )}
            </div>
        </HomeLayout>
    );
}