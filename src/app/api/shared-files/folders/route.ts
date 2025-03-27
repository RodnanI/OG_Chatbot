import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { notifyClients } from '../../sync/stream/route';
import type { SharedFolder } from '@/types/files';

const FILES_DIR = path.join(process.cwd(), 'data', 'shared-files');
const getUserFilesDir = (userId: string) => path.join(FILES_DIR, userId);
const getUserMetadataFile = (userId: string) => path.join(getUserFilesDir(userId), 'metadata.json');

async function getMetadata(userId: string) {
    try {
        const data = await fs.readFile(getUserMetadataFile(userId), 'utf-8');
        return JSON.parse(data);
    } catch {
        return { files: [], folders: [] };
    }
}

async function saveMetadata(userId: string, metadata: any) {
    await fs.writeFile(getUserMetadataFile(userId), JSON.stringify(metadata, null, 2));
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

        const { name, parentId, createdBy } = await request.json();

        if (!name) {
            return NextResponse.json(
                { error: 'Folder name is required' },
                { status: 400 }
            );
        }

        const metadata = await getMetadata(userId);

        // Check if folder with same name exists in the same parent
        const folderExists = metadata.folders.some(
            (f: SharedFolder) => f.name === name && f.parentId === parentId
        );

        if (folderExists) {
            return NextResponse.json(
                { error: 'Folder with this name already exists' },
                { status: 400 }
            );
        }

        const newFolder: SharedFolder = {
            id: uuidv4(),
            name,
            path: parentId ? `/${parentId}/${name}` : `/${name}`,
            createdBy,
            createdAt: new Date(),
            parentId
        };

        metadata.folders.push(newFolder);
        await saveMetadata(userId, metadata);

        // Notify connected clients
        await notifyClients(userId, metadata);

        return NextResponse.json(newFolder);
    } catch (error) {
        console.error('Error creating folder:', error);
        return NextResponse.json(
            { error: 'Failed to create folder' },
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

        const { folderId, createdBy } = await request.json();
        const metadata = await getMetadata(userId);

        const folderIndex = metadata.folders.findIndex((f: SharedFolder) => f.id === folderId);
        if (folderIndex === -1) {
            return NextResponse.json(
                { error: 'Folder not found' },
                { status: 404 }
            );
        }

        const folder = metadata.folders[folderIndex];
        if (folder.createdBy !== createdBy) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 403 }
            );
        }

        // Remove folder and all files in it
        metadata.folders.splice(folderIndex, 1);
        metadata.files = metadata.files.filter((f: any) => f.folderId !== folderId);

        await saveMetadata(userId, metadata);

        // Notify connected clients
        await notifyClients(userId, metadata);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting folder:', error);
        return NextResponse.json(
            { error: 'Failed to delete folder' },
            { status: 500 }
        );
    }
}