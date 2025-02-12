'use client';

import { useState, useRef } from 'react';
import { X, Download, Upload, Check, Folder } from 'lucide-react';
import { exportChats, importChats, downloadChatsFile, SharedChat } from '@/lib/chatSharing';
import { useAuth } from '@/context/AuthContext';

interface ChatSharingModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversations: any[];
    folders: any[];
    onImport: (chats: any[], targetFolderId?: string | null) => void;
}

export default function ChatSharingModal({
                                             isOpen,
                                             onClose,
                                             conversations,
                                             folders,
                                             onImport
                                         }: ChatSharingModalProps) {
    const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
    const [selectedChats, setSelectedChats] = useState<string[]>([]);
    const [importFolder, setImportFolder] = useState<string | null>(null);
    const [importing, setImporting] = useState(false);
    const [importError, setImportError] = useState<string | null>(null);
    const [importSuccess, setImportSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { user } = useAuth();

    if (!isOpen) return null;

    const handleExport = () => {
        if (!user) return;

        const exportData = exportChats(
            conversations,
            user,
            selectedChats.length > 0,
            selectedChats
        );

        downloadChatsFile(exportData);
    };

    const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !user) return;

        setImporting(true);
        setImportError(null);
        setImportSuccess(false);

        try {
            const content = await file.text();
            const importedChats = await importChats(content, user.id);
            onImport(importedChats, importFolder);
            setImportSuccess(true);
            setTimeout(onClose, 1500);
        } catch (error) {
            setImportError(error instanceof Error ? error.message : 'Failed to import chats');
        } finally {
            setImporting(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const toggleChatSelection = (chatId: string) => {
        setSelectedChats(prev =>
            prev.includes(chatId)
                ? prev.filter(id => id !== chatId)
                : [...prev, chatId]
        );
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-card rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl border border-theme"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-theme">
                    <div className="flex gap-4">
                        <button
                            onClick={() => setActiveTab('export')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                activeTab === 'export'
                                    ? 'bg-primary text-white'
                                    : 'text-theme hover:bg-secondary'
                            }`}
                        >
                            Export Chats
                        </button>
                        <button
                            onClick={() => setActiveTab('import')}
                            className={`px-4 py-2 rounded-lg transition-colors ${
                                activeTab === 'import'
                                    ? 'bg-primary text-white'
                                    : 'text-theme hover:bg-secondary'
                            }`}
                        >
                            Import Chats
                        </button>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                        <X className="w-6 h-6 text-theme" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    {activeTab === 'export' ? (
                        <div className="space-y-6">
                            <div className="bg-secondary/30 rounded-lg p-4 border border-theme/10">
                                <p className="text-theme/70">
                                    Select conversations to export or export all conversations.
                                    The exported file will contain all chat history and can be imported by other users.
                                </p>
                            </div>
                            <div className="space-y-2 max-h-[calc(80vh-300px)] overflow-y-auto">
                                {conversations.map(chat => (
                                    <label
                                        key={chat.id}
                                        className="flex items-center p-4 rounded-lg hover:bg-secondary/50 cursor-pointer transition-colors border border-theme/10"
                                    >
                                        <input
                                            type="checkbox"
                                            checked={selectedChats.includes(chat.id)}
                                            onChange={() => toggleChatSelection(chat.id)}
                                            className="mr-4 w-4 h-4"
                                        />
                                        <div>
                                            <span className="text-theme font-medium">{chat.title}</span>
                                            <p className="text-sm text-theme/70 mt-1">
                                                {new Date(chat.timestamp).toLocaleDateString()} •
                                                {chat.messages?.length || 0} messages
                                            </p>
                                        </div>
                                    </label>
                                ))}
                            </div>
                            <div className="flex justify-end pt-4">
                                <button
                                    onClick={handleExport}
                                    className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                                >
                                    <Download className="w-5 h-5" />
                                    {selectedChats.length > 0
                                        ? `Export Selected (${selectedChats.length})`
                                        : 'Export All'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div className="bg-secondary/30 rounded-lg p-4 border border-theme/10">
                                <p className="text-theme/70">
                                    Import conversations from a previously exported file.
                                    You can optionally select a folder to organize the imported chats.
                                </p>
                            </div>

                            {/* Folder selection */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-theme/70">
                                    Import into folder (optional):
                                </label>
                                <select
                                    value={importFolder || ''}
                                    onChange={(e) => setImportFolder(e.target.value || null)}
                                    className="w-full px-4 py-3 bg-secondary/50 text-theme rounded-lg border border-theme"
                                >
                                    <option value="">No folder (root)</option>
                                    {folders.map(folder => (
                                        <option key={folder.id} value={folder.id}>
                                            {folder.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* File input */}
                            <div className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-theme/30 rounded-lg hover:border-theme/50 transition-colors bg-secondary/20">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".json"
                                    onChange={handleImport}
                                    className="hidden"
                                />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={importing}
                                    className="flex flex-col items-center gap-3 text-theme/70 hover:text-theme transition-colors p-6"
                                >
                                    <Upload className="w-8 h-8" />
                                    <div className="text-center">
                                        <p className="font-medium">Click to select file</p>
                                        <p className="text-sm text-theme/50 mt-1">or drag and drop</p>
                                    </div>
                                </button>
                            </div>

                            {importError && (
                                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400">
                                    {importError}
                                </div>
                            )}

                            {importSuccess && (
                                <div className="p-4 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 flex items-center gap-2">
                                    <Check className="w-5 h-5" />
                                    <span>Chats imported successfully!</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}