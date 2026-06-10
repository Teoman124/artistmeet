import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { verifySessionToken, SESSION_COOKIE_NAME } from '@/src/lib/auth';
import { UserService } from '@/src/services/user.service';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { existsSync } from 'fs';

export async function POST(request: NextRequest) {
    try {
        // Verify authentication
        const cookieStore = await cookies();
        const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Get user
        const user = await UserService.getUserByUsername(session.username);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const formData = await request.formData();
        const file = formData.get('avatar') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Use JPEG, PNG, or WEBP' }, { status: 400 });
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json({ error: 'File too large. Max 5MB' }, { status: 400 });
        }

        // Create unique filename
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const ext = file.type.split('/')[1];
        const filename = `${user.id}_${Date.now()}.${ext}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'avatars');
        const filepath = path.join(uploadDir, filename);

        // Ensure directory exists
        if (!existsSync(uploadDir)) {
            await mkdir(uploadDir, { recursive: true });
        }

        // Save file
        await writeFile(filepath, buffer);

        // Update user in database with avatar path
        const avatarUrl = `/uploads/avatars/${filename}`;
        await UserService.updateUserAvatar(user.id, avatarUrl);

        return NextResponse.json({
            success: true,
            avatarUrl: avatarUrl
        }, { status: 200 });

    } catch (error) {
        console.error('Avatar upload failed:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const session = verifySessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);

        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await UserService.getUserByUsername(session.username);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Remove avatar from user record
        await UserService.updateUserAvatar(user.id, null);

        return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error('Avatar removal failed:', error);
        return NextResponse.json({ error: 'Failed to remove avatar' }, { status: 500 });
    }
}