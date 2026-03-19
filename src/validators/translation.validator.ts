import { z } from 'zod';

export const TranslationSchema = z.object({
    key: z.string().min(1, 'Key is required'),
    en: z.string().min(1, 'English value is required'),
    uz: z.string().min(1, 'Uzbek value is required'),
});

export const TranslationUpdateSchema = z.object({
    en: z.string().min(1, 'English value is required'),
    uz: z.string().min(1, 'Uzbek value is required'),
});

export type TranslationInput = z.infer<typeof TranslationSchema>;
export type TranslationUpdateInput = z.infer<typeof TranslationUpdateSchema>;
