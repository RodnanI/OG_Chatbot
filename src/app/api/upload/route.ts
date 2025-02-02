import { NextResponse } from 'next/server';
import { extractRawText } from 'docx-preview';

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

        if (file.name.endsWith('.docx')) {
            // Convert file to ArrayBuffer
            const arrayBuffer = await file.arrayBuffer();
            // Extract text from docx
            fileContent = await extractRawText({ buffer: arrayBuffer });
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
    },
};