import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { OrderService } from '@/services/order.service';
import { OrderSchema } from '@/validators/order.validator';

export async function GET() {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const userId = parseInt((session.user as any).id);
        const role = (session.user as any).role;

        if (role === 'ADMIN') {
            const orders = await OrderService.getAll();
            return NextResponse.json(orders);
        } else if (role === 'COURIER') {
            const orders = await OrderService.getForCourier();
            return NextResponse.json(orders);
        } else {
            const orders = await OrderService.getByUserId(userId);
            return NextResponse.json(orders);
        }
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const body = await req.json();
        const validatedData = OrderSchema.parse(body);
        const order = await OrderService.create(parseInt((session.user as any).id), validatedData);
        return NextResponse.json(order, { status: 201 });
    } catch (error: any) {
        if (error.name === 'ZodError') {
            return NextResponse.json({ error: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
