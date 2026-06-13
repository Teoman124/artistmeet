import { cookies } from 'next/headers';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import Link from 'next/link';
import { HomeLayout } from '@/app/components/HomeLayout';

export default async function CommunityFeedPage() {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

    return (
        <HomeLayout>
            <div className="space-y-4">
                <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                    <h1 className="text-2xl font-semibold">Community Feed</h1>
                    <p className="mt-2 text-neutral-600 dark:text-neutral-400">
                        Posts from communities you've joined
                    </p>
                </div>

                {!session ? (
                    <div className="rounded-2xl border border-dashed border-black/10 bg-neutral-50 p-8 text-center dark:border-white/10 dark:bg-white/5">
                        <p className="text-neutral-500 dark:text-neutral-400">
                            Log in to see posts from your communities
                        </p>
                    </div>
                ) : (
                    <p className="text-center text-neutral-500 dark:text-neutral-400 py-10">
                        Community feed coming soon!
                    </p>
                )}
            </div>
        </HomeLayout>
    );
}