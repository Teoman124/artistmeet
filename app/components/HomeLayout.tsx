'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type HomeLayoutProps = {
    children: React.ReactNode;
    searchResults?: any[];
    onSearch?: (query: string) => void;
};

export function HomeLayout({ children, searchResults = [], onSearch }: HomeLayoutProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showResults, setShowResults] = useState(false);
    const pathname = usePathname();

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 1 && onSearch) {
            onSearch(query);
            setShowResults(true);
        } else {
            setShowResults(false);
        }
    };

    const navItems = [
        { href: '/', label: 'Home', icon: '🏠' },
        { href: '/explore', label: 'Explore', icon: '🔍' },
        { href: '/community', label: 'Community', icon: '👥' },
    ];

    return (
        <div className="flex gap-6 max-w-7xl mx-auto px-4 py-6">
            {/* Linker zijbalk - 1/4 breedte (25%) */}
            <aside className="w-1/4 flex-shrink-0">
                <div className="sticky top-20 space-y-2">
                    {/* Verwijder de ArtistMeet titel - staat al in header */}
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
                </div>
            </aside>

            {/* Midden - Posts Feed - 1/2 breedte (50%) */}
            <main className="w-1/2 min-w-0">
                {children}
            </main>

            {/* Rechter zijbalk - Search - 1/4 breedte (25%) */}
            <aside className="w-1/4 flex-shrink-0">
                <div className="sticky top-20 space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchQuery}
                            onChange={handleSearch}
                            className="w-full px-4 py-2 pl-10 rounded-full border border-black/10 bg-white dark:border-white/10 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                        />
                        <svg
                            className="absolute left-3 top-2.5 h-5 w-5 text-neutral-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* Search Results */}
                    {showResults && searchResults.length > 0 && (
                        <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-neutral-900">
                            <h3 className="text-sm font-semibold mb-3 text-neutral-950 dark:text-white">Search results</h3>
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

                    {/* Trending / Suggestions */}
                    <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-neutral-900">
                        <h3 className="text-sm font-semibold mb-3 text-neutral-950 dark:text-white">Trending</h3>
                        <div className="space-y-2 text-sm text-neutral-600 dark:text-neutral-400">
                            <p className="hover:text-neutral-900 dark:hover:text-white cursor-pointer transition">#musicproduction</p>
                            <p className="hover:text-neutral-900 dark:hover:text-white cursor-pointer transition">#ambient</p>
                            <p className="hover:text-neutral-900 dark:hover:text-white cursor-pointer transition">#collaboration</p>
                            <p className="hover:text-neutral-900 dark:hover:text-white cursor-pointer transition">#beats</p>
                            <p className="hover:text-neutral-900 dark:hover:text-white cursor-pointer transition">#sounddesign</p>
                        </div>
                    </div>

                    {/* Suggestions / Who to follow */}
                    <div className="rounded-2xl border border-black/10 bg-white p-4 dark:border-white/10 dark:bg-neutral-900">
                        <h3 className="text-sm font-semibold mb-3 text-neutral-950 dark:text-white">Suggested for you</h3>
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                                    <span className="text-sm">🎵</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-neutral-950 dark:text-white">Amelia</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Ambient producer</p>
                                </div>
                                <button className="text-xs px-3 py-1 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                                    Follow
                                </button>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center">
                                    <span className="text-sm">🎸</span>
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-neutral-950 dark:text-white">Bram</p>
                                    <p className="text-xs text-neutral-500 dark:text-neutral-400">Guitarist</p>
                                </div>
                                <button className="text-xs px-3 py-1 rounded-full bg-neutral-950 text-white dark:bg-white dark:text-neutral-950">
                                    Follow
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );
}