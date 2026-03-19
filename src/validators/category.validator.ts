import { z } from 'zod';

export const CategorySchema = z.object({
    name: z.string().min(2, 'Category name must be at least 2 characters'),
});

export type CategoryInput = z.infer<typeof CategorySchema>;
