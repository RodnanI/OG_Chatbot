import { NextResponse } from 'next/server';
import { extractRawText } from 'docx-preview';
import { Readable } from 'stream';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file received' },
                { status: 400 }
            );
        }

        let fileContent = '';

        // Create a readable stream from the file
        const buffer = await file.arrayBuffer();
        const stream = new Readable();
        stream.push(Buffer.from(buffer));
        stream.push(null);

        if (file.name.endsWith('.docx')) {
            // Extract text from docx
            fileContent = await extractRawText({ buffer });
        } else {
            // For other file types, read as text
            fileContent = await file.text();
        }

        return NextResponse.json({
            message: 'File received',
            filename: file.name,
            content: fileContent,
            size: file.size,
            type: file.type
        });

    } catch (error) {
        console.error('Error handling file upload:', error);
        return NextResponse.json(
            { error: 'Error processing file: ' + error.message },
            { status: 500 }
        );
    }
}

export const config = {
    api: {
        bodyParser: false,
        responseLimit: false,
    },
};