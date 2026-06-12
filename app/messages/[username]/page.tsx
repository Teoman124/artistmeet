'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Message = {
    id: number;
    content: string;
    senderId: number;
    receiverId: number;
    senderUsername: string;
    senderAvatar: string | null;
    isRead: boolean;
    createdAt: Date;
};

type UserInfo = {
    id: number;
    username: string;
    avatar_url: string | null;
};

export default function ChatPage({ params }: { params: Promise<{ username: string }> }) {
    const router = useRouter();
    const [username, setUsername] = useState<string>('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [otherUser, setOtherUser] = useState<UserInfo | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [sessionUser, setSessionUser] = useState<{ id: number; username: string } | null>(null);

    // Load params
    useEffect(() => {
        const loadParams = async () => {
            const { username: paramUsername } = await params;
            setUsername(paramUsername);
        };
        loadParams();
    }, [params]);

    // Fetch session user
    useEffect(() => {
        const fetchSession = async () => {
            try {
                const response = await fetch('/api/users/me');
                if (response.ok) {
                    const data = await response.json();
                    setSessionUser({ id: data.id, username: data.username });
                } else {
                    router.push('/login');
                }
            } catch (error) {
                console.error('Failed to fetch session:', error);
            }
        };
        fetchSession();
    }, [router]);

    // Fetch other user info (for avatar)
    useEffect(() => {
        if (!username) return;

        const fetchOtherUser = async () => {
            try {
                const response = await fetch(`/api/users/by-username/${username}`);
                if (response.ok) {
                    const data = await response.json();
                    setOtherUser(data);
                } else {
                    console.error('Failed to fetch user info');
                }
            } catch (error) {
                console.error('Failed to fetch user info:', error);
            }
        };

        fetchOtherUser();
    }, [username]);

    // Fetch messages
    useEffect(() => {
        if (!username) return;

        const fetchMessages = async () => {
            try {
                const response = await fetch(`/api/messages/${username}`);
                if (response.ok) {
                    const data = await response.json();
                    setMessages(data);
                } else if (response.status === 403) {
                    const errorData = await response.json();
                    setError(errorData.error);
                } else if (response.status === 404) {
                    setError('User not found');
                }
            } catch (error) {
                console.error('Failed to fetch messages:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchMessages();
        const interval = setInterval(fetchMessages, 5000);
        return () => clearInterval(interval);
    }, [username]);

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const response = await fetch(`/api/messages/${username}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newMessage.trim() }),
            });

            if (response.ok) {
                const message = await response.json();
                setMessages(prev => [...prev, message]);
                setNewMessage('');
            } else {
                const errorData = await response.json();
                setError(errorData.error);
                setTimeout(() => setError(null), 3000);
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        } finally {
            setIsSending(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-950 dark:border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <section className="max-w-2xl mx-auto">
                <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center shadow-sm dark:border-red-900/30 dark:bg-red-950/20">
                    <p className="text-red-700 dark:text-red-400">{error}</p>
                    <Link href="/messages" className="mt-4 inline-block text-neutral-950 dark:text-white underline">
                        ← Back to messages
                    </Link>
                </div>
            </section>
        );
    }

    const otherUserAvatar = otherUser?.avatar_url || '/zapppppaaaaa.jpg';

    return (
        <section className="max-w-2xl mx-auto">
            <div className="rounded-3xl border border-black/10 bg-white shadow-sm dark:border-white/10 dark:bg-neutral-950">
                {/* Header - met klikbare avatar en username naar profiel */}
                <div className="flex items-center gap-4 border-b border-black/10 p-4 dark:border-white/10">
                    <Link href="/messages" className="text-neutral-500 hover:text-neutral-700 dark:text-neutral-400">
                        ←
                    </Link>
                    <Link href={`/profile/${username}`} className="flex items-center gap-4 group">
                        <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700 transition group-hover:opacity-80">
                            <img
                                src={otherUserAvatar}
                                alt={username}
                                className="h-full w-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).src = '/zapppppaaaaa.jpg';
                                }}
                            />
                        </div>
                        <h2 className="text-xl font-semibold text-neutral-950 dark:text-white group-hover:underline transition">
                            {username}
                        </h2>
                    </Link>
                </div>

                {/* Messages */}
                <div className="h-[500px] overflow-y-auto p-4 space-y-4">
                    {messages.length === 0 ? (
                        <div className="flex justify-center items-center h-full text-neutral-500 dark:text-neutral-400">
                            No messages yet. Send a message to start the conversation!
                        </div>
                    ) : (
                        messages.map((message) => {
                            const isOwn = message.senderId === sessionUser?.id;
                            const showAvatar = !isOwn;
                            return (
                                <div key={message.id} className={`flex ${isOwn ? 'justify-end' : 'justify-start'} items-end gap-2`}>
                                    {showAvatar && (
                                        <Link href={`/profile/${message.senderUsername}`}>
                                            <div className="h-8 w-8 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700 flex-shrink-0 transition hover:opacity-80">
                                                <img
                                                    src={message.senderAvatar || '/zapppppaaaaa.jpg'}
                                                    alt={message.senderUsername}
                                                    className="h-full w-full object-cover"
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = '/zapppppaaaaa.jpg';
                                                    }}
                                                />
                                            </div>
                                        </Link>
                                    )}
                                    <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isOwn
                                        ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                                        : 'bg-neutral-100 text-neutral-950 dark:bg-neutral-800 dark:text-white'
                                        }`}>
                                        {!isOwn && (
                                            <Link href={`/profile/${message.senderUsername}`}>
                                                <p className="text-xs font-medium text-neutral-500 dark:text-neutral-400 mb-1 hover:underline">
                                                    {message.senderUsername}
                                                </p>
                                            </Link>
                                        )}
                                        <p className="text-sm break-words">{message.content}</p>
                                        <p className={`text-xs mt-1 ${isOwn ? 'text-neutral-400' : 'text-neutral-500'}`}>
                                            {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <form onSubmit={sendMessage} className="border-t border-black/10 p-4 dark:border-white/10">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Type a message..."
                            className="flex-1 px-4 py-2 rounded-full border border-black/10 bg-white dark:border-white/10 dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                        />
                        <button
                            type="submit"
                            disabled={isSending || !newMessage.trim()}
                            className="px-6 py-2 rounded-full bg-neutral-950 text-white hover:bg-neutral-800 disabled:opacity-50 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </section>
    );
}