import prisma from '@/lib/prisma';
import { ProductInput } from '@/validators/product.validator';

export const ProductService = {
    getAll: async () => {
        return prisma.product.findMany({
            include: { category: true },
        });
    },

    getById: async (id: number) => {
        return prisma.product.findUnique({
            where: { id },
            include: { category: true },
        });
    },

    create: async (data: ProductInput) => {
        return prisma.product.create({
            data: {
                name: data.name,
                description: data.description,
                price: data.price,
                image: data.image,
                categoryId: data.categoryId,
            },
        });
    },

    update: async (id: number, data: Partial<ProductInput>) => {
        return prisma.product.update({
            where: { id },
            data,
        });
    },

    delete: async (id: number) => {
        return prisma.product.delete({
            where: { id },
        });
    },
};
