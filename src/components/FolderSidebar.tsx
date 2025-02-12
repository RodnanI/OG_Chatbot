// src/components/FolderSidebar.tsx
'use client';
import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import Link from 'next/link';
import { MessageCircle, PlusCircle, FolderPlus, ChevronRight, ChevronLeft } from 'lucide-react';
import BurgerMenu from './BurgerMenu';
import DroppableFolder from './DroppableFolder';
import DraggableChat from './DraggableChat';

interface Conversation {
    id: string;
    title: string;
    timestamp: Date;
    folderId: string | null;
}

interface Folder {
    id: string;
    name: string;
    createdAt: Date;
    parentId: string | null;
    conversations: string[];
}

interface FolderSidebarProps {
    folders: Folder[];
    conversations: Conversation[];
    currentConversationId: string | null;
    onSelectConversation: (conversation: Conversation) => void;
    onCreateNewChat: (folderId?: string) => void;
    onCreateFolder: (name: string, parentId?: string) => void;
    onMoveConversation: (conversationId: string, folderId: string | null) => void;
    onDeleteFolder: (folderId: string) => void;
    onRenameFolder: (folderId: string, newName: string) => void;
    onDeleteConversation: (conversationId: string) => void;
    onRenameConversation: (conversationId: string, newTitle: string) => void;
    onOpenShareModal: () => void;
    children?: React.ReactNode;
}

