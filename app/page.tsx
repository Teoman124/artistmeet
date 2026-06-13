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
  const posts = session ? await PostService.getFeedPostsWithTags(session.userId) : await PostService.getFeedPostsWithTags();

  return (
    <HomeLayout>
      <div className="space-y-4">
        {posts.length === 0 ? (
          <p className="text-center text-neutral-500 dark:text-neutral-400 py-10">
            No posts yet. Be the first to create one!
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

              {/* Community badge */}
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
                  canInteract={Boolean(session)}
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