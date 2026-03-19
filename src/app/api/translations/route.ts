import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { TranslationService } from '@/services/translation.service';
import { TranslationSchema } from '@/validators/translation.validator';

export async function GET() {
    try {
        const translations = await TranslationService.getAll();
        return NextResponse.json(translations);
    } catch (error) {
        console.error('Translation GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch translations' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const validatedData = TranslationSchema.parse(body);
        const translation = await TranslationService.create(validatedData);
        return NextResponse.json(translation, { status: 201 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Translation key already exists' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
