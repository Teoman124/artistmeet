import Link from 'next/link';
import { getDatabase } from '@/src/lib/db';
import { PostService } from '@/src/services/post.service';

type PublicProfilePageProps = {
    params: Promise<{ username: string }>;
};

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
    const { username } = await params;
    const database = getDatabase();

    try {
        const user = database
            .prepare('SELECT id, username, email, role, bio, createdAt FROM User WHERE lower(username) = lower(?) LIMIT 1')
            .get(username) as
            | { id: number; username: string; email: string; role: string; bio: string | null; createdAt: string }
            | undefined;

        if (!user) {
            return (
                <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                    <h1 className="text-2xl font-semibold text-neutral-950 dark:text-white">Profile not found</h1>
                    <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-400">This user profile does not exist yet.</p>
                    <Link href="/" className="mt-4 inline-flex rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-950">
                        Back to feed
                    </Link>
                </section>
            );
        }

        const posts = await PostService.getPostsByUserId(user.id);

        return (
            <section className="space-y-8">
                <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                    <div className="flex flex-col gap-6 md:flex-row md:items-center">
                        <div className="h-28 w-28 overflow-hidden rounded-full border border-black/10 bg-neutral-100 shadow-sm dark:border-white/10 dark:bg-white/5">
                            <img
                                src="/zapppppaaaaa.jpg"
                                alt="Profile avatar"
                                className="h-full w-full object-cover"
                            />
                        </div>

                        <div className="flex-1 space-y-3">
                            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">Public profile</p>
                            <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 dark:text-white">{user.username}</h1>
                            <p className="max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300">
                                {user.bio || 'No description yet.'}
                            </p>

                            <div className="flex flex-wrap gap-3 pt-2">
                                <button
                                    type="button"
                                    disabled
                                    className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white opacity-70 dark:bg-white dark:text-neutral-950"
                                >
                                    Message
                                </button>
                                <Link href="/dashboard" className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-neutral-900 dark:border-white/10 dark:text-white">
                                    Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4 dark:border-white/10 dark:bg-white/5">
                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Username</p>
                            <p className="mt-1 text-base font-medium text-neutral-950 dark:text-white">{user.username}</p>
                        </div>
                        <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4 dark:border-white/10 dark:bg-white/5">
                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Posts</p>
                            <p className="mt-1 text-base font-medium text-neutral-950 dark:text-white">{posts.length}</p>
                        </div>
                        <div className="rounded-2xl border border-black/10 bg-neutral-50 p-4 dark:border-white/10 dark:bg-white/5">
                            <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Role</p>
                            <p className="mt-1 text-base font-medium text-neutral-950 dark:text-white">{user.role}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-4 rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold text-neutral-950 dark:text-white">Posts</h2>
                        <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-400">Recent posts from this profile.</p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {posts.map((post) => (
                            <article key={post.id} className="rounded-2xl border border-black/10 bg-neutral-50 p-5 dark:border-white/10 dark:bg-white/5">
                                <h3 className="text-lg font-semibold text-neutral-950 dark:text-white">{post.title}</h3>
                                <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300">{post.description}</p>
                            </article>
                        ))}
                    </div>
                </div>
            </section>
        );
    } finally {
        database.close();
    }
}