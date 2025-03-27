'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import {
    Grid,
    List,
    FolderPlus,
    ArrowLeft,
    SortAsc,
    SortDesc,
    Upload
} from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import FileGrid from './FileGrid';
import FileList from './FileList';
import FolderNavigation from './FolderNavigation';
import UploadProgress from './UploadProgress';
import type { FileSystemState, FileSystemItem, FileUploadProgress } from '@/types/files';
import { v4 as uuidv4 } from 'uuid';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            duration: 0.3,
            when: "beforeChildren",
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.3 }
    },
    exit: {
        opacity: 0,
        y: -20,
        transition: { duration: 0.2 }
    }
};

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 }
};

export default function FilesInterface() {
    const [state, setState] = useState<FileSystemState>({
        items: [],
        currentFolderId: null,
        breadcrumbs: [],
        viewMode: 'grid',
        sortBy: 'name',
        sortDirection: 'asc',
        uploadProgress: []
    });
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { user } = useAuth();

    const fetchFiles = useCallback(async () => {
        if (!user) {
            setError('User not authenticated');
            setIsLoading(false);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);

            const response = await fetch('/api/shared-files', {
                headers: {
                    'X-User-Id': user.id,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            const items: FileSystemItem[] = [
                ...data.folders.map((folder: any) => ({
                    type: 'folder' as const,
                    id: folder.id,
                    name: folder.name,
                    path: folder.path,
                    createdBy: folder.createdBy,
                    createdAt: new Date(folder.createdAt),
                    parentId: folder.parentId
                })),
                ...data.files.map((file: any) => ({
                    type: 'file' as const,
                    id: file.id,
                    name: file.name,
                    path: file.path,
                    size: file.size,
                    fileType: file.type,
                    uploaderId: file.uploaderId,
                    uploaderName: file.uploaderName,
                    uploadDate: new Date(file.uploadDate),
                    parentId: file.folderId
                }))
            ];

            setState(prev => ({ ...prev, items }));
        } catch (error) {
            console.error('Error fetching files:', error);
            setError('Failed to fetch files. Please try again.');
        } finally {
            setIsLoading(false);
        }
    }, [user]);

    useEffect(() => {
        if (user) {
            fetchFiles();
        }
    }, [fetchFiles, user]);

    const handleUploadProgress = (progress: FileUploadProgress) => {
        setState(prev => ({
            ...prev,
            uploadProgress: [
                ...prev.uploadProgress.filter(p => p.fileId !== progress.fileId),
                progress
            ]
        }));
    };

    const handleFiles = async (files: File[]) => {
        if (!user) {
            setError('User not authenticated');
            return;
        }

        files.forEach(async (file) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('folderId', state.currentFolderId || '');
            formData.append('uploaderId', user.id);
            formData.append('uploaderName', user.name);

            const fileId = uuidv4();
            handleUploadProgress({
                fileId,
                fileName: file.name,
                progress: 0,
                status: 'uploading'
            });

            try {
                const response = await fetch('/api/shared-files', {
                    method: 'POST',
                    headers: {
                        'X-User-Id': user.id
                    },
                    body: formData
                });

                if (!response.ok) {
                    throw new Error('Upload failed');
                }

                handleUploadProgress({
                    fileId,
                    fileName: file.name,
                    progress: 100,
                    status: 'completed'
                });

                fetchFiles();
            } catch (error) {
                console.error('Upload error:', error);
                handleUploadProgress({
                    fileId,
                    fileName: file.name,
                    progress: 0,
                    status: 'error',
                    error: 'Upload failed'
                });
            }
        });
    };

    const createFolder = async () => {
        if (!user || !newFolderName.trim()) {
            setError('Please enter a folder name');
            return;
        }

        try {
            const response = await fetch('/api/shared-files/folders', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': user.id
                },
                body: JSON.stringify({
                    name: newFolderName.trim(),
                    parentId: state.currentFolderId,
                    createdBy: user.id
                })
            });

            if (!response.ok) {
                throw new Error('Failed to create folder');
            }

            setNewFolderName('');
            setIsCreatingFolder(false);
            fetchFiles();
        } catch (error) {
            console.error('Error creating folder:', error);
            setError('Failed to create folder');
        }
    };

    const handleDeleteItem = async (item: FileSystemItem) => {
        if (!user) {
            setError('User not authenticated');
            return;
        }

        try {
            const endpoint = item.type === 'file'
                ? '/api/shared-files'
                : '/api/shared-files/folders';

            const response = await fetch(endpoint, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': user.id
                },
                body: JSON.stringify({
                    fileId: item.type === 'file' ? item.id : undefined,
                    folderId: item.type === 'folder' ? item.id : undefined,
                    uploaderId: item.type === 'file' ? item.uploaderId : undefined,
                    createdBy: item.type === 'folder' ? item.createdBy : undefined
                })
            });

            if (!response.ok) {
                throw new Error('Failed to delete item');
            }

            fetchFiles();
        } catch (error) {
            console.error('Error deleting item:', error);
            setError('Failed to delete item');
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        if (e.dataTransfer.files?.length > 0) {
            const filesArray = Array.from(e.dataTransfer.files);
            handleFiles(filesArray);
        }
    };

    const sortItems = (items: FileSystemItem[]) => {
        return [...items].sort((a, b) => {
            if (a.type !== b.type) {
                return a.type === 'folder' ? -1 : 1;
            }

            let comparison = 0;
            switch (state.sortBy) {
                case 'name':
                    comparison = a.name.localeCompare(b.name);
                    break;
                case 'date':
                    const aDate = a.type === 'file' ? a.uploadDate : a.createdAt;
                    const bDate = b.type === 'file' ? b.uploadDate : b.createdAt;
                    comparison = (aDate?.getTime() || 0) - (bDate?.getTime() || 0);
                    break;
                case 'size':
                    comparison = (a.size || 0) - (b.size || 0);
                    break;
            }

            return state.sortDirection === 'asc' ? comparison : -comparison;
        });
    };

    const currentItems = sortItems(
        state.items.filter(item => item.parentId === state.currentFolderId)
    );

    // Enhanced drag overlay with animation
    const DragOverlay = () => (
        <motion.div
            className="fixed inset-0 bg-primary/10 pointer-events-none z-50 flex items-center justify-center"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={overlayVariants}
            transition={{ duration: 0.2 }}
        >
            <motion.div
                className="bg-card p-8 rounded-xl border-2 border-dashed border-primary"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 20 }}
            >
                <Upload className="w-12 h-12 text-primary mb-4" />
                <p className="text-lg font-medium text-theme">Drop files to upload</p>
            </motion.div>
        </motion.div>
    );

    if (!user) {
        return (
            <div className="min-h-screen bg-theme-gradient flex items-center justify-center">
                <div className="text-theme/70">Please log in to access your files.</div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-theme-gradient"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
        >
            <motion.div
                className="max-w-7xl mx-auto p-6"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div
                    className="flex items-center justify-between mb-6"
                    variants={itemVariants}
                >
                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-theme hover:text-primary transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            <span>Back to Chat</span>
                        </Link>
                        <motion.h1
                            className="text-2xl font-bold text-theme"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            My Files
                        </motion.h1>
                    </div>

                    <motion.div
                        className="flex items-center gap-4"
                        variants={itemVariants}
                    >
                        {/* View Mode Toggle */}
                        <motion.div
                            className="flex items-center gap-2 bg-secondary rounded-lg p-1"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <button
                                onClick={() => setState(prev => ({ ...prev, viewMode: 'grid' }))}
                                className={`p-2 rounded-lg transition-colors ${
                                    state.viewMode === 'grid'
                                        ? 'bg-primary text-white'
                                        : 'text-theme hover:bg-secondary-hover'
                                }`}
                            >
                                <Grid className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setState(prev => ({ ...prev, viewMode: 'list' }))}
                                className={`p-2 rounded-lg transition-colors ${
                                    state.viewMode === 'list'
                                        ? 'bg-primary text-white'
                                        : 'text-theme hover:bg-secondary-hover'
                                }`}
                            >
                                <List className="w-5 h-5" />
                            </button>
                        </motion.div>

                        {/* Sort Options */}
                        <motion.div className="flex items-center gap-2" variants={itemVariants}>
                            <select
                                value={state.sortBy}
                                onChange={(e) => setState(prev => ({
                                    ...prev,
                                    sortBy: e.target.value as 'name' | 'date' | 'size'
                                }))}
                                className="bg-secondary text-theme rounded-lg px-3 py-2 border border-theme"
                            >
                                <option value="name">Name</option>
                                <option value="date">Date</option>
                                <option value="size">Size</option>
                            </select>
                            <button
                                onClick={() => setState(prev => ({
                                    ...prev,
                                    sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc'
                                }))}
                                className="p-2 bg-secondary hover:bg-secondary-hover rounded-lg transition-colors"
                            >
                                {state.sortDirection === 'asc' ? (<SortAsc className="w-5 h-5 text-theme" />
                                ) : (
                                    <SortDesc className="w-5 h-5 text-theme" />
                                )}
                            </button>
                        </motion.div>

                        {/* Upload and New Folder Buttons */}
                        <motion.div className="flex items-center gap-2" variants={itemVariants}>
                            <motion.button
                                onClick={() => fileInputRef.current?.click()}
                                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <Upload className="w-5 h-5" />
                                <span>Upload</span>
                            </motion.button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                className="hidden"
                                multiple
                                onChange={(e) => {
                                    if (e.target.files?.length) {
                                        const files = Array.from(e.target.files);
                                        handleFiles(files);
                                    }
                                }}
                            />
                            <motion.button
                                onClick={() => setIsCreatingFolder(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-secondary text-theme rounded-lg hover:bg-secondary-hover transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                <FolderPlus className="w-5 h-5" />
                                <span>New Folder</span>
                            </motion.button>
                        </motion.div>
                    </motion.div>
                </motion.div>

                {/* Folder Navigation */}
                <motion.div variants={itemVariants}>
                    <FolderNavigation
                        items={state.items}
                        currentFolderId={state.currentFolderId}
                        onNavigate={(folderId) => setState(prev => ({
                            ...prev,
                            currentFolderId: folderId
                        }))}
                    />
                </motion.div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            className="flex items-center justify-center h-64"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            <div className="text-theme">Loading...</div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="content"
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                        >
                            {state.viewMode === 'grid' ? (
                                <FileGrid
                                    items={currentItems}
                                    onDelete={handleDeleteItem}
                                    onNavigate={(folderId) => setState(prev => ({
                                        ...prev,
                                        currentFolderId: folderId
                                    }))}
                                    currentUserId={user?.id}
                                />
                            ) : (
                                <FileList
                                    items={currentItems}
                                    onDelete={handleDeleteItem}
                                    onNavigate={(folderId) => setState(prev => ({
                                        ...prev,
                                        currentFolderId: folderId
                                    }))}
                                    currentUserId={user?.id}
                                />
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* New Folder Modal */}
                <AnimatePresence>
                    {isCreatingFolder && (
                        <motion.div
                            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
                            variants={overlayVariants}
                            initial="hidden"
                            animate="visible"
                            exit="hidden"
                            onClick={() => setIsCreatingFolder(false)}
                        >
                            <motion.div
                                className="bg-card rounded-xl p-6 w-full max-w-md"
                                variants={itemVariants}
                                initial="hidden"
                                animate="visible"
                                exit="exit"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <h3 className="text-lg font-semibold text-theme mb-4">Create New Folder</h3>
                                <input
                                    type="text"
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder="Folder name"
                                    className="w-full px-4 py-2 bg-secondary text-theme rounded-lg border border-theme mb-4"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            createFolder();
                                        }
                                    }}
                                />
                                <div className="flex justify-end gap-2">
                                    <button
                                        onClick={() => {
                                            setIsCreatingFolder(false);
                                            setNewFolderName('');
                                        }}
                                        className="px-4 py-2 text-theme hover:bg-secondary rounded-lg transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={createFolder}
                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
                                    >
                                        Create
                                    </button>
                                </div>
                            </motion.div>
                        </motion.div>
                    )}

                    {isDragging && <DragOverlay />}
                </AnimatePresence>

                {/* Upload Progress */}
                <AnimatePresence>
                    {state.uploadProgress.map((progress) => (
                        progress.status === 'uploading' && (
                            <motion.div
                                key={progress.fileId}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 20 }}
                            >
                                <UploadProgress
                                    progress={progress.progress}
                                    fileName={progress.fileName}
                                />
                            </motion.div>
                        )
                    ))}
                </AnimatePresence>

                {/* Error Display */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="fixed top-4 right-4 bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-lg shadow-lg"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}