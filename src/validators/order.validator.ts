import { z } from 'zod';

export const OrderItemSchema = z.object({
    productId: z.number().int(),
    quantity: z.number().int().positive(),
    price: z.number().positive(),
});

export const OrderSchema = z.object({
    items: z.array(OrderItemSchema).min(1, 'Order must contain at least one item'),
    totalPrice: z.number().positive(),
    paymentMethod: z.enum(['CASH', 'CARD']),
    building: z.string().min(1, 'Building is required'),
    roomNumber: z.string().min(1, 'Room number is required'),
});

export const OrderStatusSchema = z.object({
    status: z.enum([
        'PENDING',
        'ACCEPTED',
        'COOKING',
        'ON_THE_WAY',
        'DELIVERED',
        'CANCELED',
    ]),
});

export type OrderInput = z.infer<typeof OrderSchema>;
export type OrderStatusInput = z.infer<typeof OrderStatusSchema>;
