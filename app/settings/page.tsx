import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';

export default async function SettingsPage() {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

    if (!session) {
        redirect('/login');
    }

    return (
        <section className="space-y-8">
            <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">
                    Settings
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950 dark:text-white">
                    Account settings
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300">
                    Theme switching is not active yet. This page is ready for it later.
                </p>
            </div>

            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                <p className="text-sm font-medium text-neutral-500 dark:text-neutral-400">Appearance</p>
                <button
                    type="button"
                    disabled
                    className="mt-4 rounded-full border border-dashed border-black/15 bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-500 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400"
                >
                    Dark / Light mode coming soon
                </button>
            </div>
        </section>
    );
}