export default function FolderSidebar({
                                          folders,
                                          conversations,
                                          currentConversationId,
                                          onSelectConversation,
                                          onCreateNewChat,
                                          onCreateFolder,
                                          onMoveConversation,
                                          onDeleteFolder,
                                          onRenameFolder,
                                          onDeleteConversation,
                                          onRenameConversation,
                                          onOpenShareModal,
                                          children
                                      }: FolderSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());

    // Load open folders state from localStorage
    useEffect(() => {
        const savedOpenFolders = localStorage.getItem('openFolders');
        if (savedOpenFolders) {
            setOpenFolders(new Set(JSON.parse(savedOpenFolders)));
        }
    }, []);

    // Save open folders state to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('openFolders', JSON.stringify(Array.from(openFolders)));
    }, [openFolders]);

    const handleCreateFolder = () => {
        if (newFolderName.trim()) {
            onCreateFolder(newFolderName.trim());
            setNewFolderName('');
            setIsCreatingFolder(false);
        }
    };

    const toggleFolder = (folderId: string) => {
        setOpenFolders(prev => {
            const newSet = new Set(prev);
            if (newSet.has(folderId)) {
                newSet.delete(folderId);
            } else {
                newSet.add(folderId);
            }
            return newSet;
        });
    };

    const unorganizedChats = conversations.filter(conv => !conv.folderId);

    return (
        <DndProvider backend={HTML5Backend}>
            <div className={`${isCollapsed ? 'w-16' : 'w-72'} sidebar-gradient flex flex-col transition-all duration-300 ease-in-out relative`}>
                {/* Collapse Toggle Button */}
                <div
                    className="absolute -right-4 top-1/2 transform -translate-y-1/2 w-8 h-8 z-50"
                    style={{ pointerEvents: 'all' }}
                >
                    <button
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        className="w-full h-full bg-secondary glass-effect rounded-full p-1.5 hover:bg-secondary-hover transition-colors"
                    >
                        {isCollapsed ? (
                            <ChevronRight className="w-4 h-4 text-theme" />
                        ) : (
                            <ChevronLeft className="w-4 h-4 text-theme" />
                        )}
                    </button>
                </div>

                {/* Header */}
                <div className="p-4 border-b border-border-color bg-card">
                    <h1 className={`text-xl font-bold text-theme mb-4 flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
                        <MessageCircle className="w-6 h-6" />
                        {!isCollapsed && <span className="ml-2">Chat Folders</span>}
                    </h1>
                    <div className={`flex gap-2 ${isCollapsed ? 'flex-col' : ''}`}>
                        <button
                            onClick={() => onCreateNewChat()}
                            className={`flex items-center justify-center gap-2 bg-primary text-white rounded-lg py-2 
                                hover:bg-primary-hover transition-all duration-200 shadow-lg
                                ${isCollapsed ? 'px-2' : 'px-4 flex-1'}`}
                        >
                            <PlusCircle className="w-5 h-5" />
                            {!isCollapsed && <span>New Chat</span>}
                        </button>
                        {!isCollapsed && (
                            <button
                                onClick={() => setIsCreatingFolder(true)}
                                className="bg-secondary text-theme rounded-lg p-2 hover:bg-secondary-hover
                                    transition-colors shadow-lg glass-effect"
                                title="Create new folder"
                            >
                                <FolderPlus className="w-5 h-5" />
                            </button>
                        )}
                    </div>

                    {/* New Folder Input */}
                    {!isCollapsed && isCreatingFolder && (
                        <div className="mt-4 flex gap-2 animate-slide-down">
                            <input
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                placeholder="Folder name"
                                className="flex-1 bg-secondary/50 text-theme rounded-lg px-3 py-2 text-sm
                                    border border-border-color focus:ring-2 focus:ring-primary focus:border-transparent
                                    glass-effect"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleCreateFolder();
                                    if (e.key === 'Escape') {
                                        setIsCreatingFolder(false);
                                        setNewFolderName('');
                                    }
                                }}
                            />
                            <button
                                onClick={handleCreateFolder}
                                className="bg-primary text-white rounded-lg px-3 py-2 text-sm
                                    hover:bg-primary-hover transition-colors"
                            >
                                Create
                            </button>
                        </div>
                    )}
                </div>

                {/* Folders and Chats */}
                <div className="flex-1 overflow-y-auto p-2">
                    {!isCollapsed ? (
                        <>
                            {folders.map((folder) => (
                                <DroppableFolder
                                    key={folder.id}
                                    folder={folder}
                                    conversations={conversations}
                                    currentConversationId={currentConversationId}
                                    onSelectConversation={onSelectConversation}
                                    onMoveConversation={onMoveConversation}
                                    onDelete={() => onDeleteFolder(folder.id)}
                                    onRename={() => {
                                        setNewFolderName(folder.name);
                                        onRenameFolder(folder.id, newFolderName);
                                    }}
                                    isEditing={false}
                                    editValue={newFolderName}
                                    onEditChange={setNewFolderName}
                                    onEditComplete={() => {
                                        if (newFolderName.trim()) {
                                            onRenameFolder(folder.id, newFolderName.trim());
                                        }
                                        setNewFolderName('');
                                    }}
                                    onCreateChat={() => onCreateNewChat(folder.id)}
                                    onDeleteConversation={onDeleteConversation}
                                    onRenameConversation={onRenameConversation}
                                    isOpen={openFolders.has(folder.id)}
                                    onToggle={() => toggleFolder(folder.id)}
                                />
                            ))}

                            {/* Uncategorized Chats */}
                            {unorganizedChats.length > 0 && (
                                <div className="mt-4 border-t border-border-color pt-4">
                                    <h2 className="px-2 text-xs font-semibold text-theme/70 uppercase tracking-wider mb-2">
                                        Uncategorized
                                    </h2>
                                    <div className="space-y-1">
                                        {unorganizedChats.map((conv) => (
                                            <DraggableChat
                                                key={conv.id}
                                                id={conv.id}
                                                title={conv.title}
                                                timestamp={conv.timestamp}
                                                isSelected={currentConversationId === conv.id}
                                                onClick={() => onSelectConversation(conv)}
                                                onDelete={() => onDeleteConversation(conv.id)}
                                                onRename={(newTitle) => onRenameConversation(conv.id, newTitle)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    ) : (
                        // Collapsed view with tooltip previews
                        <div className="flex flex-col items-center gap-2">
                            {folders.map((folder) => (
                                <div key={folder.id} className="relative group">
                                    <button
                                        onClick={() => toggleFolder(folder.id)}
                                        className="p-2 rounded-lg hover:bg-secondary-hover transition-colors relative"
                                        title={folder.name}
                                    >
                                        <MessageCircle className="w-5 h-5 text-theme" />
                                        {/* Show number of conversations in the folder */}
                                        {folder.conversations.length > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                                {folder.conversations.length}
                                            </span>
                                        )}
                                    </button>
                                    {/* Tooltip with folder content preview */}
                                    <div className="absolute left-full ml-2 bg-secondary/90 backdrop-blur-sm rounded-lg py-2 px-3
                                        invisible group-hover:visible whitespace-nowrap z-50 min-w-[200px] shadow-xl border border-theme">
                                        <p className="font-medium text-theme mb-2">{folder.name}</p>
                                        <div className="text-sm text-theme/70">
                                            {folder.conversations.slice(0, 3).map(convId => {
                                                const conv = conversations.find(c => c.id === convId);
                                                return conv ? (
                                                    <p key={conv.id} className="truncate">{conv.title}</p>
                                                ) : null;
                                            })}
                                            {folder.conversations.length > 3 && (
                                                <p className="text-xs text-theme/50 mt-1">
                                                    +{folder.conversations.length - 3} more...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {unorganizedChats.length > 0 && (
                                <div className="relative group">
                                    <button
                                        className="p-2 rounded-lg hover:bg-secondary-hover transition-colors"
                                        title="Uncategorized Chats"
                                    >
                                        <MessageCircle className="w-5 h-5 text-theme" />
                                        <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                            {unorganizedChats.length}
                                        </span>
                                    </button>
                                    <div className="absolute left-full ml-2 bg-secondary/90 backdrop-blur-sm rounded-lg py-2 px-3
                                        invisible group-hover:visible whitespace-nowrap z-50 min-w-[200px] shadow-xl border border-theme">
                                        <p className="font-medium text-theme mb-2">Uncategorized</p>
                                        <div className="text-sm text-theme/70">
                                            {unorganizedChats.slice(0, 3).map(conv => (
                                                <p key={conv.id} className="truncate">{conv.title}</p>
                                            ))}
                                            {unorganizedChats.length > 3 && (
                                                <p className="text-xs text-theme/50 mt-1">
                                                    +{unorganizedChats.length - 3} more...
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer with Burger Menu */}
                <div className="mt-auto p-4 border-t border-border-color bg-card">
                    <div className="flex items-center justify-between">
                        <BurgerMenu onShareClick={onOpenShareModal} />
                        {!isCollapsed && (
                            <div className="text-sm text-theme/70 flex items-center gap-2">
                                <span className="flex-1">Total: {conversations.length}</span>
                                <span>•</span>
                                <span>Folders: {folders.length}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DndProvider>
    );
}