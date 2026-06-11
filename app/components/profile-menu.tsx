'use client';

import { useState } from 'react';
import Link from 'next/link';

type ProfileMenuProps = {
    username: string;
    avatarUrl?: string | null;
};

export function ProfileMenu({ username, avatarUrl }: ProfileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const displayAvatar = avatarUrl || '/zapppppaaaaa.jpg';

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                aria-label="Open profile menu"
                className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-black/10 bg-white shadow-sm transition hover:bg-neutral-50 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
                <img
                    src={displayAvatar}
                    alt=""
                    aria-hidden="true"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = '/zapppppaaaaa.jpg';
                    }}
                />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full z-20 mt-3 w-56 overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-neutral-950">
                    <div className="border-b border-black/5 px-4 py-3 dark:border-white/10">
                        <p className="text-xs uppercase tracking-[0.3em] text-neutral-500 dark:text-neutral-400">{username}</p>
                    </div>

                    <div className="flex flex-col p-2 text-sm">
                        {/* Dashboard - voor eigen statistieken en detail pagina's */}
                        <Link href="/dashboard" onClick={() => setIsOpen(false)} className="rounded-xl px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-white/10">
                            Dashboard
                        </Link>

                        {/* My profile - gaat naar publieke profiel pagina */}
                        <Link href={`/profile/${username}`} onClick={() => setIsOpen(false)} className="rounded-xl px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-white/10">
                            My profile
                        </Link>

                        <Link href="/settings" onClick={() => setIsOpen(false)} className="rounded-xl px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-white/10">
                            Settings
                        </Link>
                        <button
                            type="button"
                            disabled
                            className="rounded-xl px-3 py-2 text-left text-neutral-400 opacity-80"
                        >
                            Dark / Light mode coming soon
                        </button>
                        <Link
                            href="/api/auth/logout"
                            onClick={() => setIsOpen(false)}
                            className="rounded-xl px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                        >
                            Logout
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}