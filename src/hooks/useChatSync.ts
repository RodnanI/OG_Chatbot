// src/hooks/useChatSync.ts
import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

interface ChatData {
    conversations: any[];
    folders: any[];
}

export function useChatSync() {
    const [data, setData] = useState<ChatData>({ conversations: [], folders: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();
    const eventSourceRef = useRef<EventSource | null>(null);
    const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
    const retryCount = useRef(0);

    const setupEventSource = useCallback(() => {
        if (!user) return;

        try {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }

            const eventSource = new EventSource(`/api/sync/stream`, {
                withCredentials: true
            });

            // Add headers to all requests
            const originalOpen = XMLHttpRequest.prototype.open;
            XMLHttpRequest.prototype.open = function(method, url) {
                originalOpen.apply(this, arguments);
                this.setRequestHeader('X-User-Id', user.id);
            };

            eventSource.onmessage = (event) => {
                try {
                    const message = JSON.parse(event.data);

                    switch (message.type) {
                        case 'connected':
                            console.log('SSE Connected');
                            retryCount.current = 0;
                            break;
                        case 'ping':
                            // Keep connection alive
                            break;
                        case 'update':
                            if (message.data) {
                                setData(message.data);
                                setIsLoading(false);
                                setError(null);
                            }
                            break;
                        default:
                            // Handle legacy format
                            if (message.conversations || message.folders) {
                                setData(message);
                                setIsLoading(false);
                                setError(null);
                            }
                    }
                } catch (error) {
                    console.error('Error parsing SSE data:', error);
                }
            };

            eventSource.onerror = () => {
                eventSource.close();
                retryCount.current++;

                // Exponential backoff for reconnection
                const delay = Math.min(1000 * Math.pow(2, retryCount.current), 30000);

                if (reconnectTimeoutRef.current) {
                    clearTimeout(reconnectTimeoutRef.current);
                }

                reconnectTimeoutRef.current = setTimeout(() => {
                    setupEventSource();
                }, delay);
            };

            eventSourceRef.current = eventSource;

            // Initial data fetch
            fetch('/api/sync', {
                headers: {
                    'X-User-Id': user.id
                }
            })
                .then(response => response.json())
                .then(initialData => {
                    setData(initialData);
                    setIsLoading(false);
                })
                .catch(error => {
                    console.error('Error fetching initial data:', error);
                    setError('Failed to fetch initial data');
                });

        } catch (error) {
            console.error('Error setting up EventSource:', error);
            setError('Failed to establish connection');
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            setupEventSource();
        }

        return () => {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
        };
    }, [user, setupEventSource]);

    const saveData = async (newData: ChatData) => {
        if (!user) return;

        try {
            const response = await fetch('/api/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': user.id
                },
                body: JSON.stringify(newData)
            });

            if (!response.ok) throw new Error('Failed to save data');
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to save data');
            console.error('Error saving chat data:', err);
        }
    };

    return {
        data,
        setData: saveData,
        isLoading,
        error
    };
}