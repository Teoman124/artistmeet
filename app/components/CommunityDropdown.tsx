'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type UserCommunity = {
    id: number;
    name: string;
    role: string;
};

export function CommunityDropdown() {
    const [communities, setCommunities] = useState<UserCommunity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/communities/mine')
            .then(res => res.json())
            .then(data => {
                setCommunities(data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) {
        return <div className="h-20 animate-pulse bg-neutral-200 dark:bg-neutral-700 rounded-xl mt-6"></div>;
    }

    if (communities.length === 0) return null;

    return (
        <div className="mt-6">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-2">
                My Communities
            </h3>
            <div className="space-y-1">
                {communities.map(comm => (
                    <Link
                        key={comm.id}
                        href={`/communities/${comm.id}`}  // Veranderd van /c/${comm.name} naar /communities/${comm.id}
                        className="block px-3 py-2 rounded-lg text-sm hover:bg-neutral-100 dark:hover:bg-white/10 transition"
                    >
                        {comm.name}
                        {comm.role === 'mod' && (
                            <span className="ml-2 text-xs text-yellow-600 dark:text-yellow-400">(mod)</span>
                        )}
                    </Link>
                ))}
            </div>
            <Link href="/explore" className="block mt-2 text-xs text-neutral-500 hover:underline">
                + Discover more
            </Link>
        </div>
    );
}