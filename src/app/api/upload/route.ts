import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { put } from '@vercel/blob';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File;

        console.log('UPLOAD ATTEMPT:', {
            name: file?.name,
            size: file?.size,
            type: file?.type,
            token_exists: !!process.env.BLOB_READ_WRITE_TOKEN
        });

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            return NextResponse.json({ error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' }, { status: 400 });
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large. Max size: 5MB' }, { status: 400 });
        }

        // Generate unique filename
        const ext = file.name.split('.').pop() || 'jpg';
        const filename = `products/product_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;

        // Upload to Vercel Blob
        const blob = await put(filename, file, {
            access: 'public',
            token: process.env.BLOB_READ_WRITE_TOKEN,
            contentType: file.type,
        });

        return NextResponse.json({ url: blob.url, filename: blob.pathname });
    } catch (error: any) {
        console.error('SERVER-SIDE UPLOAD ERROR:', error);
        
        const token = process.env.BLOB_READ_WRITE_TOKEN;
        const tokenInfo = token 
            ? `Present (length: ${token.length}, starts with ${token.substring(0, 10)}...)` 
            : 'MISSING';

        return NextResponse.json({ 
            error: 'Vercel Blob Upload Failed', 
            details: error.message || 'Unknown error',
            token_status: tokenInfo,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }, { status: 500 });
    }
}
