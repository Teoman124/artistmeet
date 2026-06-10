import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { UserService } from '@/src/services/user.service';
import { PostService } from '@/src/services/post.service';
import Link from 'next/link';
import AvatarUpload from '@/app/components/AvatarUpload';

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

  if (!session) {
    redirect('/login');
  }

  const user = await UserService.getUserByUsername(session.username);

  if (!user) {
    redirect('/login');
  }

  const posts = await PostService.getPostsByUserId(user.id);

  return (
    <section className="space-y-8">
      <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-neutral-950">
        <div className="flex flex-col gap-6 md:flex-row md:items-center">
          {/* Avatar Upload Component - onAvatarUpdate verwijderd */}
          <AvatarUpload
            userId={user.id}
            currentAvatarUrl={user.avatar_url}
            username={user.username}
          />

          <div className="flex-1 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">
              My profile
            </p>
            <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 dark:text-white">
              {user.username}
            </h1>
            <p className="max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300">
              {user.bio || 'No description yet. Add one later from settings.'}
            </p>

            <div className="flex flex-wrap gap-3 pt-2">
              <button
                type="button"
                disabled
                className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white opacity-70 dark:bg-white dark:text-neutral-950"
              >
                Message
              </button>
              <Link
                href="/settings"
                className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-neutral-900 dark:border-white/10 dark:text-white"
              >
                Settings
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Description</p>
          <p className="mt-2 text-base leading-7 text-neutral-700 dark:text-neutral-300">{user.bio || 'No description yet.'}</p>
        </div>
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Posts</p>
          <p className="mt-2 text-3xl font-semibold text-neutral-950 dark:text-white">{posts.length}</p>
        </div>
        <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950">
          <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Profile picture</p>
          <p className="mt-2 text-base font-medium text-neutral-950 dark:text-white">
            {user.avatar_url ? 'Custom avatar uploaded' : 'Using default avatar'}
          </p>
        </div>
      </div>

      <div className="space-y-4 rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold text-neutral-950 dark:text-white">Your posts</h2>
          <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">Posts you created are shown here.</p>
        </div>

        {posts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <article key={post.id} className="rounded-2xl border border-black/10 bg-neutral-50 p-5 dark:border-white/10 dark:bg-white/5">
                <h3 className="text-lg font-semibold text-neutral-950 dark:text-white">{post.title}</h3>
                <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{post.description}</p>
              </article>
            ))}
          </div>
        ) : (
          <p className="rounded-2xl border border-dashed border-black/10 bg-neutral-50 px-4 py-5 text-sm text-neutral-500 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
            No posts yet.
          </p>
        )}
      </div>
    </section>
  );
}