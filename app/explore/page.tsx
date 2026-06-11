import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { PostService } from '@/src/services/post.service';
import { PostCardActions } from '@/app/components/post-card-actions';
import Link from 'next/link';
import { HomeLayout } from '@/app/components/HomeLayout';

export const dynamic = 'force-dynamic';

export default async function ExplorePage() {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
    // Explore kan bijvoorbeeld meest gelikete posts tonen
    const posts = session ? await PostService.getFeedPostsForUser(session.userId) : await PostService.getFeedPosts();

    // Sorteer op likes (als je likes count hebt) of gewoon recent
    const explorePosts = [...posts].sort((a, b) => {
        // Als je likes count hebt, sorteer dan op likes
        return 0; // Placeholder
    });

    return (
        <HomeLayout>
            <div className="space-y-4">
                <div className="mb-6">
                    <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">Explore</h1>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">Discover popular and trending posts</p>
                </div>

                {explorePosts.map((post) => (
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
                ))}
            </div>
        </HomeLayout>
    );
}