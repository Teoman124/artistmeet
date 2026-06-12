'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from './SimpleThemeProvider';

type ProfileMenuProps = {
    username: string;
    avatarUrl?: string | null;
};

export function ProfileMenu({ username, avatarUrl }: ProfileMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { theme, setTheme } = useTheme();
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
                        <Link href="/dashboard" onClick={() => setIsOpen(false)} className="rounded-xl px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-white/10">
                            Dashboard
                        </Link>

                        <Link href={`/profile/${username}`} onClick={() => setIsOpen(false)} className="rounded-xl px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-white/10">
                            My profile
                        </Link>

                        <Link href="/settings" onClick={() => setIsOpen(false)} className="rounded-xl px-3 py-2 text-left hover:bg-neutral-100 dark:hover:bg-white/10">
                            Settings
                        </Link>

                        {/* Theme Switcher - 3 way switch */}
                        <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/10">
                            <p className="px-3 py-1 text-xs text-neutral-500 dark:text-neutral-400">Theme</p>
                            <div className="flex gap-1 p-1 mt-1">
                                <button
                                    onClick={() => setTheme('light')}
                                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${theme === 'light'
                                            ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white'
                                            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                        }`}
                                >
                                    Light
                                </button>
                                <button
                                    onClick={() => setTheme('system')}
                                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${theme === 'system'
                                            ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white'
                                            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                        }`}
                                >
                                    System
                                </button>
                                <button
                                    onClick={() => setTheme('dark')}
                                    className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${theme === 'dark'
                                            ? 'bg-neutral-200 text-neutral-900 dark:bg-neutral-700 dark:text-white'
                                            : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800'
                                        }`}
                                >
                                    Dark
                                </button>
                            </div>
                        </div>

                        <Link
                            href="/api/auth/logout"
                            onClick={() => setIsOpen(false)}
                            className="mt-2 rounded-xl px-3 py-2 text-left text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                        >
                            Logout
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
}