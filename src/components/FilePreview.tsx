// src/components/FilePreview.tsx
'use client';
import { FileText, X, Download, Send } from 'lucide-react';
import { useState } from 'react';

interface FilePreviewProps {
    fileName: string;
    fileType: string;
    fileSize: number;
    content: string;
    onClose: () => void;
    onSend: (content: string) => void;
}

export default function FilePreview({ fileName, fileType, fileSize, content, onClose, onSend }: FilePreviewProps) {
    const [message, setMessage] = useState('');

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
        else return (bytes / 1048576).toFixed(1) + ' MB';
    };

    const getFileIcon = (type: string) => {
        // You can add more file type icons here
        return <FileText className="w-6 h-6 text-blue-400" />;
    };

    const handleSend = () => {
        const finalMessage = message.trim()
            ? `${message}\n\nFile Content:\n${content}`
            : `Here's the content of the file ${fileName}:\n\n${content}`;
        onSend(finalMessage);
        onClose();
    };

    return (
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-4 max-w-2xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    {getFileIcon(fileType)}
                    <div>
                        <h3 className="text-gray-200 font-medium">{fileName}</h3>
                        <p className="text-sm text-gray-400">
                            {formatFileSize(fileSize)} • {fileType.split('/')[1].toUpperCase()}
                        </p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="p-1 hover:bg-gray-700 rounded-lg transition-colors"
                >
                    <X className="w-5 h-5 text-gray-400" />
                </button>
            </div>

            {/* Content Preview */}
            <div className="p-4 border-b border-gray-700">
                <div className="max-h-60 overflow-auto bg-gray-900 rounded-lg p-4">
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                        {content.slice(0, 1000)}
                        {content.length > 1000 && '...'}
                    </pre>
                </div>
            </div>

            {/* Message Input */}
            <div className="p-4">
                <div className="flex flex-col gap-3">
                    <textarea
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Add a message about this file (optional)"
                        className="w-full p-3 bg-gray-900 text-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            onClick={handleSend}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Send className="w-4 h-4" />
                            Send to Chat
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}