import {
    Folder,
    File,
    Image,
    FileText,
    Music,
    Video,
    Archive,
    Code,
    Database,
    Trash2
} from 'lucide-react';
import type { FileSystemItem } from '@/types/files';

interface FileGridProps {
    items: FileSystemItem[];
    onDelete: (item: FileSystemItem) => void;
    onNavigate: (folderId: string) => void;
    currentUserId?: string;
}

export default function FileGrid({
                                     items,
                                     onDelete,
                                     onNavigate,
                                     currentUserId
                                 }: FileGridProps) {
    const getFileIcon = (type: string | undefined) => {
        if (!type) return <File className="w-8 h-8" />;

        if (type.startsWith('image/')) return <Image className="w-8 h-8" />;
        if (type.startsWith('text/')) return <FileText className="w-8 h-8" />;
        if (type.startsWith('audio/')) return <Music className="w-8 h-8" />;
        if (type.startsWith('video/')) return <Video className="w-8 h-8" />;
        if (type.includes('compressed') || type.includes('zip') || type.includes('archive')) {
            return <Archive className="w-8 h-8" />;
        }
        if (type.includes('json') || type.includes('javascript') || type.includes('typescript')) {
            return <Code className="w-8 h-8" />;
        }
        if (type.includes('sql') || type.includes('database')) {
            return <Database className="w-8 h-8" />;
        }

        return <File className="w-8 h-8" />;
    };

    const formatFileSize = (bytes: number | undefined) => {
        if (typeof bytes !== 'number') return '';

        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
        return (bytes / 1073741824).toFixed(1) + ' GB';
    };

    const formatDate = (date: Date | undefined) => {
        if (!date) return '';
        return new Date(date).toLocaleDateString();
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {items.map((item) => (
                <div
                    key={item.id}
                    className="group relative bg-secondary/50 rounded-xl p-4 hover:bg-secondary/70 transition-all"
                >
                    {item.type === 'folder' ? (
                        <button
                            onClick={() => onNavigate(item.id)}
                            className="w-full text-left"
                        >
                            <div className="flex items-center justify-center h-32 mb-4">
                                <Folder className="w-16 h-16 text-primary" />
                            </div>
                            <div>
                                <p className="font-medium text-theme truncate mb-1">
                                    {item.name}
                                </p>
                                <p className="text-sm text-theme/70">
                                    {formatDate(item.createdAt)}
                                </p>
                            </div>
                        </button>
                    ) : (
                        <a
                            href={`/api/shared-files/${item.id}`}
                            className="block"
                        >
                            <div className="flex items-center justify-center h-32 mb-4">
                                {getFileIcon(item.fileType)}
                            </div>
                            <div>
                                <p className="font-medium text-theme truncate mb-1">
                                    {item.name}
                                </p>
                                <div className="flex items-center justify-between text-sm text-theme/70">
                                    <span>{formatFileSize(item.size)}</span>
                                    <span>{formatDate(item.uploadDate)}</span>
                                </div>
                            </div>
                        </a>
                    )}

                    {((item.type === 'file' && item.uploaderId === currentUserId) ||
                        (item.type === 'folder' && item.createdBy === currentUserId)) && (
                        <button
                            onClick={() => onDelete(item)}
                            className="absolute top-2 right-2 p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                            title="Delete"
                        >
                            <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                    )}
                </div>
            ))}
        </div>
    );
}