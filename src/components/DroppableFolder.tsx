// src/components/DroppableFolder.tsx
'use client';
import { useDrop } from 'react-dnd';
import { Folder, Edit, Trash2, PlusCircle, ChevronRight } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
    onRename: (newName: string) => void;
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
                                            onCreateChat,
                                            onDeleteConversation,
                                            onRenameConversation,
                                            isOpen,
                                            onToggle,
                                        }: DroppableFolderProps) {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'chat',
        drop: (item: { id: string }) => {
            onMoveConversation(item.id, folder.id);
        },
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    const [isHovered, setIsHovered] = useState(false);
    // Local state for inline folder renaming
    const [editingName, setEditingName] = useState(false);
    const [localFolderName, setLocalFolderName] = useState(folder.name);

    useEffect(() => {
        setLocalFolderName(folder.name);
    }, [folder.name]);

    const finishEditing = () => {
        setEditingName(false);
        const trimmedName = localFolderName.trim();
        if (trimmedName && trimmedName !== folder.name) {
            onRename(trimmedName);
        } else {
            // Reset to the original name if nothing changed or name is empty
            setLocalFolderName(folder.name);
        }
    };

    const cancelEditing = () => {
        setEditingName(false);
        setLocalFolderName(folder.name);
    };

    const folderConversations = conversations.filter((conv) =>
        folder.conversations.includes(conv.id)
    );
    const hasConversations = folderConversations.length > 0;

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
                ease: 'easeOut',
            },
        },
        hover: {
            scale: 1.02,
            transition: {
                duration: 0.2,
                ease: 'easeInOut',
            },
        },
    };

    const contentVariants = {
        closed: {
            height: 0,
            opacity: 0,
            transition: {
                height: {
                    duration: 0.3,
                    ease: 'easeInOut',
                },
                opacity: {
                    duration: 0.2,
                },
            },
        },
        open: {
            height: 'auto',
            opacity: 1,
            transition: {
                height: {
                    duration: 0.3,
                    ease: 'easeInOut',
                },
                opacity: {
                    duration: 0.3,
                    delay: 0.1,
                },
            },
        },
    };

    const iconRotateVariants = {
        closed: { rotate: 0 },
        open: { rotate: 90 },
    };

    return (
        <motion.div
            ref={drop}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            whileHover="hover"
            className={`mb-4 rounded-xl ${
                isOver
                    ? 'bg-primary/10 ring-2 ring-primary/30'
                    : 'bg-secondary/80 hover:bg-secondary/90'
            } backdrop-blur-sm transition-all duration-300 shadow-lg`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className="p-3">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                        {editingName ? (
                            <input
                                type="text"
                                value={localFolderName}
                                onChange={(e) => setLocalFolderName(e.target.value)}
                                className="flex-1 bg-secondary/50 text-theme rounded-lg px-3 py-2 text-sm border border-theme focus:ring-2 focus:ring-primary focus:border-transparent"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') finishEditing();
                                    if (e.key === 'Escape') cancelEditing();
                                }}
                                onBlur={finishEditing}
                            />
                        ) : (
                            <button onClick={onToggle} className="flex items-center gap-3 flex-1">
                                <div className="relative">
                                    <motion.div
                                        animate={isHovered ? { scale: [1, 1.1, 1] } : {}}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Folder className="w-5 h-5 text-primary" />
                                    </motion.div>
                                    {hasConversations && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"
                                        >
                                            {folderConversations.length}
                                        </motion.div>
                                    )}
                                </div>
                                <motion.div
                                    variants={iconRotateVariants}
                                    initial="closed"
                                    animate={isOpen ? 'open' : 'closed'}
                                    transition={{ duration: 0.3 }}
                                >
                                    <ChevronRight className="w-4 h-4 text-theme/70" />
                                </motion.div>
                                <span className="text-theme font-medium truncate">{localFolderName}</span>
                            </button>
                        )}
                    </div>

                    <div className="relative flex items-center w-24 overflow-hidden">
                        <AnimatePresence>
                            {(!editingName && (isHovered || isOpen)) && (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 10 }}
                                    className="absolute right-0 flex items-center gap-1"
                                >
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setEditingName(true);
                                        }}
                                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                        title="Rename folder"
                                    >
                                        <Edit className="w-4 h-4 text-theme/70 hover:text-primary" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onDelete();
                                        }}
                                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                        title="Delete folder"
                                    >
                                        <Trash2 className="w-4 h-4 text-theme/70 hover:text-red-500" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onCreateChat();
                                        }}
                                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                                        title="New chat in folder"
                                    >
                                        <PlusCircle className="w-4 h-4 text-theme/70 hover:text-primary" />
                                    </motion.button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                        {/* Invisible placeholder to reserve the space */}
                        <div className="invisible flex items-center gap-1">
                            <div className="p-2">
                                <Edit className="w-4 h-4" />
                            </div>
                            <div className="p-2">
                                <Trash2 className="w-4 h-4" />
                            </div>
                            <div className="p-2">
                                <PlusCircle className="w-4 h-4" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        variants={contentVariants}
                        initial="closed"
                        animate="open"
                        exit="closed"
                        className="overflow-hidden"
                    >
                        <div className="ml-4 pl-4 border-l-2 border-theme/10">
                            {folderConversations.map((conv, index) => (
                                <motion.div
                                    key={conv.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <DraggableChat
                                        id={conv.id}
                                        title={conv.title}
                                        timestamp={conv.timestamp}
                                        isSelected={currentConversationId === conv.id}
                                        onClick={() => onSelectConversation(conv)}
                                        onDelete={() => onDeleteConversation(conv.id)}
                                        onRename={(newTitle) => onRenameConversation(conv.id, newTitle)}
                                    />
                                </motion.div>
                            ))}
                            {folderConversations.length === 0 && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="py-3 px-4 text-sm text-theme/50 italic"
                                >
                                    No conversations yet
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
