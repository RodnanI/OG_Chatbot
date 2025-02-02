'use client';
import { useState, useRef, useEffect } from 'react';
import FileUpload from './FileUpload';

interface Message {
    role: 'user' | 'assistant';
    content: string;
    fileInfo?: {
        name: string;
        type: string;
        size: number;
        text?: string;
    };
}

interface Conversation {
    id: string;
    title: string;
    timestamp: Date;
    messages: Message[];
}

export default function ChatInterface() {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Load conversations from localStorage on initial render
    useEffect(() => {
        const savedConversations = localStorage.getItem('conversations');
        if (savedConversations) {
            const parsed = JSON.parse(savedConversations);
            setConversations(parsed);
            if (parsed.length > 0 && !currentConversationId) {
                const mostRecent = parsed[parsed.length - 1];
                setCurrentConversationId(mostRecent.id);
                setMessages(mostRecent.messages);
            }
        }
    }, []);

    // Save conversations to localStorage whenever they change
    useEffect(() => {
        if (conversations.length > 0) {
            localStorage.setItem('conversations', JSON.stringify(conversations));
        }
    }, [conversations]);

    // Auto-scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const createNewConversation = () => {
        const newConversation: Conversation = {
            id: Date.now().toString(),
            title: 'New Chat',
            timestamp: new Date(),
            messages: []
        };
        setConversations(prev => [...prev, newConversation]);
        setCurrentConversationId(newConversation.id);
        setMessages([]);
    };

    const selectConversation = (conversation: Conversation) => {
        setCurrentConversationId(conversation.id);
        setMessages(conversation.messages);
    };

    const updateConversation = (messages: Message[]) => {
        if (!currentConversationId) return;

        setConversations(prev => prev.map(conv => {
            if (conv.id === currentConversationId) {
                return {
                    ...conv,
                    title: messages[0]?.content.slice(0, 30) + '...' || 'New Chat',
                    messages: messages,
                    timestamp: new Date()
                };
            }
            return conv;
        }));
    };

    const handleFileSelect = async (file: File) => {
        setSelectedFile(file);
        setIsLoading(true);

        try {
            const formData = new FormData();
            formData.append('file', file);

            if (file.type === 'application/pdf') {
                const response = await fetch('/api/process-pdf', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error('Failed to process PDF');
                }

                const data = await response.json();

                // Add file upload message to chat
                const fileMessage = {
                    role: 'user' as const,
                    content: `Uploaded PDF: ${file.name}\nNumber of pages: ${data.pages}`,
                    fileInfo: {
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        text: data.text
                    }
                };

                const updatedMessages = [...messages, fileMessage];
                setMessages(updatedMessages);

                // Send the PDF content to Claude
                const claudeResponse = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        message: "I've uploaded a PDF document. Please analyze its content: \n\n" + data.text,
                        messageHistory: updatedMessages
                    }),
                });

                if (!claudeResponse.ok) {
                    throw new Error('Failed to get Claude response');
                }

                const claudeData = await claudeResponse.json();
                const finalMessages = [...updatedMessages, { role: 'assistant', content: claudeData.message }];
                setMessages(finalMessages);
                updateConversation(finalMessages);

            } else {
                // Handle other file types or show error
                const errorMessages = [...messages, {
                    role: 'assistant',
                    content: 'Sorry, currently only PDF files are supported for processing.'
                }];
                setMessages(errorMessages);
                updateConversation(errorMessages);
            }

        } catch (error) {
            console.error('Error handling file:', error);
            const errorMessages = [...messages, {
                role: 'assistant',
                content: 'Sorry, there was an error processing your file.'
            }];
            setMessages(errorMessages);
            updateConversation(errorMessages);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        // Create new conversation if none exists
        if (!currentConversationId) {
            createNewConversation();
        }

        const userInput = input;
        const newMessages = [...messages, { role: 'user', content: userInput }];
        setMessages(newMessages);
        setInput('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userInput,
                    messageHistory: newMessages,
                    fileInfo: selectedFile ? {
                        name: selectedFile.name,
                        type: selectedFile.type,
                        size: selectedFile.size,
                    } : null
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            const data = await response.json();
            const updatedMessages = [...newMessages, { role: 'assistant', content: data.message }];
            setMessages(updatedMessages);
            updateConversation(updatedMessages);

        } catch (error) {
            console.error('Error:', error);
            const errorMessages = [...newMessages, {
                role: 'assistant',
                content: 'Sorry, there was an error processing your request.'
            }];
            setMessages(errorMessages);
            updateConversation(errorMessages);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex h-screen">
            {/* Conversation History Sidebar */}
            <div className="w-64 bg-gray-50 border-r">
                <div className="p-4">
                    <button
                        onClick={createNewConversation}
                        className="w-full mb-4 bg-blue-500 text-white rounded-lg py-2 hover:bg-blue-600 transition-colors"
                    >
                        New Chat
                    </button>
                    <div className="space-y-2">
                        {conversations.map((conv) => (
                            <button
                                key={conv.id}
                                onClick={() => selectConversation(conv)}
                                className={`w-full p-2 text-left rounded-lg transition-colors ${
                                    currentConversationId === conv.id
                                        ? 'bg-blue-100 text-blue-800'
                                        : 'hover:bg-gray-100'
                                }`}
                            >
                                <p className="font-medium truncate">{conv.title || 'New Chat'}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(conv.timestamp).toLocaleString()}
                                </p>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Chat Interface */}
            <div className="flex-1 flex flex-col bg-white">
                {/* File Upload Section */}
                <div className="p-4 border-b">
                    <FileUpload
                        onFileSelect={handleFileSelect}
                        disabled={isLoading}
                    />
                </div>

                {/* Messages Section */}
                <div className="flex-1 overflow-y-auto p-4">
                    {messages.map((message, index) => (
                        <div
                            key={index}
                            className={`mb-4 ${
                                message.role === 'user' ? 'text-right' : 'text-left'
                            }`}
                        >
                            <div
                                className={`inline-block max-w-[80%] p-3 rounded-lg ${
                                    message.role === 'user'
                                        ? 'bg-blue-500 text-white rounded-br-none'
                                        : 'bg-gray-100 text-black rounded-bl-none'
                                }`}
                            >
                                <span className="whitespace-pre-wrap">{message.content}</span>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="text-center py-2">
                            <div className="inline-block px-4 py-2 bg-gray-100 rounded-lg">
                                Thinking...
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                {/* Input Section */}
                <form onSubmit={handleSubmit} className="p-4 border-t">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Type your message..."
                            disabled={isLoading}
                        />
                        <button
                            type="submit"
                            className={`px-4 py-2 bg-blue-500 text-white rounded-lg transition-colors ${
                                isLoading
                                    ? 'opacity-50 cursor-not-allowed'
                                    : 'hover:bg-blue-600 active:bg-blue-700'
                            }`}
                            disabled={isLoading}
                        >
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}