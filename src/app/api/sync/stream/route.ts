// src/app/api/sync/stream/route.ts
import { NextRequest } from 'next/server';

const clients = new Map<string, Set<(data: any) => void>>();

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function GET(request: NextRequest) {
    const userId = request.headers.get('X-User-Id');
    if (!userId) {
        return new Response('Unauthorized', { status: 401 });
    }

    let shouldClose = false;
    request.signal.addEventListener('abort', () => {
        shouldClose = true;
    });

    const transformer = new TransformStream({
        async start(controller) {
            // Keep track of this client
            if (!clients.has(userId)) {
                clients.set(userId, new Set());
            }

            const userClients = clients.get(userId);
            const sendData = async (data: any) => {
                const eventString = `data: ${JSON.stringify(data)}\n\n`;
                controller.enqueue(new TextEncoder().encode(eventString));
            };
            userClients?.add(sendData);

            // Cleanup when connection closes
            request.signal.addEventListener('abort', () => {
                const userClients = clients.get(userId);
                if (userClients) {
                    userClients.delete(sendData);
                    if (userClients.size === 0) {
                        clients.delete(userId);
                    }
                }
            });

            // Send initial connection message
            await sendData({ type: 'connected' });

            // Keep connection alive with periodic pings
            while (!shouldClose) {
                await sleep(30000); // Send ping every 30 seconds
                if (!shouldClose) {
                    try {
                        await sendData({ type: 'ping' });
                    } catch (error) {
                        break;
                    }
                }
            }
        }
    });

    return new Response(transformer.readable, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}

// Function to notify all clients of a user about updates
export async function notifyClients(userId: string, data: any) {
    const userClients = clients.get(userId);
    if (userClients) {
        const failures: Function[] = [];
        for (const sendData of userClients) {
            try {
                await sendData({
                    type: 'update',
                    data
                });
            } catch (error) {
                failures.push(sendData);
            }
        }

        // Remove failed connections
        failures.forEach(sendData => userClients.delete(sendData));
        if (userClients.size === 0) {
            clients.delete(userId);
        }
    }
}