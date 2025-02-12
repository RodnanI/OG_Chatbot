import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import sharp from 'sharp';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const TARGET_SIZE = 1024; // Resize large images to 1024px on the longest side

async function processImage(file: File) {
    try {
        const buffer = await file.arrayBuffer();
        const imageBuffer = Buffer.from(buffer);

        // Process image with Sharp
        const image = sharp(imageBuffer);
        const metadata = await image.metadata();

        // Resize if necessary
        if (metadata.width && metadata.height) {
            const maxDimension = Math.max(metadata.width, metadata.height);
            if (maxDimension > TARGET_SIZE) {
                const resizeOptions = metadata.width > metadata.height
                    ? { width: TARGET_SIZE }
                    : { height: TARGET_SIZE };
                image.resize(resizeOptions);
            }
        }

        // Convert to JPEG and optimize
        const processedBuffer = await image
            .jpeg({ quality: 80 })
            .toBuffer();

        // Convert to base64
        const base64Image = processedBuffer.toString('base64');

        // Analyze with OpenAI
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: "Describe this image in detail. Include any relevant text, objects, people, or notable elements. Be thorough but concise."
                        },
                        {
                            type: "image_url",
                            image_url: {
                                url: `data:image/jpeg;base64,${base64Image}`,
                                detail: "auto"
                            }
                        }
                    ]
                }
            ],
            max_tokens: 500
        });

        return response.choices[0].message.content;
    } catch (error) {
        console.error('Error processing image:', error);
        throw error;
    }
}

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const files = data.getAll('file') as File[];

        if (!files || files.length === 0) {
            return NextResponse.json(
                { error: 'No files provided' },
                { status: 400 }
            );
        }

        // Validate file sizes and types
        for (const file of files) {
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { error: `File ${file.name} exceeds maximum size of 10MB` },
                    { status: 400 }
                );
            }

            if (!file.type.startsWith('image/')) {
                return NextResponse.json(
                    { error: `File ${file.name} is not an image` },
                    { status: 400 }
                );
            }
        }

        // Process all images
        const results = await Promise.all(
            files.map(async (file) => {
                const analysis = await processImage(file);
                return {
                    name: file.name,
                    type: file.type,
                    size: file.size,
                    analysis
                };
            })
        );

        return NextResponse.json({
            message: 'Images analyzed successfully',
            results
        });

    } catch (error) {
        console.error('Error handling image analysis:', error);
        // Log more details about the error
        if (error instanceof Error) {
            console.error('Error stack:', error.stack);
            console.error('Error message:', error.message);
        }
        return NextResponse.json(
            {
                error: 'Error processing images',
                details: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined
            },
            { status: 500 }
        );
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};