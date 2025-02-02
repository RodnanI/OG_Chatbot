import { NextResponse } from 'next/server';
import { exec } from 'child_process';
import { writeFile } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { code, language } = await request.json();

        if (language !== 'python') {
            return NextResponse.json({ error: 'Unsupported language' }, { status: 400 });
        }

        // Create a temporary file with unique name
        const fileName = `temp_${uuidv4()}.py`;
        const filePath = path.join('/tmp', fileName);

        await writeFile(filePath, code);

        return new Promise((resolve) => {
            exec(`python3 ${filePath}`, { timeout: 5000 }, (error, stdout, stderr) => {
                // Clean up the temp file
                exec(`rm ${filePath}`);

                if (error) {
                    resolve(NextResponse.json({
                        error: true,
                        output: stderr
                    }));
                    return;
                }

                resolve(NextResponse.json({
                    error: false,
                    output: stdout
                }));
            });
        });

    } catch (error) {
        return NextResponse.json({
            error: true,
            output: 'Error executing code'
        }, {
            status: 500
        });
    }
}