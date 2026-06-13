'use client';

import { useState } from 'react';
import { CreatePostModal } from './CreatePostModal.tsx';

export function FloatingCreateButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    return (
        <>
            {/* Floating Button */}
            <div className="fixed bottom-6 right-6 z-40">
                <button
                    onClick={() => setIsModalOpen(true)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    className="group relative flex items-center justify-center rounded-full bg-neutral-950 text-white shadow-lg transition-all duration-300 hover:bg-neutral-800 dark:bg-white dark:text-neutral-950 dark:hover:bg-neutral-200"
                    style={{
                        width: isHovered ? 'auto' : '56px',
                        height: '56px',
                        paddingLeft: isHovered ? '20px' : '0',
                        paddingRight: isHovered ? '24px' : '0',
                    }}
                >
                    {/* Plus icon */}
                    <svg
                        className="h-6 w-6 flex-shrink-0 transition-transform duration-300 group-hover:rotate-90"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4v16m8-8H4"
                        />
                    </svg>

                    {/* Text that appears on hover */}
                    <span
                        className={`ml-2 whitespace-nowrap text-sm font-medium transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'
                            }`}
                    >
                        Create post
                    </span>
                </button>
            </div>

            {/* Modal */}
            <CreatePostModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </>
    );
}