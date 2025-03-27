// src/app/api/shared-files/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { notifyClients } from '../sync/stream/route';
import type { SharedFile, SharedFolder } from '@/types/files';

const FILES_DIR = path.join(process.cwd(), 'data', 'shared-files');
const getUserFilesDir = (userId: string) => path.join(FILES_DIR, userId);
const getUserMetadataFile = (userId: string) => path.join(getUserFilesDir(userId), 'metadata.json');

interface FileMetadata {
    files: SharedFile[];
    folders: SharedFolder[];
}

// Ensure the user's files directory exists
async function ensureFilesDir(userId: string) {
    const userDir = getUserFilesDir(userId);
    try {
        await fs.access(userDir);
    } catch {
        await fs.mkdir(userDir, { recursive: true });
        await fs.writeFile(getUserMetadataFile(userId), JSON.stringify({ files: [], folders: [] }));
    }
}

async function getMetadata(userId: string): Promise<FileMetadata> {
    try {
        const data = await fs.readFile(getUserMetadataFile(userId), 'utf-8');
        return JSON.parse(data);
    } catch {
        return { files: [], folders: [] };
    }
}

async function saveMetadata(userId: string, metadata: FileMetadata) {
    await fs.writeFile(getUserMetadataFile(userId), JSON.stringify(metadata, null, 2));
}

export async function GET(request: Request) {
    try {
        const userId = request.headers.get('X-User-Id');
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await ensureFilesDir(userId);
        const metadata = await getMetadata(userId);
        return NextResponse.json(metadata);
    } catch (error) {
        console.error('Error reading file metadata:', error);
        return NextResponse.json(
            { error: 'Failed to read file metadata' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const userId = request.headers.get('X-User-Id');
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        await ensureFilesDir(userId);
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const folderId = formData.get('folderId') as string;
        const uploaderId = formData.get('uploaderId') as string;
        const uploaderName = formData.get('uploaderName') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        const fileId = uuidv4();
        const fileName = file.name;
        const filePath = path.join(getUserFilesDir(userId), fileId);

        // Convert File to Buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Save file
        await fs.writeFile(filePath, buffer);

        // Update metadata
        const metadata = await getMetadata(userId);
        const newFile: SharedFile = {
            id: fileId,
            name: fileName,
            path: filePath,
            size: file.size,
            type: file.type,
            uploaderId,
            uploaderName,
            uploadDate: new Date(),
            folderId: folderId || null
        };

        metadata.files.push(newFile);
        await saveMetadata(userId, metadata);

        // Notify connected clients about the update
        await notifyClients(userId, metadata);

        return NextResponse.json(newFile);
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json(
            { error: 'Failed to upload file' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: Request) {
    try {
        const userId = request.headers.get('X-User-Id');
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { fileId, uploaderId } = await request.json();
        const metadata = await getMetadata(userId);

        const fileIndex = metadata.files.findIndex(f => f.id === fileId);
        if (fileIndex === -1) {
            return NextResponse.json(
                { error: 'File not found' },
                { status: 404 }
            );
        }

        const file = metadata.files[fileIndex];
        if (file.uploaderId !== uploaderId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Delete file
        try {
            await fs.unlink(file.path);
        } catch (error) {
            console.error('Error deleting file:', error);
        }

        // Update metadata
        metadata.files.splice(fileIndex, 1);
        await saveMetadata(userId, metadata);

        // Notify connected clients
        await notifyClients(userId, metadata);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting file:', error);
        return NextResponse.json(
            { error: 'Failed to delete file' },
            { status: 500 }
        );
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};