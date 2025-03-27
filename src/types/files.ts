export interface SharedFile {
    id: string;
    name: string;
    path: string;
    size: number;
    type: string;
    uploaderId: string;
    uploaderName: string;
    uploadDate: Date;
    folderId: string | null;
}

export interface SharedFolder {
    id: string;
    name: string;
    path: string;
    createdBy: string;
    createdAt: Date;
    parentId: string | null;
}

export interface FileSystemItem {
    type: 'file' | 'folder';
    id: string;
    name: string;
    path: string;
    size?: number;
    fileType?: string;
    uploaderId?: string;
    uploaderName?: string;
    uploadDate?: Date;
    createdBy?: string;
    createdAt?: Date;
    parentId: string | null;
}

export interface FileUploadProgress {
    fileId: string;
    fileName: string;
    progress: number;
    status: 'uploading' | 'completed' | 'error';
    error?: string;
}

export interface FileSystemState {
    items: FileSystemItem[];
    currentFolderId: string | null;
    breadcrumbs: SharedFolder[];
    viewMode: 'grid' | 'list';
    sortBy: 'name' | 'date' | 'size';
    sortDirection: 'asc' | 'desc';
    uploadProgress: FileUploadProgress[];
}