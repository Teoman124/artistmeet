'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Notification = {
    id: number;
    type: 'like' | 'comment' | 'save' | 'follow' | 'message';
    actorUsername: string;
    actorAvatar: string | null;
    postId: number | null;
    postTitle: string | null;
    commentContent: string | null;
    isRead: boolean;
    createdAt: Date;
};

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const router = useRouter();

    const fetchNotifications = async () => {
        try {
            const response = await fetch('/api/notifications');
            if (response.ok) {
                const data = await response.json();
                setNotifications(data.notifications);
                setUnreadCount(data.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: number) => {
        try {
            await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
            setNotifications(prev =>
                prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await fetch('/api/notifications/read-all', { method: 'POST' });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getNotificationText = (notification: Notification) => {
        switch (notification.type) {
            case 'like':
                return `liked your post "${notification.postTitle}"`;
            case 'comment':
                return `commented on your post "${notification.postTitle}": "${notification.commentContent?.slice(0, 50)}${notification.commentContent && notification.commentContent.length > 50 ? '...' : ''}"`;
            case 'save':
                return `saved your post "${notification.postTitle}"`;
            case 'follow':
                return `started following you`;
            case 'message':
                return `sent you a message`;
            default:
                return '';
        }
    };

    const getNotificationLink = (notification: Notification) => {
        if (notification.type === 'follow') {
            return `/profile/${notification.actorUsername}`;
        }
        if (notification.type === 'message') {
            return `/messages/${notification.actorUsername}`;
        }
        return `/post/${notification.postId}`;
    };

    if (isLoading) {
        return (
            <div className="h-8 w-8 rounded-full bg-neutral-200 dark:bg-neutral-700 animate-pulse" />
        );
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-white/10 transition"
            >
                <svg className="w-6 h-6 text-neutral-600 dark:text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full z-20 mt-3 w-80 max-h-[500px] overflow-hidden rounded-2xl border border-black/10 bg-white shadow-lg dark:border-white/10 dark:bg-neutral-950">
                    <div className="flex items-center justify-between border-b border-black/10 p-4 dark:border-white/10">
                        <h3 className="font-semibold text-neutral-950 dark:text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-neutral-500 hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-300"
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div className="overflow-y-auto max-h-[400px]">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <Link
                                    key={notification.id}
                                    href={getNotificationLink(notification)}
                                    onClick={() => {
                                        markAsRead(notification.id);
                                        setIsOpen(false);
                                    }}
                                    className={`block p-4 hover:bg-neutral-50 dark:hover:bg-white/5 transition ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
                                >
                                    <div className="flex gap-3">
                                        <div className="h-10 w-10 overflow-hidden rounded-full bg-neutral-200 dark:bg-neutral-700 flex-shrink-0">
                                            <img
                                                src={notification.actorAvatar || '/zapppppaaaaa.jpg'}
                                                alt={notification.actorUsername}
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).src = '/zapppppaaaaa.jpg';
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm text-neutral-950 dark:text-white">
                                                <span className="font-semibold">{notification.actorUsername}</span>
                                                {' '}{getNotificationText(notification)}
                                            </p>
                                            <p className="text-xs text-neutral-400 mt-1">
                                                {new Date(notification.createdAt).toLocaleDateString()} {new Date(notification.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        {!notification.isRead && (
                                            <div className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                                        )}
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}