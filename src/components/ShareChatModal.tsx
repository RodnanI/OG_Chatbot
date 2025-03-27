// src/components/ShareChatModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { X, Share2 } from 'lucide-react';

interface Conversation {
    id: string;
    title: string;
    messages: any[];
}

interface User {
    id: string;
    username: string;
    name: string;
}

interface ShareChatModalProps {
    isOpen: boolean;
    onClose: () => void;
    conversations: Conversation[];
    currentUserId: string;
}

export default function ShareChatModal({
                                           isOpen,
                                           onClose,
                                           conversations,
                                           currentUserId
                                       }: ShareChatModalProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
    const [users, setUsers] = useState<User[]>([]);
    const [statusMessage, setStatusMessage] = useState<string>('');

    useEffect(() => {
        // Fetch actual users from our API endpoint
        fetch('/api/users')
            .then(res => res.json())
            .then((data: User[]) => setUsers(data))
            .catch(error => console.error('Failed to load users:', error));
    }, []);

    if (!isOpen) return null;

    const filteredChats = conversations.filter(chat =>
        chat.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleShare = async () => {
        if (!selectedChatId || !selectedRecipientId) {
            setStatusMessage('Please select a chat and a recipient.');
            return;
        }
        const chatToShare = conversations.find(chat => chat.id === selectedChatId);
        if (!chatToShare) return;
        try {
            // Create a new conversation object with proper folderId
            const sharedConversation = {
                ...chatToShare,
                id: `shared_${Date.now()}`,
                folderId: 'inbox', // Explicitly set folderId to 'inbox'
                sharedFrom: currentUserId,
                timestamp: new Date()
            };

            const response = await fetch('/api/share-chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    senderId: currentUserId,
                    recipientId: selectedRecipientId,
                    chat: sharedConversation // Send the modified conversation
                })
            });

            const data = await response.json();
            if (response.ok) {
                setStatusMessage('Chat shared successfully!');
                setTimeout(() => {
                    setStatusMessage('');
                    onClose();
                }, 1500);
            } else {
                setStatusMessage(data.error || 'Failed to share chat.');
            }
        } catch (error: any) {
            setStatusMessage(error.message || 'Failed to share chat.');
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-card rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl border border-theme p-6"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-theme">Share a Chat</h2>
                    <button onClick={onClose} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                        <X className="w-6 h-6 text-theme" />
                    </button>
                </div>

                {/* Chat search and selection */}
                <div className="mb-4">
                    <label className="text-sm text-theme/70">Search Chats:</label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Type chat name..."
                        className="w-full p-2 mt-1 rounded bg-secondary/50 text-theme border border-theme/20 focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <div className="mt-2 max-h-48 overflow-y-auto">
                        {filteredChats.map((chat) => (
                            <div key={chat.id} className="flex items-center p-2 border-b border-theme/10">
                                <input
                                    type="radio"
                                    name="selectedChat"
                                    value={chat.id}
                                    checked={selectedChatId === chat.id}
                                    onChange={() => setSelectedChatId(chat.id)}
                                    className="mr-2"
                                />
                                <span className="text-theme">{chat.title}</span>
                            </div>
                        ))}
                        {filteredChats.length === 0 && (
                            <p className="text-sm text-theme/50 mt-2">No chats found.</p>
                        )}
                    </div>
                </div>

                {/* Recipient selection */}
                <div className="mb-4">
                    <label className="text-sm text-theme/70">Select Recipient:</label>
                    <select
                        value={selectedRecipientId}
                        onChange={(e) => setSelectedRecipientId(e.target.value)}
                        className="w-full p-2 mt-1 rounded bg-secondary/50 text-theme border border-theme/20 focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">-- Select User --</option>
                        {users
                            .filter(user => user.id !== currentUserId)
                            .map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.username})
                                </option>
                            ))}
                    </select>
                </div>

                {/* Status and actions */}
                {statusMessage && (
                    <div className="mb-4 text-sm text-theme text-center">{statusMessage}</div>
                )}
                <div className="flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-secondary/50 hover:bg-secondary rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">
                        <Share2 className="w-5 h-5" />
                        Share Chat
                    </button>
                </div>
            </div>
        </div>
    );
}
