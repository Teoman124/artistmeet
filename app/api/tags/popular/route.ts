import { NextResponse } from 'next/server';
import { TagService } from '@/src/services/tag.service';

export async function GET() {
    try {
        const tags = await TagService.getPopularTags(15);
        return NextResponse.json(tags, { status: 200 });
    } catch (error) {
        console.error('Failed to get popular tags:', error);
        return NextResponse.json({ error: 'Failed to get tags' }, { status: 500 });
    }
}