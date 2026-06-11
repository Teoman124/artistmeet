'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';

type FilterType = 'all' | 'posts' | 'comments' | 'likes' | 'saved';

type PostType = {
    id: number;
    title: string;
    description: string;
    createdAt: Date;
    type?: 'post';
};

type CommentType = {
    id: number;
    content: string;
    postId: number;
    postTitle: string;
    createdAt: Date;
    type?: 'comment';
};

type ActivityItem = {
    id: number;
    type: 'post' | 'comment' | 'like' | 'save';
    title: string;
    description?: string;
    content?: string;
    postId?: number;
    postTitle?: string;
    createdAt: Date;
};

type PublicProfileProps = {
    user: {
        id: number;
        username: string;
        email: string;
        bio: string | null;
        avatar_url: string | null;
        createdAt: string | Date;
    };
    posts: PostType[];
    comments: CommentType[];
    likedPosts: PostType[];
    savedPosts: PostType[];
    isOwnProfile?: boolean;
};

export function PublicProfile({
    user,
    posts,
    comments,
    likedPosts,
    savedPosts,
    isOwnProfile = false
}: PublicProfileProps) {
    const [activeFilter, setActiveFilter] = useState<FilterType>('all');
    const avatarUrl = user.avatar_url || '/zapppppaaaaa.jpg';

    // Combineer alle activiteiten voor de 'all' tab - IEDEREEN kan likes en saves zien!
    const allActivities = useMemo(() => {
        const activities: ActivityItem[] = [];

        // Voeg posts toe
        posts.forEach(post => {
            activities.push({
                id: post.id,
                type: 'post',
                title: post.title,
                description: post.description,
                createdAt: post.createdAt
            });
        });

        // Voeg comments toe
        comments.forEach(comment => {
            activities.push({
                id: comment.id,
                type: 'comment',
                title: `Comment on ${comment.postTitle}`,
                content: comment.content,
                postId: comment.postId,
                postTitle: comment.postTitle,
                createdAt: comment.createdAt
            });
        });

        // IEDEREEN kan likes zien (geen isOwnProfile check!)
        likedPosts.forEach(post => {
            activities.push({
                id: post.id,
                type: 'like',
                title: post.title,
                description: post.description,
                createdAt: post.createdAt
            });
        });

        // IEDEREEN kan saves zien (geen isOwnProfile check!)
        savedPosts.forEach(post => {
            activities.push({
                id: post.id,
                type: 'save',
                title: post.title,
                description: post.description,
                createdAt: post.createdAt
            });
        });

        // Sorteer op datum (nieuwste eerst)
        return activities.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }, [posts, comments, likedPosts, savedPosts]);

    const getCurrentContent = () => {
        switch (activeFilter) {
            case 'all':
                return {
                    items: allActivities,
                    title: 'All activity',
                    emptyMessage: 'No activity yet.',
                    isActivityView: true
                };
            case 'posts':
                return { items: posts, title: 'Posts', emptyMessage: 'No posts yet.', isActivityView: false };
            case 'comments':
                return { items: comments, title: 'Comments', emptyMessage: 'No comments yet.', isActivityView: true };
            case 'likes':
                return { items: likedPosts, title: 'Liked posts', emptyMessage: 'No liked posts yet.', isActivityView: false };
            case 'saved':
                return { items: savedPosts, title: 'Saved posts', emptyMessage: 'No saved posts yet.', isActivityView: false };
            default:
                return { items: posts, title: 'Posts', emptyMessage: 'No posts yet.', isActivityView: false };
        }
    };

    const currentContent = getCurrentContent();

    // IEDEREEN krijgt alle filters (geen isOwnProfile check!)
    const filterOptions = [
        { key: 'all', label: 'All', count: allActivities.length },
        { key: 'posts', label: 'Posts', count: posts.length },
        { key: 'comments', label: 'Comments', count: comments.length },
        { key: 'likes', label: 'Likes', count: likedPosts.length },
        { key: 'saved', label: 'Saved', count: savedPosts.length }
    ];

    // Render voor een activiteit item (voor 'all' en 'comments' tabs)
    const renderActivityItem = (item: ActivityItem | CommentType, itemType: string) => {
        // Voor 'all' tab items
        if ('type' in item) {
            switch (item.type) {
                case 'post':
                    return (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                                    New post
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-950 dark:text-white line-clamp-2">
                                {item.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300 line-clamp-3">
                                {item.description}
                            </p>
                            <Link
                                href={`/post/${item.id}`}
                                className="mt-3 inline-block text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                            >
                                Read more →
                            </Link>
                        </>
                    );
                case 'comment':
                    return (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                                    Comment
                                </span>
                            </div>
                            <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                                {item.content}
                            </p>
                            <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                                on{' '}
                                <Link
                                    href={`/post/${item.postId}`}
                                    className="hover:underline text-neutral-600 dark:text-neutral-400"
                                >
                                    {item.postTitle}
                                </Link>
                            </p>
                        </>
                    );
                case 'like':
                    return (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                                    ❤️ Liked
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-950 dark:text-white line-clamp-2">
                                {item.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300 line-clamp-3">
                                {item.description}
                            </p>
                            <Link
                                href={`/post/${item.id}`}
                                className="mt-3 inline-block text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                            >
                                Read more →
                            </Link>
                        </>
                    );
                case 'save':
                    return (
                        <>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400">
                                    📌 Saved
                                </span>
                            </div>
                            <h3 className="text-lg font-semibold text-neutral-950 dark:text-white line-clamp-2">
                                {item.title}
                            </h3>
                            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300 line-clamp-3">
                                {item.description}
                            </p>
                            <Link
                                href={`/post/${item.id}`}
                                className="mt-3 inline-block text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                            >
                                Read more →
                            </Link>
                        </>
                    );
                default:
                    return null;
            }
        }

        // Voor 'comments' tab items
        return (
            <>
                <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        Comment
                    </span>
                </div>
                <p className="text-sm leading-6 text-neutral-600 dark:text-neutral-300">
                    {item.content}
                </p>
                <p className="mt-2 text-xs text-neutral-400 dark:text-neutral-500">
                    on{' '}
                    <Link
                        href={`/post/${item.postId}`}
                        className="hover:underline text-neutral-600 dark:text-neutral-400"
                    >
                        {item.postTitle}
                    </Link>
                </p>
            </>
        );
    };

    // Render voor reguliere items (posts, likes, saves)
    const renderRegularItem = (item: any) => (
        <>
            <h3 className="text-lg font-semibold text-neutral-950 dark:text-white line-clamp-2">
                {item.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-neutral-600 dark:text-neutral-300 line-clamp-3">
                {item.description}
            </p>
            <Link
                href={`/post/${item.id}`}
                className="mt-3 inline-block text-sm text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
            >
                Read more →
            </Link>
        </>
    );

    return (
        <section className="space-y-6">
            {/* Header Card */}
            <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                <div className="flex flex-col gap-6 md:flex-row md:items-center">
                    <div className="h-28 w-28 overflow-hidden rounded-full border border-black/10 bg-neutral-100 shadow-sm dark:border-white/10 dark:bg-white/5">
                        <img
                            src={avatarUrl}
                            alt={`${user.username}'s avatar`}
                            className="h-full w-full object-cover"
                            onError={(e) => {
                                (e.target as HTMLImageElement).src = '/zapppppaaaaa.jpg';
                            }}
                        />
                    </div>

                    <div className="flex-1 space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">
                            {isOwnProfile ? 'My profile' : `Profile of ${user.username}`}
                        </p>
                        <h1 className="text-4xl font-semibold tracking-tight text-neutral-950 dark:text-white">
                            {user.username}
                        </h1>
                        <p className="max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300">
                            {user.bio || 'No description yet.'}
                        </p>

                        <div className="flex flex-wrap gap-3 pt-2">
                            {!isOwnProfile && (
                                <button
                                    type="button"
                                    disabled
                                    className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white opacity-70 dark:bg-white dark:text-neutral-950"
                                >
                                    Message
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="rounded-3xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-950">
                <div className="flex flex-wrap border-b border-black/10 dark:border-white/10">
                    {filterOptions.map((option) => (
                        <button
                            key={option.key}
                            onClick={() => setActiveFilter(option.key as FilterType)}
                            className={`px-6 py-4 text-sm font-medium transition-all ${activeFilter === option.key
                                ? 'border-b-2 border-neutral-950 text-neutral-950 dark:border-white dark:text-white'
                                : 'text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300'
                                }`}
                        >
                            {option.label} ({option.count})
                        </button>
                    ))}
                </div>

                <div className="p-6">
                    <div className="space-y-4">
                        {currentContent.items.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {currentContent.items.map((item: any) => {
                                    // Bepaal een unieke key op basis van type en id
                                    let uniqueKey;

                                    if (activeFilter === 'all' && item.type) {
                                        uniqueKey = `${item.type}-${item.id}`;
                                    } else if (activeFilter === 'comments') {
                                        uniqueKey = `comment-${item.id}`;
                                    } else {
                                        uniqueKey = `${activeFilter}-${item.id}`;
                                    }

                                    return (
                                        <article
                                            key={uniqueKey}
                                            className="rounded-2xl border border-black/10 bg-neutral-50 p-5 dark:border-white/10 dark:bg-white/5 transition-all hover:shadow-md"
                                        >
                                            {(activeFilter === 'all' || activeFilter === 'comments')
                                                ? renderActivityItem(item, activeFilter)
                                                : renderRegularItem(item)
                                            }
                                        </article>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="rounded-2xl border border-dashed border-black/10 bg-neutral-50 px-4 py-5 text-sm text-neutral-500 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400">
                                {currentContent.emptyMessage}
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}