'use client';

import { useState, useMemo, useEffect } from 'react';
import { FollowButton } from './FollowButton';
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

type FollowUser = {
    id: number;
    username: string;
    avatar_url: string | null;
    bio: string | null;
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
    const [followersCount, setFollowersCount] = useState(0);
    const [followingCount, setFollowingCount] = useState(0);
    const [followers, setFollowers] = useState<FollowUser[]>([]);
    const [following, setFollowing] = useState<FollowUser[]>([]);
    const [showFollowersModal, setShowFollowersModal] = useState(false);
    const [showFollowingModal, setShowFollowingModal] = useState(false);
    const avatarUrl = user.avatar_url || '/zapppppaaaaa.jpg';

    // Haal follow stats en lijsten op
    useEffect(() => {
        const fetchFollowData = async () => {
            try {
                const response = await fetch(`/api/users/follow?username=${encodeURIComponent(user.username)}`);
                const data = await response.json();
                if (response.ok) {
                    setFollowersCount(data.followersCount);
                    setFollowingCount(data.followingCount);
                    setFollowers(data.followers || []);
                    setFollowing(data.following || []);
                }
            } catch (error) {
                console.error('Failed to fetch follow data:', error);
            }
        };

        fetchFollowData();
    }, [user.username]);

    // Combineer alle activiteiten voor de 'all' tab
    const allActivities = useMemo(() => {
        const activities: ActivityItem[] = [];

        posts.forEach(post => {
            activities.push({
                id: post.id,
                type: 'post',
                title: post.title,
                description: post.description,
                createdAt: post.createdAt
            });
        });

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

        likedPosts.forEach(post => {
            activities.push({
                id: post.id,
                type: 'like',
                title: post.title,
                description: post.description,
                createdAt: post.createdAt
            });
        });

        savedPosts.forEach(post => {
            activities.push({
                id: post.id,
                type: 'save',
                title: post.title,
                description: post.description,
                createdAt: post.createdAt
            });
        });

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

    const filterOptions = [
        { key: 'all', label: 'All', count: allActivities.length },
        { key: 'posts', label: 'Posts', count: posts.length },
        { key: 'comments', label: 'Comments', count: comments.length },
        { key: 'likes', label: 'Likes', count: likedPosts.length },
        { key: 'saved', label: 'Saved', count: savedPosts.length }
    ];

    // Modal component voor followers/following
    const FollowModal = ({ title, users, onClose }: { title: string; users: FollowUser[]; onClose: () => void }) => (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-neutral-900 rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-black/10 dark:border-white/10">
                    <h2 className="text-xl font-semibold text-neutral-950 dark:text-white">{title}</h2>
                    <button onClick={onClose} className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <div className="overflow-y-auto max-h-[60vh] p-2">
                    {users.length > 0 ? (
                        users.map((followUser) => (
                            <Link
                                key={followUser.id}
                                href={`/profile/${followUser.username}`}
                                onClick={onClose}
                                className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-100 dark:hover:bg-white/10 transition-colors"
                            >
                                <div className="w-10 h-10 rounded-full bg-neutral-200 dark:bg-neutral-700 overflow-hidden">
                                    <img
                                        src={followUser.avatar_url || '/zapppppaaaaa.jpg'}
                                        alt={followUser.username}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/zapppppaaaaa.jpg';
                                        }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="font-medium text-neutral-950 dark:text-white">{followUser.username}</p>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 line-clamp-1">
                                        {followUser.bio || 'No bio yet'}
                                    </p>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <p className="text-center text-neutral-500 dark:text-neutral-400 py-8">
                            No {title.toLowerCase()} yet.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );

    const renderActivityItem = (item: ActivityItem | CommentType, itemType: string) => {
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
        <>
            <section className="space-y-6">
                {/* Header Card */}
                <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                    <div className="flex flex-col gap-6 md:flex-row md:items-start">
                        {/* Avatar */}
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

                        {/* User Info */}
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

                            {/* Followers & Following - Klikbaar */}
                            <div className="flex gap-6">
                                <button
                                    onClick={() => setShowFollowersModal(true)}
                                    className="hover:underline transition"
                                >
                                    <span className="font-semibold text-neutral-950 dark:text-white">{followersCount}</span>
                                    <span className="text-neutral-500 dark:text-neutral-400 ml-1">followers</span>
                                </button>
                                <button
                                    onClick={() => setShowFollowingModal(true)}
                                    className="hover:underline transition"
                                >
                                    <span className="font-semibold text-neutral-950 dark:text-white">{followingCount}</span>
                                    <span className="text-neutral-500 dark:text-neutral-400 ml-1">following</span>
                                </button>
                            </div>

                            {/* Buttons: Follow + Message (alleen voor anderen) - Message button is nu een Link */}
                            {!isOwnProfile && (
                                <div className="flex flex-wrap gap-3 pt-2">
                                    <FollowButton
                                        username={user.username}
                                        onFollowChange={(isNowFollowing) => {
                                            // Update de followers count direct
                                            setFollowersCount(prev => isNowFollowing ? prev + 1 : prev - 1);
                                            // Update ook de following count als je op je eigen profiel kijkt
                                            // Maar voor andere profielen alleen followers
                                        }}
                                    />
                                    <Link
                                        href={`/messages/${user.username}`}
                                        className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                                    >
                                        Message
                                    </Link>
                                </div>
                            )}
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

            {/* Modals */}
            {showFollowersModal && (
                <FollowModal
                    title={`People following ${user.username}`}
                    users={followers}
                    onClose={() => setShowFollowersModal(false)}
                />
            )}
            {showFollowingModal && (
                <FollowModal
                    title={`People ${user.username} follows`}
                    users={following}
                    onClose={() => setShowFollowingModal(false)}
                />
            )}
        </>
    );
}