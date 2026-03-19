import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Connects to the SSE endpoint and auto-invalidates the 'orders' query
 * whenever an order status changes, triggering a background refetch.
 */
export function useOrderSSE() {
    const queryClient = useQueryClient();

    useEffect(() => {
        const es = new EventSource('/api/orders/sse');

        es.addEventListener('order-status', (e: MessageEvent) => {
            // Invalidate orders so all queries refetch
            queryClient.invalidateQueries({ queryKey: ['orders'] });
        });

        es.onerror = () => {
            // Browser will auto-reconnect; nothing to do here
        };

        return () => {
            es.close();
        };
    }, [queryClient]);
}
