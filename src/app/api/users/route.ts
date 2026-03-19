import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { UserService } from '@/services/user.service';
import prisma from '@/lib/prisma';

async function isAdmin(session: any): Promise<boolean> {
    const email = session?.user?.email;
    if (!email) return false;
    const user = await prisma.user.findUnique({ where: { email }, select: { role: true } });
    return user?.role === 'ADMIN';
}

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!(await isAdmin(session))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const users = await UserService.getAll();
        return NextResponse.json(users);
    } catch (error) {
        console.error('Users GET error:', error);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!(await isAdmin(session))) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const { name, email, password, role } = body;

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'All fields required' }, { status: 400 });
        }

        const user = await UserService.create({ name, email, password, role });
        return NextResponse.json(user, { status: 201 });
    } catch (error: any) {
        if (error.code === 'P2002') {
            return NextResponse.json({ error: 'Email already exists' }, { status: 409 });
        }
        console.error('Users POST error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
