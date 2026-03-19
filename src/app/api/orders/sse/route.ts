import { addSSEClient, removeSSEClient } from '@/lib/sse-broadcaster';

export async function GET() {
    const encoder = new TextEncoder();

    const stream = new ReadableStream<Uint8Array>({
        start(controller) {
            // Send initial heartbeat
            controller.enqueue(encoder.encode(': connected\n\n'));

            // Register this client
            addSSEClient(controller);

            // Heartbeat every 25s to keep the connection alive
            const heartbeat = setInterval(() => {
                try {
                    controller.enqueue(encoder.encode(': ping\n\n'));
                } catch {
                    clearInterval(heartbeat);
                }
            }, 25000);

            // Cleanup on close
            (controller as any)._heartbeat = heartbeat;
        },
        cancel(controller) {
            clearInterval((controller as any)._heartbeat);
            removeSSEClient(controller as ReadableStreamDefaultController<Uint8Array>);
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
