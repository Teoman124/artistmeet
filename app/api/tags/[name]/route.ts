import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { TagService } from '@/src/services/tag.service';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ name: string }> }
) {
    try {
        const cookieStore = await cookies();
        const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

        const { name } = await params;
        const posts = await TagService.getPostsByTag(name, session?.userId);

        return NextResponse.json(posts, { status: 200 });
    } catch (error) {
        console.error('Failed to get posts by tag:', error);
        return NextResponse.json({ error: 'Failed to get posts' }, { status: 500 });
    }
}