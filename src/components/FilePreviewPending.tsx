// src/components/FilePreviewPending.tsx
import { X, FileText, Eye } from 'lucide-react';

interface PendingFile {
    file: File;
    content: string;
}

interface FilePreviewPendingProps {
    files: PendingFile[];
    onRemove: (index: number) => void;
    onView: (index: number) => void;
}

export default function FilePreviewPending({ files, onRemove, onView }: FilePreviewPendingProps) {
    return (
        <div className="flex flex-wrap gap-2">
            {files.map((pendingFile, index) => (
                <div
                    key={`${pendingFile.file.name}-${index}`}
                    className="flex-none bg-secondary/50 backdrop-blur-sm rounded-lg p-2 flex items-center gap-2 border border-theme max-w-xs"
                >
                    <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                    <span className="text-sm text-theme truncate flex-1 max-w-[160px]">{pendingFile.file.name}</span>
                    <button
                        onClick={() => onView(index)}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                        title="View content"
                    >
                        <Eye className="w-4 h-4 text-theme/70" />
                    </button>
                    <button
                        onClick={() => onRemove(index)}
                        className="p-1.5 hover:bg-secondary rounded-lg transition-colors"
                        title="Remove file"
                    >
                        <X className="w-4 h-4 text-theme/70" />
                    </button>
                </div>
            ))}
        </div>
    );
}