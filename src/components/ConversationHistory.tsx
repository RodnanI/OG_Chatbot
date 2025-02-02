'use client';
import { useState } from 'react';

interface Conversation {
    id: string;
    title: string;
    timestamp: Date;
    messages: Array<{role: string; content: string}>;
}

interface ConversationHistoryProps {
    conversations: Conversation[];
    onSelectConversation: (conversation: Conversation) => void;
    onNewConversation: () => void;
    currentConversationId: string | null;
}

export default function ConversationHistory({
                                                conversations,
                                                onSelectConversation,
                                                onNewConversation,
                                                currentConversationId
                                            }: ConversationHistoryProps) {
    return (
        <div className="w-64 bg-gray-50 p-4 border-r h-full">
            <button
                onClick={onNewConversation}
                className="w-full mb-4 bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600"
            >
                New Chat
            </button>
            <div className="space-y-2">
                {conversations.map((conv) => (
                    <button
                        key={conv.id}
                        onClick={() => onSelectConversation(conv)}
                        className={`w-full p-2 text-left rounded-lg truncate ${
                            currentConversationId === conv.id
                                ? 'bg-blue-100 text-blue-800'
                                : 'hover:bg-gray-100'
                        }`}
                    >
                        <p className="font-medium truncate">{conv.title}</p>
                        <p className="text-xs text-gray-500">
                            {new Date(conv.timestamp).toLocaleString()}
                        </p>
                    </button>
                ))}
            </div>
        </div>
    );
}