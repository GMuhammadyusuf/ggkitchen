import prisma from '@/lib/prisma';
import { CategoryInput } from '@/validators/category.validator';

export const CategoryService = {
    getAll: async () => {
        return prisma.category.findMany({
            include: { products: true },
        });
    },

    create: async (data: CategoryInput) => {
        return prisma.category.create({
            data: {
                name: data.name,
            },
        });
    },

    update: async (id: number, data: CategoryInput) => {
        return prisma.category.update({
            where: { id },
            data: {
                name: data.name,
            },
        });
    },

    delete: async (id: number) => {
        return prisma.category.delete({
            where: { id },
        });
    },
};
