import { cookies } from 'next/headers';
import Link from 'next/link';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { TagService } from '@/src/services/tag.service';
import { PostCardActions } from '@/app/components/post-card-actions';
import { HomeLayout } from '@/app/components/HomeLayout';

type TagPageProps = {
    params: Promise<{ name: string }>;
};

export default async function TagPage({ params }: TagPageProps) {
    const { name } = await params;
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
    const posts = await TagService.getPostsByTag(name, session?.userId);

    return (
        <HomeLayout>
            <div className="space-y-4">
                <div className="mb-6">
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">#{name}</h1>
                        <span className="text-sm text-neutral-500 dark:text-neutral-400">
                            ({posts.length} posts)
                        </span>
                    </div>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                        Posts tagged with #{name}
                    </p>
                </div>

                {posts.length > 0 ? (
                    posts.map((post) => (
                        <article
                            key={post.id}
                            className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-950"
                        >
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
                                    isLiked={post.isLiked}
                                    isSaved={post.isSaved}
                                    isOwnPost={post.isOwnPost}
                                    canInteract={Boolean(session)}
                                />
                            </div>
                        </article>
                    ))
                ) : (
                    <div className="rounded-2xl border border-dashed border-black/10 bg-neutral-50 p-8 text-center dark:border-white/10 dark:bg-white/5">
                        <p className="text-neutral-500 dark:text-neutral-400">
                            No posts found with tag #{name}
                        </p>
                        <Link href="/" className="mt-4 inline-block text-neutral-950 dark:text-white underline">
                            Go to home
                        </Link>
                    </div>
                )}
            </div>
        </HomeLayout>
    );
}