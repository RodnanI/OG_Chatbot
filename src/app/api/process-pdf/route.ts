import { NextResponse } from 'next/server';
import { getDocument } from 'pdfjs-dist/legacy/build/pdf';
import { PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api';
import { Readable } from 'stream';

// Disable worker to avoid issues
if (typeof window === 'undefined') {
    const { GlobalWorkerOptions } = require('pdfjs-dist/legacy/build/pdf');
    GlobalWorkerOptions.workerSrc = false;
}

async function getPageText(page: any) {
    const textContent = await page.getTextContent();
    return textContent.items
        .map((item: any) => item.str)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
}

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file = data.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        if (file.type !== 'application/pdf') {
            return NextResponse.json(
                { error: 'File must be a PDF' },
                { status: 400 }
            );
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdfData = new Uint8Array(arrayBuffer);

        try {
            const pdfDocument = await getDocument({
                data: pdfData,
                useSystemFonts: true,
                disableFontFace: true,
            }).promise;

            let fullText = '';
            const totalPages = pdfDocument.numPages;

            for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
                const page = await pdfDocument.getPage(pageNum);
                const pageText = await getPageText(page);
                fullText += `Page ${pageNum}:\n${pageText}\n\n`;
            }

            return NextResponse.json({
                text: fullText,
                pages: pdfDocument.numPages,
                filename: file.name,
                filesize: file.size,
            });

        } catch (pdfError) {
            console.error('PDF processing error:', pdfError);
            return NextResponse.json(
                {
                    error: 'Failed to process PDF content',
                    details: pdfError instanceof Error ? pdfError.message : 'Unknown PDF processing error'
                },
                { status: 500 }
            );
        }

    } catch (error) {
        console.error('Request handling error:', error);
        return NextResponse.json(
            {
                error: 'Error processing request',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export const config = {
    api: {
        bodyParser: false,
        responseLimit: false
    },
};