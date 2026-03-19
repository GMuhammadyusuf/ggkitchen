/**
 * SSE Broadcaster — holds all active SSE connections and broadcasts events to them.
 * This is a module-level singleton that persists across requests in the same server process.
 */

type SSEController = ReadableStreamDefaultController<Uint8Array>;

const clients = new Set<SSEController>();

export function addSSEClient(controller: SSEController) {
    clients.add(controller);
}

export function removeSSEClient(controller: SSEController) {
    clients.delete(controller);
}

export function broadcastOrderUpdate(payload: { orderId: number; status: string }) {
    const data = `data: ${JSON.stringify(payload)}\n\n`;
    const encoded = new TextEncoder().encode(data);
    for (const controller of clients) {
        try {
            controller.enqueue(encoded);
        } catch {
            // Client disconnected — remove it
            clients.delete(controller);
        }
    }
}
