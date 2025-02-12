// src/app/api/statistics/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { UserStatistics } from '@/types/statistics';

const STATS_DIR = path.join(process.cwd(), 'data', 'statistics');

async function ensureStatsDir() {
    try {
        await fs.access(STATS_DIR);
    } catch {
        await fs.mkdir(STATS_DIR, { recursive: true });
    }
}

function getUserStatsPath(userId: string) {
    return path.join(STATS_DIR, `user_${userId}_stats.json`);
}

async function readUserStats(userId: string): Promise<UserStatistics> {
    try {
        const filePath = getUserStatsPath(userId);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch {
        // Return default statistics if none exist
        return {
            daily: { tokens: 0, messages: 0, conversations: 0, avgResponseTime: 0 },
            weekly: { tokens: 0, messages: 0, conversations: 0, avgResponseTime: 0 },
            monthly: { tokens: 0, messages: 0, conversations: 0, avgResponseTime: 0 },
            yearly: { tokens: 0, messages: 0, conversations: 0, avgResponseTime: 0 },
            allTime: { tokens: 0, messages: 0, conversations: 0, avgResponseTime: 0 },
            timeSeriesData: []
        };
    }
}

export async function GET(request: Request) {
    try {
        const userId = request.headers.get('X-User-Id');
        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 401 });
        }

        await ensureStatsDir();
        const stats = await readUserStats(userId);
        return NextResponse.json(stats);
    } catch (error) {
        console.error('Error reading user statistics:', error);
        return NextResponse.json(
            { error: 'Failed to read user statistics' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const userId = request.headers.get('X-User-Id');
        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 401 });
        }

        const stats: UserStatistics = await request.json();
        await ensureStatsDir();

        const filePath = getUserStatsPath(userId);
        await fs.writeFile(filePath, JSON.stringify(stats, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving user statistics:', error);
        return NextResponse.json(
            { error: 'Failed to save user statistics' },
            { status: 500 }
        );
    }
}