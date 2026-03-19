import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const UserService = {
    getAll: async () => {
        return prisma.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    },

    getById: async (id: number) => {
        return prisma.user.findUnique({
            where: { id },
            include: { deliveryLocation: true },
        });
    },

    create: async (data: { name: string; email: string; password: string; role: string }) => {
        const hashedPassword = await bcrypt.hash(data.password, 12);
        return prisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role as any,
            },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
    },

    update: async (id: number, data: { name?: string; email?: string; role?: string; password?: string }) => {
        const updateData: any = {};
        if (data.name) updateData.name = data.name;
        if (data.email) updateData.email = data.email;
        if (data.role) updateData.role = data.role as any;
        if (data.password) updateData.password = await bcrypt.hash(data.password, 12);

        return prisma.user.update({
            where: { id },
            data: updateData,
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
    },

    delete: async (id: number) => {
        return prisma.user.delete({ where: { id } });
    },
};
