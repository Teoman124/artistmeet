import { SESSION_COOKIE_NAME, verifySessionToken } from '@/src/lib/auth';
import { PostService } from '@/src/services/post.service';
import { NextRequest, NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{ postId: string }>;
};

export async function POST(request: NextRequest, context: RouteContext) {
  const cookie = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = verifySessionToken(cookie);

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { postId } = await context.params;
  const parsedPostId = Number(postId);

  if (!Number.isInteger(parsedPostId)) {
    return NextResponse.json({ error: 'Invalid post id' }, { status: 400 });
  }

  try {
    const result = await PostService.toggleLike(parsedPostId, session.userId);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to update like';
    const status = message === 'Post not found' ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}