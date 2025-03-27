// /mnt/data/api/requests/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const REQUESTS_DIR = path.join(process.cwd(), 'data', 'requests');

// Ensure the directory exists
async function ensureRequestsDir() {
    try {
        await fs.access(REQUESTS_DIR);
    } catch {
        await fs.mkdir(REQUESTS_DIR, { recursive: true });
    }
}

// Use a single JSON file to store all requests (for simplicity)
const REQUESTS_FILE = path.join(REQUESTS_DIR, 'requests.json');

async function readRequests() {
    try {
        const data = await fs.readFile(REQUESTS_FILE, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function writeRequests(requests: any[]) {
    await fs.writeFile(REQUESTS_FILE, JSON.stringify(requests, null, 2));
}

export async function GET() {
    await ensureRequestsDir();
    const requests = await readRequests();
    return NextResponse.json(requests);
}

export async function POST(request: Request) {
    await ensureRequestsDir();
    const body = await request.json();
    const newRequest = {
        id: Date.now().toString(),
        title: body.title,
        description: body.description,
        type: body.type, // "bug" or "feature"
        status: "Pending",
        submittedAt: new Date().toISOString()
    };
    const requests = await readRequests();
    requests.push(newRequest);
    await writeRequests(requests);
    return NextResponse.json(newRequest, { status: 201 });
}

export async function PUT(request: Request) {
    await ensureRequestsDir();
    const body = await request.json();
    const { id, status } = body;
    const requests = await readRequests();
    const index = requests.findIndex(req => req.id === id);
    if (index === -1) {
        return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }
    requests[index].status = status; // update status to e.g. "Work in Progress" or "Resolved"
    await writeRequests(requests);
    return NextResponse.json(requests[index]);
}
