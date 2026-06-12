'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Conversation = {
    userId: number;
    username: string;
    avatar_url: string | null;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
};

export default function MessagesPage() {
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchConversations = async () => {
            try {
                const response = await fetch('/api/messages/conversations');
                if (response.ok) {
                    const data = await response.json();
                    setConversations(data);
                } else if (response.status === 401) {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Failed to fetch conversations:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchConversations();
    }, [router]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-950 dark:border-white"></div>
            </div>
        );
    }

    return (
        <section className="max-w-2xl mx-auto space-y-6">
            <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                <h1 className="text-3xl font-semibold text-neutral-950 dark:text-white">Messages</h1>
                <p className="mt-2 text-neutral-600 dark:text-neutral-400">Your conversations</p>
            </div>

            {conversations.length === 0 ? (
                <div className="rounded-3xl border border-black/10 bg-white p-8 text-center shadow-sm dark:border-white/10 dark:bg-neutral-950">
                    <p className="text-neutral-500 dark:text-neutral-400">No messages yet.</p>
                    <Link href="/explore" className="mt-4 inline-block text-neutral-950 dark:text-white underline">
                        Explore artists to connect with
                    </Link>
                </div>
            ) : (
                <div className="space-y-2">
                    {conversations.map((conv) => (
                        <Link
                            key={conv.userId}
                            href={`/messages/${conv.username}`}
                            className="block rounded-2xl border border-black/10 bg-white p-4 transition-all hover:shadow-md dark:border-white/10 dark:bg-neutral-950"
                        >
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700">
                                    <img
                                        src={conv.avatar_url || '/zapppppaaaaa.jpg'}
                                        alt={conv.username}
                                        className="h-full w-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).src = '/zapppppaaaaa.jpg';
                                        }}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-neutral-950 dark:text-white">{conv.username}</p>
                                        <p className="text-xs text-neutral-400">
                                            {new Date(conv.lastMessageTime).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <p className="text-sm text-neutral-500 dark:text-neutral-400 truncate">
                                        {conv.lastMessage}
                                    </p>
                                </div>
                                {conv.unreadCount > 0 && (
                                    <div className="h-5 w-5 rounded-full bg-blue-500 flex items-center justify-center">
                                        <span className="text-xs text-white">{conv.unreadCount}</span>
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </section>
    );
}