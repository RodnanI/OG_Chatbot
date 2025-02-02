'use client';
import katex from 'katex';
import { useEffect, useRef } from 'react';

interface LatexRendererProps {
    content: string;
    displayMode?: boolean;
}

export default function LatexRenderer({ content, displayMode = true }: LatexRendererProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (containerRef.current) {
            try {
                katex.render(content, containerRef.current, {
                    displayMode,
                    throwOnError: false
                });
            } catch (error) {
                console.error('LaTeX rendering error:', error);
                // Fallback to raw content if rendering fails
                if (containerRef.current) {
                    containerRef.current.textContent = content;
                }
            }
        }
    }, [content, displayMode]);

    return (
        <div
            ref={containerRef}
            className={displayMode ? 'my-4' : 'inline-block'}
        />
    );
}