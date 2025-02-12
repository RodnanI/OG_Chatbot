// src/lib/chatSharing.ts
import { User } from '@/types/auth';

export interface SharedChat {
    id: string;
    title: string;
    messages: any[];
    originalTimestamp: Date;
    originalAuthor: {
        id: string;
        name: string;
        username: string;
    };
    sharedAt: Date;
    folderId: string | null;
    modelId?: string;
}

export interface ChatExport {
    version: '1.0';
    chats: SharedChat[];
    exportedAt: Date;
    exportedBy: {
        id: string;
        name: string;
        username: string;
    };
}

export const exportChats = (
    chats: any[],
    user: User,
    selectedOnly: boolean = false,
    selectedIds?: string[]
): string => {
    const chatsToExport = selectedOnly && selectedIds
        ? chats.filter(chat => selectedIds.includes(chat.id))
        : chats;

    const exportData: ChatExport = {
        version: '1.0',
        chats: chatsToExport.map(chat => ({
            ...chat,
            originalAuthor: {
                id: user.id,
                name: user.name,
                username: user.username
            },
            sharedAt: new Date()
        })),
        exportedAt: new Date(),
        exportedBy: {
            id: user.id,
            name: user.name,
            username: user.username
        }
    };

    return JSON.stringify(exportData, null, 2);
};

export const importChats = async (
    fileContent: string,
    currentUserId: string
): Promise<SharedChat[]> => {
    try {
        const importData: ChatExport = JSON.parse(fileContent);

        // Validate version and structure
        if (!importData.version || !importData.chats) {
            throw new Error('Invalid chat export format');
        }

        // Process imported chats
        return importData.chats.map(chat => ({
            ...chat,
            id: `imported_${chat.id}_${Date.now()}`, // Ensure unique ID
            userId: currentUserId, // Set new owner
        }));
    } catch (error) {
        console.error('Error importing chats:', error);
        throw new Error('Failed to import chats. The file may be corrupted or in an invalid format.');
    }
};

export const downloadChatsFile = (exportData: string, filename: string = 'chats_export.json') => {
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};