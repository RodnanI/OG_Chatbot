export async function analyzeImages(files: File[]): Promise<{
    name: string;
    type: string;
    size: number;
    analysis: string;
}[]> {
    const formData = new FormData();
    files.forEach(file => formData.append('file', file));

    const response = await fetch('/api/analyze-image', {
        method: 'POST',
        body: formData
    });

    if (!response.ok) {
        const errorData = await response.json();
        console.error('Image analysis failed:', errorData);
        throw new Error(errorData.details || errorData.error || 'Failed to analyze images');
    }

    const data = await response.json();
    return data.results;
}

export function isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
}

export function validateImageFile(file: File): string | null {
    if (!isImageFile(file)) {
        return 'File is not an image';
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
        return 'Image size exceeds 10MB limit';
    }

    return null;
}