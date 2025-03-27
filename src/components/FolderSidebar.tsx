import { useState, useEffect } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { AnimatePresence } from 'framer-motion';
import { MessageCircle, PlusCircle, FolderPlus, ChevronRight, ChevronLeft, Search } from 'lucide-react';
import BurgerMenu from './BurgerMenu';
import DroppableFolder from './DroppableFolder';
import DraggableChat from './DraggableChat';

interface Conversation {
    id: string;
    title: string;
    timestamp: Date;
    folderId: string | null;
    userId: string;
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
                                      }: FolderSidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [openFolders, setOpenFolders] = useState<Set<string>>(new Set());
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    // Load initial state from localStorage
    useEffect(() => {
        const stored = window.localStorage.getItem('sidebarCollapsed');
        if (stored !== null) {
            setIsCollapsed(JSON.parse(stored));
        }

        const savedOpenFolders = window.localStorage.getItem('openFolders');
        if (savedOpenFolders) {
            setOpenFolders(new Set(JSON.parse(savedOpenFolders)));
        }
    }, []);

    // Update localStorage when isCollapsed changes
    useEffect(() => {
        window.localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }, [isCollapsed]);

    // Update localStorage when openFolders changes
    useEffect(() => {
        window.localStorage.setItem('openFolders', JSON.stringify(Array.from(openFolders)));
    }, [openFolders]);

    const handleCreateFolder = () => {
        if (newFolderName.trim()) {
            onCreateFolder(newFolderName.trim());
            setNewFolderName('');
            setIsCreatingFolder(false);
        }
    };

    const toggleFolder = (folderId: string) => {
        setOpenFolders((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(folderId)) {
                newSet.delete(folderId);
            } else {
                newSet.add(folderId);
            }
            return newSet;
        });
    };

    const filteredFolders = folders.filter((folder) =>
        folder.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Find conversations that aren't in any folder and match the search term
    const unorganizedChats = conversations.filter(
        (conv) => !conv.folderId && conv.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex">
                {/* Sidebar container with animated width */}
                <div
                    className={`overflow-hidden transition-all duration-300 sidebar-gradient flex flex-col ${
                        isCollapsed ? 'w-0' : 'w-80'
                    }`}
                >
                    {!isCollapsed && (
                        <>
                            {/* Header with Search and New Chat/Folder buttons */}
                            <div className="p-4 border-b border-border-color">
                                <div className="flex items-center gap-2 mb-4">
                                    <MessageCircle className="w-6 h-6 text-theme" />
                                    <h1 className="text-xl font-bold text-theme">Chat Folders</h1>
                                </div>
                                <div className="relative mb-4">
                                    <input
                                        type="text"
                                        placeholder="Search folders..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full px-3 py-2 rounded-lg bg-secondary text-theme placeholder-theme border border-border-color focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-theme" />
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onCreateNewChat()}
                                        className="flex-1 flex items-center justify-center gap-2 bg-primary text-white rounded-lg py-2 transition-colors"
                                    >
                                        <PlusCircle className="w-5 h-5" />
                                        <span>New Chat</span>
                                    </button>
                                    <button
                                        onClick={() => setIsCreatingFolder(true)}
                                        className="p-2 bg-secondary hover:bg-secondary-hover rounded-lg transition-colors"
                                        title="Create new folder"
                                    >
                                        <FolderPlus className="w-5 h-5 text-theme" />
                                    </button>
                                </div>
                                {isCreatingFolder && (
                                    <div className="mt-3 flex gap-2 animate-slide-down">
                                        <input
                                            type="text"
                                            value={newFolderName}
                                            onChange={(e) => setNewFolderName(e.target.value)}
                                            placeholder="Folder name"
                                            className="flex-1 bg-secondary text-theme rounded-lg px-3 py-2 text-sm border border-border-color focus:ring-2 focus:ring-primary focus:border-transparent"
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
                                            className="px-3 py-2 bg-primary text-white rounded-lg transition-colors"
                                        >
                                            Create
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Folders and Chats */}
                            <div className="flex-1 overflow-y-auto p-2">
                                {filteredFolders.map((folder) => {
                                    // Filter conversations that belong to this folder
                                    const folderConversations = conversations.filter(
                                        (conv) => conv.folderId === folder.id
                                    );

                                    return (
                                        <DroppableFolder
                                            key={folder.id}
                                            folder={folder}
                                            conversations={folderConversations}
                                            currentConversationId={currentConversationId}
                                            onSelectConversation={onSelectConversation}
                                            onMoveConversation={onMoveConversation}
                                            onDelete={() => onDeleteFolder(folder.id)}
                                            onRename={(newName) => onRenameFolder(folder.id, newName)}
                                            onCreateChat={() => onCreateNewChat(folder.id)}
                                            onDeleteConversation={onDeleteConversation}
                                            onRenameConversation={onRenameConversation}
                                            isOpen={openFolders.has(folder.id)}
                                            onToggle={() => toggleFolder(folder.id)}
                                        />
                                    );
                                })}

                                {/* Uncategorized Chats */}
                                {unorganizedChats.length > 0 && (
                                    <div className="mt-4 border-t border-border-color pt-4">
                                        <h2 className="px-2 text-xs font-semibold text-theme uppercase tracking-wider mb-2">
                                            Uncategorized
                                        </h2>
                                        <AnimatePresence>
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
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div className="mt-auto p-4 border-t border-border-color bg-secondary">
                                <div className="flex items-center justify-between">
                                    <BurgerMenu onShareClick={onOpenShareModal} />
                                    <div className="text-sm text-theme flex items-center gap-2">
                                        <span className="flex-1">Total: {conversations.length}</span>
                                        <span>•</span>
                                        <span>Folders: {folders.length}</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Toggle button repositioned outside the sidebar container */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="ml-2 self-center p-2 bg-secondary hover:bg-secondary-hover rounded-full text-theme transition-colors"
                    title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
                </button>
            </div>
        </DndProvider>
    );
}