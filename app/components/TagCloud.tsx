'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Tag = {
    id: number;
    name: string;
    count: number;
};

export function TagCloud() {
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTags = async () => {
            try {
                const response = await fetch('/api/tags/popular');
                if (response.ok) {
                    const data = await response.json();
                    setTags(data);
                }
            } catch (error) {
                console.error('Failed to fetch tags:', error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTags();
    }, []);

    if (isLoading) {
        return (
            <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-950 dark:border-white"></div>
            </div>
        );
    }

    if (tags.length === 0) {
        return (
            <div className="text-center py-4 text-neutral-500 dark:text-neutral-400">
                No tags yet
            </div>
        );
    }

    return (
        <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
                <Link
                    key={tag.id}
                    href={`/tags/${tag.name}`}
                    className="px-3 py-1 rounded-full text-sm bg-neutral-100 text-neutral-700 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700 transition"
                >
                    #{tag.name} ({tag.count})
                </Link>
            ))}
        </div>
    );
}