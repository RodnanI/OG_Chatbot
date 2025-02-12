'use client';

import { useState } from 'react';
import { FileText, ChevronDown, ChevronUp } from 'lucide-react';

interface FileInfo {
    name: string;
    type: string;
    size: number;
    content?: string;
}

interface FilePreviewInChatProps {
    files: FileInfo[];
}

export default function FilePreviewInChat({ files }: FilePreviewInChatProps) {
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    return (
        <div className="space-y-2 mb-4">
            {files.map((file, index) => (
                <div key={`${file.name}-${index}`}>
                    <button
                        onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                        className="w-full bg-secondary/50 backdrop-blur-sm rounded-lg p-3 flex items-center gap-2 hover:bg-secondary/70 transition-colors border border-theme"
                    >
                        <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                        <div className="flex-1 text-left">
                            <p className="text-sm text-theme font-medium">{file.name}</p>
                            <p className="text-xs text-gray-400">{file.type}</p>
                        </div>
                        {expandedIndex === index ? (
                            <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                    </button>

                    {expandedIndex === index && file.content && (
                        <div className="mt-2 p-4 bg-secondary rounded-lg border border-theme">
                            <pre className="text-sm text-theme whitespace-pre-wrap font-mono">
                                {file.content}
                            </pre>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}