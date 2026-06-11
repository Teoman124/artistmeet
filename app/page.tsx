import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { PostService } from '@/src/services/post.service';
import { PostCardActions } from '@/app/components/post-card-actions';
import Link from 'next/link';
import { HomeLayout } from '@/app/components/HomeLayout';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  const posts = session ? await PostService.getFeedPostsForUser(session.userId) : await PostService.getFeedPosts();

  return (
    <HomeLayout>
      <div className="space-y-4">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">Home Feed</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Latest posts from everyone</p>
        </div>

        {posts.map((post) => (
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

        {posts.length === 0 && (
          <p className="text-center text-neutral-500 dark:text-neutral-400 py-10">
            No posts yet. Be the first to create one!
          </p>
        )}
      </div>
    </HomeLayout>
  );
}