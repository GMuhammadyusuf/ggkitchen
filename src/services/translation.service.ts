import prisma from '@/lib/prisma';
import { TranslationInput, TranslationUpdateInput } from '@/validators/translation.validator';

export const TranslationService = {
    getAll: async () => {
        return prisma.translation.findMany({
            orderBy: { key: 'asc' },
        });
    },

    create: async (data: TranslationInput) => {
        return prisma.translation.create({
            data: {
                key: data.key,
                en: data.en,
                uz: data.uz,
            },
        });
    },

    update: async (id: number, data: TranslationUpdateInput) => {
        return prisma.translation.update({
            where: { id },
            data: {
                en: data.en,
                uz: data.uz,
            },
        });
    },

    delete: async (id: number) => {
        return prisma.translation.delete({
            where: { id },
        });
    },
};
