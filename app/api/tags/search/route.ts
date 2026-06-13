import { NextRequest, NextResponse } from 'next/server';
import { TagService } from '@/src/services/tag.service';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const query = searchParams.get('q');

        if (!query) {
            return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
        }

        const posts = await TagService.searchByTags(query);
        return NextResponse.json(posts, { status: 200 });
    } catch (error) {
        console.error('Failed to search tags:', error);
        return NextResponse.json({ error: 'Failed to search tags' }, { status: 500 });
    }
}