import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { PostService } from '@/src/services/post.service';
import { PostCardActions } from '@/app/components/post-card-actions';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
  const posts = session ? await PostService.getFeedPostsForUser(session.userId) : await PostService.getFeedPosts();

  return (
    <section className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-black/10 bg-white/80 p-8 shadow-sm backdrop-blur-sm dark:border-white/10 dark:bg-white/5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,180,120,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(120,180,255,0.16),_transparent_35%)]" />
        <div className="relative space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">
            ArtistMeet feed
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-neutral-950 dark:text-white sm:text-5xl">
            Ontdek nieuwe posts van artiesten in de community.
          </h1>
          <p className="max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300">
            Elke post toont de maker, een titel en een korte beschrijving. Tags voegen we later toe.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {posts.map((post) => (
          <article
            key={post.id}
            className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-neutral-950"
          >
            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
              {post.username}
            </p>
            <h2 className="mt-3 text-xl font-semibold text-neutral-950 dark:text-white">
              {post.title}
            </h2>
            <p className="mt-3 text-sm leading-6 text-neutral-600 dark:text-neutral-300">
              {post.description}
            </p>

            <div className="mt-5">
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
    </section>
  );
}
