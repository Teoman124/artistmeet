'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

type PostCardActionsProps = {
    postId: number;
    isLiked?: boolean;
    isSaved?: boolean;
    isOwnPost?: boolean;
    canInteract: boolean;
};

async function sendToggleRequest(url: string) {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? 'Action failed.');
    }

    return response.json() as Promise<{ liked?: boolean; saved?: boolean }>;
}

export function PostCardActions({ postId, isLiked, isSaved, isOwnPost, canInteract }: PostCardActionsProps) {
    const router = useRouter();
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();

    if (isOwnPost) {
        return <span className="text-xs font-medium uppercase tracking-[0.25em] text-neutral-400">Your post</span>;
    }

    if (!canInteract) {
        return (
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                Log in to like or save posts.
            </p>
        );
    }

    const handleAction = (url: string) => {
        setError('');

        startTransition(() => {
            void sendToggleRequest(url)
                .then(() => {
                    router.refresh();
                })
                .catch((actionError: unknown) => {
                    setError(actionError instanceof Error ? actionError.message : 'Action failed.');
                });
        });
    };

    return (
        <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleAction(`/api/posts/${postId}/like`)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${isLiked ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950' : 'bg-neutral-100 text-neutral-900 dark:bg-white/10 dark:text-white'} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                    {isLiked ? 'Unlike' : 'Like'}
                </button>
                <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleAction(`/api/posts/${postId}/save`)}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${isSaved ? 'bg-emerald-600 text-white' : 'bg-neutral-100 text-neutral-900 dark:bg-white/10 dark:text-white'} disabled:cursor-not-allowed disabled:opacity-60`}
                >
                    {isSaved ? 'Unsave' : 'Save'}
                </button>
            </div>

            {error ? <p className="text-sm text-red-600 dark:text-red-400">{error}</p> : null}
        </div>
    );
}