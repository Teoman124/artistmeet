import Link from 'next/link';
import { cookies } from 'next/headers';
import { getDatabase } from '@/src/lib/db';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { PostService } from '@/src/services/post.service';
import { CommentService } from '@/src/services/comment.service';
import { PublicProfile } from '@/app/components/PublicProfile';

type PublicProfilePageProps = {
    params: Promise<{ username: string }>;
};

export default async function PublicProfilePage({ params }: PublicProfilePageProps) {
    const { username } = await params;
    const database = getDatabase();
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

    try {
        const user = database
            .prepare('SELECT id, username, email, bio, avatar_url, createdAt FROM User WHERE lower(username) = lower(?) LIMIT 1')
            .get(username) as
            | { id: number; username: string; email: string; bio: string | null; avatar_url: string | null; createdAt: string }
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

        const isOwnProfile = session?.username === username;

        // IEDEREEN kan likes en saved posts zien - haal ze altijd op!
        const [posts, comments, likedPosts, savedPosts] = await Promise.all([
            PostService.getPostsByUserId(user.id),
            CommentService.getCommentsByUserId(user.id),
            PostService.getLikedPostsByUserId(user.id),  // Altijd ophalen, niet alleen voor eigen profiel
            PostService.getSavedPostsByUserId(user.id)   // Altijd ophalen, niet alleen voor eigen profiel
        ]);

        return (
            <PublicProfile
                user={user}
                posts={posts}
                comments={comments}
                likedPosts={likedPosts}
                savedPosts={savedPosts}
                isOwnProfile={isOwnProfile}
            />
        );
    } finally {
        database.close();
    }
}