import { useDrag } from 'react-dnd';
import { MessageCircle, Edit, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

interface DraggableChatProps {
    id: string;
    title: string;
    timestamp: Date;
    isSelected: boolean;
    onClick: () => void;
    onDelete: () => void;
    onRename: (newTitle: string) => void;
}

export default function DraggableChat({
                                          id,
                                          title,
                                          timestamp,
                                          isSelected,
                                          onClick,
                                          onDelete,
                                          onRename,
                                      }: DraggableChatProps) {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'chat',
        item: { id, title },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    const [isEditing, setIsEditing] = useState(false);
    const [editedTitle, setEditedTitle] = useState(title);

    const handleRename = () => {
        if (editedTitle.trim()) {
            onRename(editedTitle.trim());
            setIsEditing(false);
        }
    };

    return (
        <motion.div
            ref={drag}
            onClick={onClick}
            initial={{ opacity: 1, x: 0 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100, transition: { duration: 0.3 } }}
            className={`group relative w-full p-3 text-left rounded-lg transition-all duration-200 cursor-move ${
                isSelected
                    ? 'bg-primary/20 text-theme current-chat'
                    : 'text-theme hover:bg-secondary/70'
            } ${isDragging ? 'opacity-50' : 'opacity-100'}`}
        >
            <div className="flex items-center gap-3">
                <MessageCircle className="w-4 h-4 flex-shrink-0" />
                {isEditing ? (
                    <input
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                        className="flex-1 bg-transparent text-theme rounded px-2 py-1 text-sm border border-theme"
                        autoFocus
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleRename();
                            if (e.key === 'Escape') {
                                setIsEditing(false);
                                setEditedTitle(title);
                            }
                        }}
                        onBlur={handleRename}
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-theme">{title}</p>
                        <p className="text-xs text-theme/50 truncate">
                            {new Date(timestamp).toLocaleString()}
                        </p>
                    </div>
                )}
            </div>

            {!isEditing && (
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsEditing(true);
                        }}
                        className="p-1 hover:bg-secondary/70 rounded transition-colors"
                        title="Edit chat title"
                    >
                        <Edit className="w-4 h-4 text-theme/70 hover:text-primary" />
                    </button>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete();
                        }}
                        className="p-1 hover:bg-secondary/70 rounded transition-colors"
                        title="Delete chat"
                    >
                        <Trash2 className="w-4 h-4 text-red-500" />
                    </button>
                </div>
            )}
        </motion.div>
    );
}
