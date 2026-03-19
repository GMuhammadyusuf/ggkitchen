import { NextResponse, NextRequest } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { OrderService } from '@/services/order.service';
import { OrderStatusSchema } from '@/validators/order.validator';
import prisma from '@/lib/prisma';
import { broadcastOrderUpdate } from '@/lib/sse-broadcaster';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const { id } = await params;
        const body = await req.json();
        const { status } = OrderStatusSchema.parse(body);
        const orderId = parseInt(id);

        // Always resolve role from DB for reliability
        let role: string | undefined;
        const email = session.user?.email;
        console.log('[ORDER STATUS] Session email:', email);
        console.log('[ORDER STATUS] Session role from token:', (session.user as any).role);
        console.log('[ORDER STATUS] Session id from token:', (session.user as any).id);

        if (email) {
            const dbUser = await prisma.user.findUnique({
                where: { email },
                select: { role: true },
            });
            console.log('[ORDER STATUS] DB user lookup result:', dbUser);
            if (dbUser?.role) {
                role = dbUser.role;
            }
        }
        // Fallback to session role
        if (!role) {
            role = (session.user as any).role;
        }

        if (role === 'ADMIN') {
            if (!['PENDING', 'ACCEPTED', 'COOKING', 'CANCELED'].includes(status)) {
                return NextResponse.json({ error: 'Invalid status for ADMIN' }, { status: 400 });
            }
        } else if (role === 'COURIER') {
            if (!['ON_THE_WAY', 'DELIVERED'].includes(status)) {
                return NextResponse.json({ error: 'Invalid status for COURIER' }, { status: 400 });
            }
        } else {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        const updatedOrder = await OrderService.updateStatus(orderId, status);
        // Broadcast to all connected SSE clients
        broadcastOrderUpdate({ orderId, status });
        return NextResponse.json(updatedOrder);
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

