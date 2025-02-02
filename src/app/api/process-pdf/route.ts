import { NextResponse } from 'next/server';
import * as pdfjsLib from 'pdfjs-dist';

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file = data.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

        let fullText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            fullText += pageText + '\n';
        }

        return NextResponse.json({
            text: fullText,
            pages: pdf.numPages
        });

    } catch (error) {
        console.error('Error processing PDF:', error);
        return NextResponse.json(
            { error: 'Error processing PDF file' },
            { status: 500 }
        );
    }
}