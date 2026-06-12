'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

type FollowButtonProps = {
    username: string;
};

export function FollowButton({ username }: FollowButtonProps) {
    const [isFollowing, setIsFollowing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const router = useRouter();

    // Haal follow status op
    useEffect(() => {
        const fetchFollowStatus = async () => {
            try {
                const response = await fetch(`/api/users/follow?username=${encodeURIComponent(username)}`);
                const data = await response.json();
                if (response.ok) {
                    setIsFollowing(data.isFollowing);
                }
            } catch (error) {
                console.error('Failed to fetch follow status:', error);
            } finally {
                setIsInitialLoading(false);
            }
        };

        fetchFollowStatus();
    }, [username]);

    const handleFollow = async () => {
        if (isLoading) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/users/follow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsFollowing(data.following);
                router.refresh();
            }
        } catch (error) {
            console.error('Follow action failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (isInitialLoading) {
        return (
            <button
                disabled
                className="px-4 py-2 rounded-full text-sm font-medium bg-neutral-200 dark:bg-neutral-700 text-neutral-500"
            >
                Loading...
            </button>
        );
    }

    return (
        <button
            onClick={handleFollow}
            disabled={isLoading}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${isFollowing
                    ? 'border border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10'
                    : 'bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200'
                } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            {isLoading ? 'Processing...' : isFollowing ? 'Unfollow' : 'Follow'}
        </button>
    );
}