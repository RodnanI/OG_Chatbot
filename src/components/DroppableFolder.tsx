// src/components/DroppableFolder.tsx
'use client';
import { useDrop } from 'react-dnd';
import { Folder, Edit, Trash2, PlusCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import DraggableChat from './DraggableChat';

interface DroppableFolderProps {
    folder: {
        id: string;
        name: string;
        conversations: string[];
    };
    conversations: Array<{
        id: string;
        title: string;
        timestamp: Date;
    }>;
    currentConversationId: string | null;
    onSelectConversation: (conversation: any) => void;
    onMoveConversation: (conversationId: string, folderId: string | null) => void;
    onDelete: () => void;
    onRename: () => void;
    isEditing: boolean;
    editValue: string;
    onEditChange: (value: string) => void;
    onEditComplete: () => void;
    onCreateChat: () => void;
    onDeleteConversation: (conversationId: string) => void;
    onRenameConversation: (conversationId: string, newTitle: string) => void;
    isOpen: boolean;
    onToggle: () => void;
}

export default function DroppableFolder({
                                            folder,
                                            conversations,
                                            currentConversationId,
                                            onSelectConversation,
                                            onMoveConversation,
                                            onDelete,
                                            onRename,
                                            isEditing,
                                            editValue,
                                            onEditChange,
                                            onEditComplete,
                                            onCreateChat,
                                            onDeleteConversation,
                                            onRenameConversation,
                                            isOpen,
                                            onToggle
                                        }: DroppableFolderProps) {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'chat',
        drop: (item: { id: string }) => {
            onMoveConversation(item.id, folder.id);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver()
        })
    }));

    const handleRename = () => {
        if (editValue.trim()) {
            onEditComplete();
        }
    };

    const folderConversations = conversations.filter(conv => folder.conversations.includes(conv.id));
    const hasConversations = folderConversations.length > 0;

    return (
        <div
            ref={drop}
            className={`mb-2 rounded-lg ${isOver ? 'bg-primary/10' : 'bg-secondary'}`}
        >
            <div className="group relative p-2 hover:bg-secondary/70 rounded-lg">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                        {isEditing ? (
                            <input
                                type="text"
                                value={editValue}
                                onChange={(e) => onEditChange(e.target.value)}
                                className="flex-1 bg-secondary/50 text-theme rounded px-2 py-1 text-sm border border-theme"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleRename();
                                    if (e.key === 'Escape') onEditComplete();
                                }}
                                onBlur={handleRename}
                            />
                        ) : (
                            <>
                                <button
                                    onClick={onToggle}
                                    className="text-theme hover:text-primary flex items-center gap-2"
                                >
                                    <div className="relative">
                                        <Folder className="w-4 h-4" />
                                        {hasConversations && (
                                            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                                                {folderConversations.length}
                                            </span>
                                        )}
                                    </div>
                                    {isOpen ? (
                                        <ChevronDown className="w-4 h-4" />
                                    ) : (
                                        <ChevronRight className="w-4 h-4" />
                                    )}
                                </button>
                                <span className="text-theme text-sm font-medium">
                                    {folder.name}
                                </span>
                            </>
                        )}
                    </div>

                    {!isEditing && (
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRename();
                                }}
                                className="text-gray-400 hover:text-primary p-1"
                                title="Rename folder"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete();
                                }}
                                className="text-gray-400 hover:text-red-500 p-1"
                                title="Delete folder"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onCreateChat();
                                }}
                                className="text-gray-400 hover:text-primary p-1"
                                title="New chat in folder"
                            >
                                <PlusCircle className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {isOpen && (
                <div className={`ml-4 pl-2 border-l-2 border-theme transition-all duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 h-0 overflow-hidden'
                }`}>
                    {folderConversations.map((conv) => (
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
                    {folderConversations.length === 0 && (
                        <div className="py-2 px-3 text-sm text-theme/50 italic">
                            No conversations yet
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}