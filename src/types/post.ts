export type PostFeedItem = {
    id: number;
    title: string;
    description: string;
    username: string;
    createdAt: Date;
    isOwnPost?: boolean;
    isLiked?: boolean;
    isSaved?: boolean;
};