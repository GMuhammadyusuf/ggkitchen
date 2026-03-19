import { z } from 'zod';

export const ProductSchema = z.object({
    name: z.string().min(2, 'Product name must be at least 2 characters'),
    description: z.string().optional(),
    price: z.number().positive('Price must be positive'),
    image: z.string().optional(),
    categoryId: z.number().int('Category ID must be an integer'),
});

export type ProductInput = z.infer<typeof ProductSchema>;
