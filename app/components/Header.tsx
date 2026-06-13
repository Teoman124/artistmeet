'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProfileMenu } from './profile-menu';

type HeaderProps = {
    username: string;
    avatarUrl: string | null;
    session: boolean;
};

export function Header({ username, avatarUrl, session }: HeaderProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-50 w-full transition-all duration-300 ${scrolled
                    ? 'bg-white/95 dark:bg-black/95 shadow-md backdrop-blur-sm'
                    : 'bg-white/70 dark:bg-black/70 backdrop-blur-sm shadow-sm'
                }`}
        >
            <div className={`mx-auto max-w-7xl px-4 transition-all duration-300 flex items-center justify-between ${scrolled ? 'py-2' : 'py-4'
                }`}>
                <Link
                    href="/"
                    className={`font-semibold transition-all duration-300 ${scrolled ? 'text-lg' : 'text-xl'
                        }`}
                >
                    ArtistMeet
                </Link>

                <div className="flex items-center gap-4">
                    <nav className="relative text-sm text-gray-600 dark:text-gray-300">
                        {!session ? (
                            <>
                                <Link href="/login" className="px-3 hover:underline">
                                    Login
                                </Link>
                                <Link href="/register" className="px-3 hover:underline">
                                    Register
                                </Link>
                            </>
                        ) : (
                            <ProfileMenu username={username} avatarUrl={avatarUrl} />
                        )}
                    </nav>
                </div>
            </div>
        </header>
    );
}