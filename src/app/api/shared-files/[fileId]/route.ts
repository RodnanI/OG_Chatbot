import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
    request: Request,
    { params }: { params: { fileId: string } }
) {
    try {
        const userId = request.headers.get('X-User-Id');
        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const fileId = params.fileId;
        if (!fileId) {
            return NextResponse.json({ error: 'File ID is required' }, { status: 400 });
        }

        // Get metadata to find the file path
        const metadataPath = path.join(process.cwd(), 'data', 'shared-files', userId, 'metadata.json');
        const metadataContent = await fs.readFile(metadataPath, 'utf-8');
        const metadata = JSON.parse(metadataContent);

        const file = metadata.files.find((f: any) => f.id === fileId);
        if (!file) {
            return NextResponse.json({ error: 'File not found' }, { status: 404 });
        }

        // Read the file
        const filePath = path.join(process.cwd(), 'data', 'shared-files', userId, fileId);
        const fileContent = await fs.readFile(filePath);

        // Create response with appropriate headers
        return new Response(fileContent, {
            headers: {
                'Content-Type': file.type || 'application/octet-stream',
                'Content-Disposition': `attachment; filename="${file.name}"`,
            },
        });
    } catch (error) {
        console.error('Error downloading file:', error);
        return NextResponse.json(
            { error: 'Failed to download file' },
            { status: 500 }
        );
    }
}