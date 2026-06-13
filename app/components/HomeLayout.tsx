'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { TagCloud } from './TagCloud';
import { FloatingCreateButton } from './FloatingCreateButton';

type HomeLayoutProps = {
    children: React.ReactNode;
    searchResults?: any[];
    onSearch?: (query: string) => void;
};

type UserCommunity = {
    id: number;
    name: string;
    role: string;
};

export function HomeLayout({ children, searchResults = [], onSearch }: HomeLayoutProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [myCommunities, setMyCommunities] = useState<UserCommunity[]>([]);
    const [loadingCommunities, setLoadingCommunities] = useState(true);
    const [scrolled, setScrolled] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        const fetchCommunities = async () => {
            try {
                const response = await fetch('/api/communities/mine');
                if (response.ok) {
                    const data = await response.json();
                    setMyCommunities(data);
                }
            } catch (error) {
                console.error('Failed to fetch communities:', error);
            } finally {
                setLoadingCommunities(false);
            }
        };
        fetchCommunities();
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 1 && onSearch) {
            onSearch(query);
            setShowResults(true);
        } else if (query.length === 0) {
            setShowResults(false);
            if (onSearch) onSearch('');
        } else {
            setShowResults(false);
        }
    };

    const clearSearch = () => {
        setSearchQuery('');
        setShowResults(false);
        if (onSearch) onSearch('');
    };

    const navItems = [
        { href: '/', label: 'Home', icon: '🏠' },
        { href: '/explore', label: 'Explore', icon: '🔍' },
        { href: '/community', label: 'Community', icon: '👥' },
    ];

    const suggestedUsers = [
        { username: 'amelia', bio: 'Ambient producer', avatar: '🎵', href: '/profile/amelia' },
        { username: 'bram', bio: 'Guitarist', avatar: '🎸', href: '/profile/bram' },
        { username: 'cora', bio: 'Songwriter', avatar: '🎤', href: '/profile/cora' },
        { username: 'dylan', bio: 'Sound designer', avatar: '🎛️', href: '/profile/dylan' },
    ];

    const topOffset = scrolled ? 56 : 72;

    return (
        <>
            <div className="flex gap-6 max-w-7xl mx-auto">
                {/* Linker zijbalk */}
                <aside
                    className="w-1/4 flex-shrink-0"
                    style={{
                        position: 'sticky',
                        top: topOffset,
                        height: `calc(100vh - ${topOffset + 24}px)`,
                        overflowY: 'auto'
                    }}
                >
                    <div className="space-y-6 pr-2">
                        <nav className="flex flex-col gap-1">
                            {navItems.map((item) => (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${pathname === item.href
                                        ? 'bg-neutral-100 text-neutral-950 dark:bg-white/10 dark:text-white font-semibold'
                                        : 'text-neutral-600 hover:bg-neutral-50 dark:text-neutral-400 dark:hover:bg-white/5'
                                        }`}
                                >
                                    <span className="text-xl">{item.icon}</span>
                                    <span>{item.label}</span>
                                </Link>
                            ))}
                        </nav>

                        {!loadingCommunities && myCommunities.length > 0 && (
                            <div>
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-3">
                                    My Communities
                                </h3>
                                <div className="space-y-1">
                                    {myCommunities.map((comm) => (
                                        <Link
                                            key={comm.id}
                                            href={`/communities/${comm.name}`}
                                            className="block px-3 py-2 rounded-lg text-sm hover:bg-neutral-100 dark:hover:bg-white/10 transition"
                                        >
                                            {comm.name}
                                            {comm.role === 'mod' && (
                                                <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">(mod)</span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                                <Link href="/explore" className="block mt-3 text-xs text-neutral-500 hover:underline">
                                    + Discover more
                                </Link>
                            </div>
                        )}

                        {loadingCommunities && (
                            <div className="h-16 animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded-xl"></div>
                        )}
                    </div>
                </aside>

                {/* Midden - Posts Feed */}
                <main className="w-1/2 min-w-0">
                    <div className="space-y-4">
                        {children}
                    </div>
                </main>

                {/* Rechter zijbalk */}
                <aside
                    className="w-1/4 flex-shrink-0"
                    style={{
                        position: 'sticky',
                        top: topOffset,
                        height: `calc(100vh - ${topOffset + 24}px)`,
                        overflowY: 'auto'
                    }}
                >
                    <div className="space-y-4 pl-2">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search posts..."
                                value={searchQuery}
                                onChange={handleSearch}
                                className="w-full px-4 py-2 pl-10 pr-10 rounded-full border border-black/10 bg-white dark:border-white/10 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                            />
                            <svg
                                className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            {searchQuery && (
                                <button
                                    onClick={clearSearch}
                                    className="absolute right-3 top-2.5 h-5 w-5 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition"
                                    aria-label="Clear search"
                                >
                                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {showResults && searchResults.length > 0 && (
                            <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-neutral-900">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-sm font-semibold text-neutral-950 dark:text-white">Search results</h3>
                                    <button
                                        onClick={clearSearch}
                                        className="text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                                    >
                                        Clear
                                    </button>
                                </div>
                                <div className="space-y-3">
                                    {searchResults.slice(0, 5).map((post: any) => (
                                        <Link
                                            key={post.id}
                                            href={`/post/${post.id}`}
                                            className="block p-2 rounded-lg hover:bg-neutral-50 dark:hover:bg-white/5"
                                        >
                                            <p className="text-sm font-medium text-neutral-950 dark:text-white line-clamp-1">
                                                {post.title}
                                            </p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                by {post.username}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-neutral-900">
                            <h3 className="text-sm font-semibold mb-3 text-neutral-950 dark:text-white">Popular Tags</h3>
                            <TagCloud />
                        </div>

                        <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-neutral-900">
                            <h3 className="text-sm font-semibold mb-3 text-neutral-950 dark:text-white">Suggested for you</h3>
                            <div className="space-y-3">
                                {suggestedUsers.map((user) => (
                                    <Link
                                        key={user.username}
                                        href={user.href}
                                        className="flex items-center gap-3 group hover:bg-neutral-50 dark:hover:bg-white/5 rounded-lg p-2 transition cursor-pointer"
                                    >
                                        <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-lg">
                                            {user.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-neutral-950 dark:text-white group-hover:underline">
                                                {user.username}
                                            </p>
                                            <p className="text-xs text-neutral-500 dark:text-neutral-400">
                                                {user.bio}
                                            </p>
                                        </div>
                                        <button
                                            className="text-xs px-3 py-1 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950 hover:opacity-80 transition"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                console.log(`Follow ${user.username}`);
                                            }}
                                        >
                                            Follow
                                        </button>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

            <FloatingCreateButton />
        </>
    );
}