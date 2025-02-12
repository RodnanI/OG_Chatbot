// src/app/api/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { notifyClients } from './stream/route';

const DATA_DIR = path.join(process.cwd(), 'data');

async function ensureDataDir() {
    try {
        await fs.access(DATA_DIR);
    } catch {
        await fs.mkdir(DATA_DIR, { recursive: true });
    }
}

function getUserDataPath(userId: string) {
    return path.join(DATA_DIR, `user_${userId}.json`);
}

async function readUserData(userId: string) {
    try {
        const filePath = getUserDataPath(userId);
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return { conversations: [], folders: [] };
    }
}

async function writeUserData(userId: string, data: any) {
    const filePath = getUserDataPath(userId);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    await notifyClients(userId, data);
}

export async function GET(request: NextRequest) {
    try {
        const userId = request.headers.get('X-User-Id');
        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 401 });
        }

        await ensureDataDir();
        const data = await readUserData(userId);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error reading user data:', error);
        return NextResponse.json(
            { error: 'Failed to read user data' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const userId = request.headers.get('X-User-Id');
        if (!userId) {
            return NextResponse.json({ error: 'User ID required' }, { status: 401 });
        }

        const data = await request.json();
        await ensureDataDir();
        await writeUserData(userId, data);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error saving user data:', error);
        return NextResponse.json(
            { error: 'Failed to save user data' },
            { status: 500 }
        );
    }
}