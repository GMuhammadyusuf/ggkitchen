import prisma from '@/lib/prisma';
import { OrderInput } from '@/validators/order.validator';
import { OrderStatus } from '@prisma/client';

export const OrderService = {
    create: async (userId: number, data: OrderInput) => {
        return prisma.order.create({
            data: {
                userId,
                totalPrice: data.totalPrice,
                status: 'PENDING',
                paymentMethod: data.paymentMethod,
                items: {
                    create: data.items.map((item) => ({
                        productId: item.productId,
                        quantity: item.quantity,
                        price: item.price,
                    })),
                },
            },
            include: { items: true },
        });
    },

    getAll: async () => {
        return prisma.order.findMany({
            include: { user: true, items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });
    },

    getByUserId: async (userId: number) => {
        return prisma.order.findMany({
            where: { userId },
            include: { items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });
    },

    getById: async (id: number) => {
        return prisma.order.findUnique({
            where: { id },
            include: { user: true, items: { include: { product: true } } },
        });
    },

    updateStatus: async (id: number, status: OrderStatus) => {
        return prisma.order.update({
            where: { id },
            data: { status },
        });
    },

    getForCourier: async () => {
        return prisma.order.findMany({
            where: {
                status: { in: ['ACCEPTED', 'COOKING', 'ON_THE_WAY'] },
            },
            include: { user: true, items: { include: { product: true } } },
            orderBy: { createdAt: 'desc' },
        });
    },
};
