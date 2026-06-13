'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Community = {
    id: number;
    name: string;
};

type CreatePostModalProps = {
    isOpen: boolean;
    onClose: () => void;
};

export function CreatePostModal({ isOpen, onClose }: CreatePostModalProps) {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [communityId, setCommunityId] = useState<string>('');
    const [communities, setCommunities] = useState<Community[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    // Haal communities op waar gebruiker lid van is
    useEffect(() => {
        if (isOpen) {
            const fetchCommunities = async () => {
                try {
                    const response = await fetch('/api/communities/mine');
                    if (response.ok) {
                        const data = await response.json();
                        setCommunities(data);
                    }
                } catch (error) {
                    console.error('Failed to fetch communities:', error);
                }
            };
            fetchCommunities();
        }
    }, [isOpen]);

    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !description.trim()) {
            setError('Title and description are required');
            return;
        }

        setIsLoading(true);
        setError('');

        // Extract tags from input (words starting with #)
        const tagMatches = tags.match(/#[a-zA-Z0-9_]+/g) || [];
        const extractedTags = tagMatches.map(tag => tag.slice(1).toLowerCase());

        try {
            const response = await fetch('/api/posts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    tags: extractedTags,
                    communityId: communityId ? parseInt(communityId) : null,
                }),
            });

            if (response.ok) {
                setTitle('');
                setDescription('');
                setTags('');
                setCommunityId('');
                onClose();
                router.refresh();
            } else {
                const data = await response.json();
                setError(data.error || 'Failed to create post');
            }
        } catch (error) {
            setError('Something went wrong');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div
                ref={modalRef}
                className="w-full max-w-lg rounded-2xl bg-white shadow-xl dark:bg-neutral-950 animate-in fade-in zoom-in duration-200"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-black/10 p-4 dark:border-white/10">
                    <h2 className="text-xl font-semibold text-neutral-950 dark:text-white">Create a post</h2>
                    <button
                        onClick={onClose}
                        className="rounded-full p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-700 dark:text-neutral-400 dark:hover:bg-white/10"
                    >
                        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            placeholder="What's on your mind?"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:bg-neutral-900 dark:border-white/10"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            placeholder="Share your thoughts, music, or ideas..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full px-4 py-2 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:bg-neutral-900 dark:border-white/10"
                        />
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                            Tags
                        </label>
                        <input
                            type="text"
                            placeholder="#music #production #metal"
                            value={tags}
                            onChange={(e) => setTags(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:bg-neutral-900 dark:border-white/10"
                        />
                        <p className="mt-1 text-xs text-neutral-500">
                            Separate tags with spaces, start each with #
                        </p>
                    </div>

                    {communities.length > 0 && (
                        <div>
                            <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-300">
                                Community (optional)
                            </label>
                            <select
                                value={communityId}
                                onChange={(e) => setCommunityId(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-black/10 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-500 dark:bg-neutral-900 dark:border-white/10"
                            >
                                <option value="">No community (general post)</option>
                                {communities.map(comm => (
                                    <option key={comm.id} value={comm.id}>
                                        {comm.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {error && (
                        <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600 dark:bg-red-950/20 dark:text-red-400">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-50 dark:border-white/10 dark:text-neutral-300 dark:hover:bg-white/5"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                        >
                            {isLoading ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}