'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface AvatarUploadProps {
    userId: number;
    currentAvatarUrl?: string | null;
    username: string;
}

export default function AvatarUpload({
    userId,
    currentAvatarUrl,
    username
}: AvatarUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    // Bepaal de juiste avatar URL: eerst checken of er een custom avatar is, anders de default Zappa foto
    const [avatarUrl, setAvatarUrl] = useState(() => {
        if (currentAvatarUrl) {
            return currentAvatarUrl;
        }
        return '/zapppppaaaaa.jpg';
    });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setError(null);
        setIsUploading(true);

        const formData = new FormData();
        formData.append('avatar', file);

        try {
            const response = await fetch('/api/users/avatar', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Upload failed');
            }

            const data = await response.json();
            setAvatarUrl(data.avatarUrl + '?t=' + Date.now());
            router.refresh();

            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    const handleRemoveAvatar = async () => {
        if (!confirm('Are you sure you want to remove your profile picture?')) return;

        setIsUploading(true);
        try {
            const response = await fetch('/api/users/avatar', {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to remove avatar');
            }

            // Terug naar default Zappa foto
            setAvatarUrl('/zapppppaaaaa.jpg');
            router.refresh();
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="relative group">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border border-black/10 bg-neutral-100 shadow-sm dark:border-white/10 dark:bg-white/5">
                <img
                    src={avatarUrl}
                    alt={`${username}'s avatar`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                        // Als de afbeelding niet laadt, gebruik de Zappa foto
                        (e.target as HTMLImageElement).src = '/zapppppaaaaa.jpg';
                    }}
                />

                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isUploading}
                        className="rounded-full bg-white/90 p-2 text-black transition hover:bg-white disabled:opacity-50"
                        title="Change profile picture"
                    >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>

                    {currentAvatarUrl && (
                        <button
                            onClick={handleRemoveAvatar}
                            disabled={isUploading}
                            className="rounded-full bg-red-500/90 p-2 text-white transition hover:bg-red-600 disabled:opacity-50"
                            title="Remove profile picture"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleFileSelect}
                className="hidden"
            />

            {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-transparent"></div>
                </div>
            )}

            {error && (
                <div className="absolute mt-2 w-48 rounded-lg bg-red-100 px-3 py-2 text-xs text-red-700 dark:bg-red-900/20 dark:text-red-400">
                    {error}
                </div>
            )}
        </div>
    );
}