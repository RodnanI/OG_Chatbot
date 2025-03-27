/** @jsxImportSource react */
'use client';

import React from 'react';
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
    Trash2,
    Download
} from 'lucide-react';
import type { FileSystemItem } from '@/types/files';

interface FileListProps {
    items: FileSystemItem[];
    onDelete: (item: FileSystemItem) => void;
    onNavigate: (folderId: string) => void;
    currentUserId?: string;
}

function FileList({ items, onDelete, onNavigate, currentUserId }: FileListProps): JSX.Element {
    const getFileIcon = (type: string | undefined): JSX.Element => {
        if (!type) return <File className="w-5 h-5" />;

        if (type.startsWith('image/')) return <Image className="w-5 h-5" />;
        if (type.startsWith('text/')) return <FileText className="w-5 h-5" />;
        if (type.startsWith('audio/')) return <Music className="w-5 h-5" />;
        if (type.startsWith('video/')) return <Video className="w-5 h-5" />;
        if (type.includes('compressed') || type.includes('zip') || type.includes('archive')) {
            return <Archive className="w-5 h-5" />;
        }
        if (type.includes('json') || type.includes('javascript') || type.includes('typescript')) {
            return <Code className="w-5 h-5" />;
        }
        if (type.includes('sql') || type.includes('database')) {
            return <Database className="w-5 h-5" />;
        }

        return <File className="w-5 h-5" />;
    };

    const formatFileSize = (bytes: number | undefined): string => {
        if (typeof bytes !== 'number') return '';

        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
        return (bytes / 1073741824).toFixed(1) + ' GB';
    };

    const formatDate = (date: Date | undefined): string => {
        if (!date) return '';
        return new Date(date).toLocaleDateString();
    };

    return React.createElement('div',
        { className: "bg-secondary/50 rounded-xl overflow-hidden" },
        React.createElement('table',
            { className: "w-full" },
            React.createElement('thead', null,
                React.createElement('tr', { className: "bg-secondary/70" },
                    React.createElement('th', { className: "text-left py-3 px-4 text-theme font-medium" }, "Name"),
                    React.createElement('th', { className: "text-left py-3 px-4 text-theme font-medium" }, "Size"),
                    React.createElement('th', { className: "text-left py-3 px-4 text-theme font-medium" }, "Date"),
                    React.createElement('th', { className: "text-left py-3 px-4 text-theme font-medium" }, "Owner"),
                    React.createElement('th', { className: "text-right py-3 px-4 text-theme font-medium" }, "Actions")
                )
            ),
            React.createElement('tbody', { className: "divide-y divide-theme/10" },
                items.map((item) =>
                    React.createElement('tr',
                        {
                            key: item.id,
                            className: "group hover:bg-secondary/70 transition-colors"
                        },
                        React.createElement('td', { className: "py-3 px-4" },
                            item.type === 'folder' ?
                                React.createElement('button',
                                    {
                                        onClick: () => onNavigate(item.id),
                                        className: "flex items-center gap-2 text-theme hover:text-primary transition-colors"
                                    },
                                    React.createElement(Folder, { className: "w-5 h-5" }),
                                    React.createElement('span', { className: "font-medium" }, item.name)
                                ) :
                                React.createElement('div',
                                    { className: "flex items-center gap-2 text-theme" },
                                    getFileIcon(item.fileType),
                                    React.createElement('span', { className: "font-medium" }, item.name)
                                )
                        ),
                        React.createElement('td', { className: "py-3 px-4 text-theme/70" },
                            item.type === 'file' ? formatFileSize(item.size) : '--'
                        ),
                        React.createElement('td', { className: "py-3 px-4 text-theme/70" },
                            formatDate(item.type === 'file' ? item.uploadDate : item.createdAt)
                        ),
                        React.createElement('td', { className: "py-3 px-4 text-theme/70" },
                            item.type === 'file' ? item.uploaderName : item.createdBy
                        ),
                        React.createElement('td', { className: "py-3 px-4" },
                            React.createElement('div', { className: "flex items-center justify-end gap-2" },
                                item.type === 'file' &&
                                React.createElement('a',
                                    {
                                        href: `/api/shared-files/${item.id}`,
                                        className: "p-2 text-theme hover:text-primary transition-colors",
                                        title: "Download"
                                    },
                                    React.createElement(Download, { className: "w-4 h-4" })
                                ),
                                ((item.type === 'file' && item.uploaderId === currentUserId) ||
                                    (item.type === 'folder' && item.createdBy === currentUserId)) &&
                                React.createElement('button',
                                    {
                                        onClick: () => onDelete(item),
                                        className: "p-2 text-red-500 hover:text-red-600 transition-colors",
                                        title: "Delete"
                                    },
                                    React.createElement(Trash2, { className: "w-4 h-4" })
                                )
                            )
                        )
                    )
                )
            )
        )
    );
}

export default FileList;