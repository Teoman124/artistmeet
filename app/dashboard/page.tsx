import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { UserService } from '@/src/services/user.service';
import { PostService } from '@/src/services/post.service';
import { CommentService } from '@/src/services/comment.service';
import { PublicProfile } from '@/app/components/PublicProfile';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
    const cookieStore = await cookies();
    const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

    if (!session) {
        redirect('/login');
    }

    const user = await UserService.getUserByUsername(session.username);

    if (!user) {
        redirect('/login');
    }

    const [posts, comments, likedPosts, savedPosts] = await Promise.all([
        PostService.getPostsByUserId(user.id),
        CommentService.getCommentsByUserId(user.id),
        PostService.getLikedPostsByUserId(user.id),
        PostService.getSavedPostsByUserId(user.id)
    ]);

    return (
        <PublicProfile
            user={user}
            posts={posts}
            comments={comments}
            likedPosts={likedPosts}
            savedPosts={savedPosts}
            isOwnProfile={true}
        />
    );
}