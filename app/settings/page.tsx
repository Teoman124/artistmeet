'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/app/components/SimpleThemeProvider';

export default function SettingsPage() {
    const router = useRouter();
    const { theme, setTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(true);

    // User data state
    const [userData, setUserData] = useState({
        id: 0,
        username: '',
        email: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Privacy settings state
    const [privacySettings, setPrivacySettings] = useState({
        likedPublic: true,
        savedPublic: true,
        messagesOpen: true,
    });

    // Delete account state
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Check authentication en laad gebruiker data
    useEffect(() => {
        const checkAuthAndLoadUser = async () => {
            try {
                const response = await fetch('/api/users/me');
                if (!response.ok) {
                    router.push('/login');
                    setIsAuthenticated(false);
                    return;
                }
                const data = await response.json();
                setUserData(prev => ({
                    ...prev,
                    id: data.id,
                    username: data.username,
                    email: data.email,
                }));
            } catch (error) {
                console.error('Failed to fetch user data:', error);
                router.push('/login');
            }
        };

        const loadPrivacySettings = () => {
            const savedLikedPublic = localStorage.getItem('likedPublic');
            const savedSavedPublic = localStorage.getItem('savedPublic');
            const savedMessagesOpen = localStorage.getItem('messagesOpen');

            if (savedLikedPublic !== null) setPrivacySettings(prev => ({ ...prev, likedPublic: savedLikedPublic === 'true' }));
            if (savedSavedPublic !== null) setPrivacySettings(prev => ({ ...prev, savedPublic: savedSavedPublic === 'true' }));
            if (savedMessagesOpen !== null) setPrivacySettings(prev => ({ ...prev, messagesOpen: savedMessagesOpen === 'true' }));
        };

        checkAuthAndLoadUser();
        loadPrivacySettings();
    }, [router]);

    if (!isAuthenticated) {
        return null;
    }

    // Update profiel
    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage(null);

        if (userData.newPassword && userData.newPassword !== userData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            setIsLoading(false);
            return;
        }

        try {
            const response = await fetch('/api/users/update', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: userData.username,
                    email: userData.email,
                    currentPassword: userData.currentPassword,
                    newPassword: userData.newPassword || undefined,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setUserData(prev => ({ ...prev, currentPassword: '', newPassword: '', confirmPassword: '' }));
                router.refresh();
            } else {
                setMessage({ type: 'error', text: data.error || 'Failed to update profile' });
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Something went wrong' });
        } finally {
            setIsLoading(false);
        }
    };

    // Update privacy instellingen
    const handlePrivacyChange = (key: keyof typeof privacySettings, value: boolean) => {
        setPrivacySettings(prev => ({ ...prev, [key]: value }));
        localStorage.setItem(key, String(value));
        setMessage({ type: 'success', text: 'Privacy settings saved!' });
        setTimeout(() => setMessage(null), 2000);
    };

    // Delete account
    const handleDeleteAccount = async () => {
        if (deleteConfirmText !== 'DELETE') return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/users/delete', {
                method: 'DELETE',
            });

            if (response.ok) {
                router.push('/api/auth/logout');
            } else {
                const data = await response.json();
                setMessage({ type: 'error', text: data.error || 'Failed to delete account' });
                setShowDeleteConfirm(false);
            }
        } catch (error) {
            setMessage({ type: 'error', text: 'Something went wrong' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <section className="space-y-8 max-w-2xl mx-auto">
            <div className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-neutral-500 dark:text-neutral-400">
                    Settings
                </p>
                <h1 className="mt-3 text-4xl font-semibold tracking-tight text-neutral-950 dark:text-white">
                    Account settings
                </h1>
                <p className="mt-3 max-w-2xl text-base leading-7 text-neutral-600 dark:text-neutral-300">
                    Manage your profile, privacy, and appearance.
                </p>
            </div>

            {message && (
                <div className={`rounded-2xl p-4 ${message.type === 'success'
                    ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
                    : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
                    }`}>
                    {message.text}
                </div>
            )}

            {/* Profile Settings */}
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                <h2 className="text-xl font-semibold text-neutral-950 dark:text-white mb-4">Profile settings</h2>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                        // profile picture upload
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Username
                        </label>
                        <input
                            type="text"
                            value={userData.username}
                            onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value }))}
                            className="w-full px-4 py-2 rounded-xl border border-black/10 bg-white dark:bg-neutral-900 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Email
                        </label>
                        <input
                            type="email"
                            value={userData.email}
                            onChange={(e) => setUserData(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-2 rounded-xl border border-black/10 bg-white dark:bg-neutral-900 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            Current Password
                        </label>
                        <input
                            type="password"
                            value={userData.currentPassword}
                            onChange={(e) => setUserData(prev => ({ ...prev, currentPassword: e.target.value }))}
                            className="w-full px-4 py-2 rounded-xl border border-black/10 bg-white dark:bg-neutral-900 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                            placeholder="Required to change password"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            value={userData.newPassword}
                            onChange={(e) => setUserData(prev => ({ ...prev, newPassword: e.target.value }))}
                            className="w-full px-4 py-2 rounded-xl border border-black/10 bg-white dark:bg-neutral-900 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                            placeholder="Leave blank to keep current"
                        />
                    </div>

                    {userData.newPassword && (
                        <div>
                            <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                value={userData.confirmPassword}
                                onChange={(e) => setUserData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                className="w-full px-4 py-2 rounded-xl border border-black/10 bg-white dark:bg-neutral-900 dark:border-white/10 focus:outline-none focus:ring-2 focus:ring-neutral-500"
                            />
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="px-6 py-2 rounded-full bg-neutral-950 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200 disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : 'Save changes'}
                    </button>
                </form>
            </div>

            {/* Privacy Settings */}
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                <h2 className="text-xl font-semibold text-neutral-950 dark:text-white mb-4">Privacy settings</h2>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-neutral-950 dark:text-white">Liked posts</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Who can see what you liked</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePrivacyChange('likedPublic', true)}
                                className={`px-4 py-1 rounded-full text-sm ${privacySettings.likedPublic
                                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                    }`}
                            >
                                Public
                            </button>
                            <button
                                onClick={() => handlePrivacyChange('likedPublic', false)}
                                className={`px-4 py-1 rounded-full text-sm ${!privacySettings.likedPublic
                                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                    }`}
                            >
                                Private
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-neutral-950 dark:text-white">Saved posts</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Who can see what you saved</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePrivacyChange('savedPublic', true)}
                                className={`px-4 py-1 rounded-full text-sm ${privacySettings.savedPublic
                                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                    }`}
                            >
                                Public
                            </button>
                            <button
                                onClick={() => handlePrivacyChange('savedPublic', false)}
                                className={`px-4 py-1 rounded-full text-sm ${!privacySettings.savedPublic
                                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                    }`}
                            >
                                Private
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="font-medium text-neutral-950 dark:text-white">Messages</p>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">Who can send you messages</p>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePrivacyChange('messagesOpen', true)}
                                className={`px-4 py-1 rounded-full text-sm ${privacySettings.messagesOpen
                                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                    }`}
                            >
                                Open
                            </button>
                            <button
                                onClick={() => handlePrivacyChange('messagesOpen', false)}
                                className={`px-4 py-1 rounded-full text-sm ${!privacySettings.messagesOpen
                                    ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                                    : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                                    }`}
                            >
                                Closed
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Theme Settings */}
            <div className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-neutral-950">
                <h2 className="text-xl font-semibold text-neutral-950 dark:text-white mb-4">Appearance</h2>
                <div className="flex gap-3">
                    <button
                        onClick={() => setTheme('light')}
                        className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${theme === 'light'
                            ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                            }`}
                    >
                        Light
                    </button>
                    <button
                        onClick={() => setTheme('dark')}
                        className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${theme === 'dark'
                            ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                            }`}
                    >
                        Dark
                    </button>
                    <button
                        onClick={() => setTheme('system')}
                        className={`flex-1 px-4 py-2 rounded-xl text-sm font-medium transition-all ${theme === 'system'
                            ? 'bg-neutral-950 text-white dark:bg-white dark:text-neutral-950'
                            : 'bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400'
                            }`}
                    >
                        System
                    </button>
                </div>
                {theme === 'system' && (
                    <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-400">
                        Currently using {theme} mode based on your system preferences.
                    </p>
                )}
            </div>

            {/* Delete Account */}
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 shadow-sm dark:border-red-900/30 dark:bg-red-950/20">
                <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 mb-2">Delete account</h2>
                <p className="text-sm text-red-600 dark:text-red-300 mb-4">
                    Once you delete your account, there is no going back. All your data will be permanently removed.
                </p>

                {!showDeleteConfirm ? (
                    <button
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-6 py-2 rounded-full bg-red-600 text-white hover:bg-red-700"
                    >
                        Delete account
                    </button>
                ) : (
                    <div className="space-y-3">
                        <p className="text-sm text-red-700 dark:text-red-300">
                            Type <strong className="font-bold">DELETE</strong> to confirm:
                        </p>
                        <input
                            type="text"
                            value={deleteConfirmText}
                            onChange={(e) => setDeleteConfirmText(e.target.value)}
                            className="w-full px-4 py-2 rounded-xl border border-red-300 bg-white dark:bg-neutral-900 focus:outline-none focus:ring-2 focus:ring-red-500"
                            placeholder="DELETE"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={handleDeleteAccount}
                                disabled={deleteConfirmText !== 'DELETE' || isLoading}
                                className="px-6 py-2 rounded-full bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Deleting...' : 'Permanently delete'}
                            </button>
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setDeleteConfirmText('');
                                }}
                                className="px-6 py-2 rounded-full border border-black/10 bg-white text-neutral-700 hover:bg-neutral-50 dark:border-white/10 dark:bg-neutral-900 dark:text-neutral-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}