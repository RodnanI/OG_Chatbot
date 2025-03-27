import { ChevronRight, Home } from 'lucide-react';
import type { FileSystemItem } from '@/types/files';

interface FolderNavigationProps {
    items: FileSystemItem[];
    currentFolderId: string | null;
    onNavigate: (folderId: string | null) => void;
}

export default function FolderNavigation({
                                             items,
                                             currentFolderId,
                                             onNavigate
                                         }: FolderNavigationProps) {
    const getFolderPath = () => {
        const path: { id: string | null; name: string }[] = [
            { id: null, name: 'Home' }
        ];

        let currentId = currentFolderId;
        while (currentId) {
            const folder = items.find(
                item => item.type === 'folder' && item.id === currentId
            );
            if (folder) {
                path.unshift({ id: folder.id, name: folder.name });
                currentId = folder.parentId;
            } else {
                break;
            }
        }

        return path;
    };

    const breadcrumbs = getFolderPath();

    return (
        <div className="flex items-center gap-2 mb-6 p-4 bg-secondary/50 rounded-xl">
            <button
                onClick={() => onNavigate(null)}
                className={`p-2 rounded-lg transition-colors ${
                    currentFolderId === null
                        ? 'text-primary'
                        : 'text-theme hover:text-primary'
                }`}
            >
                <Home className="w-5 h-5" />
            </button>

            {breadcrumbs.map((item, index) => (
                <div key={item.id ?? 'root'} className="flex items-center">
                    {index > 0 && (
                        <ChevronRight className="w-5 h-5 text-theme/50 mx-1" />
                    )}
                    <button
                        onClick={() => onNavigate(item.id)}
                        className={`px-3 py-1 rounded-lg transition-colors ${
                            currentFolderId === item.id
                                ? 'bg-primary text-white'
                                : 'text-theme hover:text-primary'
                        }`}
                    >
                        {item.name}
                    </button>
                </div>
            ))}
        </div>
    );
}