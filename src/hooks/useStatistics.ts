// src/hooks/useStatistics.ts
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import type { UserStatistics } from '@/types/statistics';

export function useStatistics() {
    const [statistics, setStatistics] = useState<UserStatistics | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        if (!user) return;

        const fetchStatistics = async () => {
            try {
                const response = await fetch('/api/statistics', {
                    headers: {
                        'X-User-Id': user.id
                    }
                });

                if (!response.ok) throw new Error('Failed to fetch statistics');

                const data = await response.json();
                setStatistics(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to fetch statistics');
                console.error('Error fetching statistics:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStatistics();
    }, [user]);

    const updateStatistics = async (newStats: UserStatistics) => {
        if (!user) return;

        try {
            const response = await fetch('/api/statistics', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': user.id
                },
                body: JSON.stringify(newStats)
            });

            if (!response.ok) throw new Error('Failed to update statistics');

            setStatistics(newStats);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update statistics');
            console.error('Error updating statistics:', err);
        }
    };

    return {
        statistics,
        setStatistics: updateStatistics,
        isLoading,
        error
    };
}