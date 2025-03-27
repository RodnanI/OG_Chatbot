// src/app/api/shared-files/move/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const FILES_DIR = path.join(process.cwd(), 'data', 'shared-files');
const getUserMetadataFile = (userId: string) => path.join(FILES_DIR, userId, 'metadata.json');

export async function POST(request: Request) {
    try {
        const userId = request.headers.get('X-User-Id');
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const { itemId, itemType, targetFolderId } = await request.json();

        // Read current metadata
        const metadataPath = getUserMetadataFile(userId);
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(metadataContent);

        // Update item's parent folder
        if (itemType === 'file') {
            const fileIndex = metadata.files.findIndex((f: any) => f.id === itemId);
            if (fileIndex !== -1) {
                metadata.files[fileIndex].folderId = targetFolderId;
            }
        } else if (itemType === 'folder') {
            const folderIndex = metadata.folders.findIndex((f: any) => f.id === itemId);
            if (folderIndex !== -1) {
                // Check for circular dependencies
                if (itemId === targetFolderId) {
                    return NextResponse.json(
                        { error: 'Cannot move folder into itself' },
                        { status: 400 }
                    );
                }
                metadata.folders[folderIndex].parentId = targetFolderId;
            }
        }

        // Save updated metadata
        await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error moving item:', error);
        return NextResponse.json(
            { error: 'Failed to move item' },
            { status: 500 }
        );
    }
}