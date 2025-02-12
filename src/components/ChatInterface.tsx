'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Clipboard, Check, ChartBar, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import FileUpload from './FileUpload';
import FilePreviewPending from './FilePreviewPending';
import FilePreviewInChat from './FilePreviewInChat';
import FileContentModal from './FileContentModal';
import MessageContent from './MessageContent';
import FolderSidebar from './FolderSidebar';
import ModelSelector from './ModelSelector';
import ChatSharingModal from './ChatSharingModal';
import { chatModels } from '@/config/chatModels';
import type { ChatModel } from './ModelSelector';
import { useAuth } from '@/context/AuthContext';
import { useChatSync } from '@/hooks/useChatSync';
import { useStatistics } from '@/hooks/useStatistics';
import { updateStatistics } from '@/lib/statistics';
import { analyzeImages, isImageFile } from '@/lib/imageProcessing';
import { calculateTokenCount } from '@/lib/statistics';

interface FileInfo {
    name: string;
    type: string;
    size: number;
    content?: string;
}

interface Message {
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    fileInfos?: FileInfo[];
    timestamp: Date;
    processingTime?: number;
    tokenCount?: number;
    error?: {
        type: string;
        message: string;
    };
    contentAnalysis?: {
        hasCode: boolean;
        hasMath: boolean;
        hasMarkdown: boolean;
        wordCount: number;
        questionCount: number;
    };
    performanceMetrics?: {
        totalTime: number;
        streamingTime: number;
        tokensPerSecond: number;
        chunkLatency?: number;
    };
    piiDetected?: Array<{ type: string; severity: string }>;
    contentWarnings?: Array<{ type: string; severity: string }>;
    streamingStartTime?: number;
}

interface PendingFile {
    file: File;
    content: string;
}

interface Conversation {
    id: string;
    title: string;
    timestamp: Date;
    messages: Message[];
    folderId: string | null;
    modelId?: string;
    userId: string;
    folderOperations?: Array<{ type: string; timestamp: Date }>;
}

interface Folder {
    id: string;
    name: string;
    createdAt: Date;
    parentId: string | null;
    conversations: string[];
}

export default function ChatInterface() {
    const { data, setData, isLoading } = useChatSync();
    const { statistics, setStatistics } = useStatistics();
    const [folders, setFolders] = useState<Folder[]>([]);
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoadingMessage, setIsLoadingMessage] = useState(false);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [selectedModel, setSelectedModel] = useState<ChatModel>(chatModels[0]);
    const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
    const [showContentModal, setShowContentModal] = useState<number | null>(null);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messageContainerRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lastMessageRef = useRef<HTMLDivElement>(null);
    const isSaving = useRef(false);

    const { user } = useAuth();

    useEffect(() => {
        if (!isLoading && data) {
            setConversations(data.conversations || []);
            setFolders(data.folders || []);

            if (!currentConversationId && data.conversations?.length > 0) {
                const mostRecent = data.conversations[data.conversations.length - 1];
                setCurrentConversationId(mostRecent.id);
                setMessages(mostRecent.messages);
                if (mostRecent.modelId) {
                    const savedModel = chatModels.find(m => m.id === mostRecent.modelId);
                    if (savedModel) setSelectedModel(savedModel);
                }
            }
        }
    }, [data, isLoading]);

    useEffect(() => {
        if (currentConversationId && data.conversations) {
            const currentConv = data.conversations.find(
                conv => conv.id === currentConversationId
            );
            if (currentConv && JSON.stringify(currentConv.messages) !== JSON.stringify(messages)) {
                setMessages(currentConv.messages);
            }
        }
    }, [data, currentConversationId]);

    useEffect(() => {
        if (!isLoading && user && !isSaving.current) {
            setData({
                conversations,
                folders
            });
        }
    }, [conversations, folders]);

    useEffect(() => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = "auto";
            const maxHeight = 200;
            const scrollHeight = textarea.scrollHeight;
            textarea.style.height = scrollHeight > maxHeight
                ? `${maxHeight}px`
                : `${scrollHeight}px`;
            textarea.style.overflowY = scrollHeight > maxHeight ? "auto" : "hidden";
        }
    }, [input]);

    const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const scrollToBottom = () => {
        lastMessageRef.current?.scrollIntoView({ behavior: 'smooth' });
        setShouldAutoScroll(true);
    };

    const handleScroll = () => {
        if (messageContainerRef.current) {
            const { scrollTop, scrollHeight, clientHeight } = messageContainerRef.current;
            const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
            setShouldAutoScroll(isNearBottom);
            setShowScrollButton(!isNearBottom);
        }
    };

    useEffect(() => {
        const messageContainer = messageContainerRef.current;
        if (messageContainer) {
            messageContainer.addEventListener('scroll', handleScroll);
            return () => messageContainer.removeEventListener('scroll', handleScroll);
        }
    }, []);

    useEffect(() => {
        if (shouldAutoScroll && lastMessageRef.current) {
            lastMessageRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
    }, [messages, shouldAutoScroll]);

    const handleFileSelect = async (files: File[]) => {
        try {
            const processedFiles: PendingFile[] = [];
            const imageFiles: File[] = [];
            const otherFiles: File[] = [];

            files.forEach(file => {
                if (isImageFile(file)) {
                    imageFiles.push(file);
                } else {
                    otherFiles.push(file);
                }
            });

            if (imageFiles.length > 0) {
                const imageAnalyses = await analyzeImages(imageFiles);
                imageAnalyses.forEach(result => {
                    processedFiles.push({
                        file: imageFiles.find(f => f.name === result.name)!,
                        content: result.analysis
                    });
                });
            }

            for (const file of otherFiles) {
                const formData = new FormData();
                formData.append('file', file);

                const endpoint = file.type === 'application/pdf' ? '/api/process-pdf' : '/api/upload';
                const response = await fetch(endpoint, {
                    method: 'POST',
                    body: formData
                });

                if (!response.ok) {
                    throw new Error(`Failed to process file: ${file.name}`);
                }

                const data = await response.json();
                processedFiles.push({
                    file,
                    content: data.content || data.text
                });
            }

            setPendingFiles(prev => [...prev, ...processedFiles]);
        } catch (error) {
            console.error('Error processing files:', error);
        }
    };

    const handleStatisticsUpdate = async (message: Message, role: 'user' | 'assistant') => {
        if (!user || !statistics) return;

        const allMessages = messages.map(msg => ({
            ...msg,
            timestamp: msg.timestamp || new Date()
        }));

        const allConversations = conversations.map(conv => ({
            ...conv,
            timestamp: conv.timestamp || new Date(),
            folderOperations: [],
            modelId: conv.modelId || selectedModel.id
        }));

        const allFiles = allMessages.reduce((files: any[], msg) => {
            if (msg.fileInfos) {
                return [...files, ...msg.fileInfos.map(file => ({
                    ...file,
                    timestamp: msg.timestamp
                }))];
            }
            return files;
        }, []);

        const allErrors = allMessages.reduce((errors: any[], msg) => {
            if (msg.error) {
                errors.push({
                    type: msg.error.type || 'unknown',
                    timestamp: msg.timestamp,
                    message: msg.error.message
                });
            }
            return errors;
        }, []);

        const updatedStats = await updateStatistics(
            message.content,
            role,
            statistics,
            selectedModel,
            allMessages,
            allConversations,
            allFiles,
            allErrors
        );

        await setStatistics(updatedStats);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if ((!input.trim() && pendingFiles.length === 0) || isLoadingMessage || !user) return;

        if (!currentConversationId) {
            createNewConversation();
        }

        const startTime = Date.now();
        const userMessage: Message = {
            id: generateMessageId(),
            role: 'user',
            content: input,
            timestamp: new Date(),
            processingTime: 0,
            tokenCount: calculateTokenCount(input),
            fileInfos: pendingFiles.length > 0 ? pendingFiles.map(pf => ({
                name: pf.file.name,
                type: pf.file.type,
                size: pf.file.size,
                content: pf.content
            })) : undefined,
            contentAnalysis: {
                hasCode: input.includes('```'),
                hasMath: input.includes('$$'),
                hasMarkdown: /[*_#\[\]`]/.test(input),
                wordCount: input.split(/\s+/).length,
                questionCount: (input.match(/\?/g) || []).length
            },
            performanceMetrics: {
                totalTime: 0,
                streamingTime: 0,
                tokensPerSecond: 0
            }
        };

        // Detect potential PII in the message
        const piiPatterns = {
            email: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
            phone: /(\+\d{1,3}[-.]?)?\(?\d{3}\)?[-.]?\d{3}[-.]?\d{4}/g,
            creditCard: /\b\d{4}[-. ]?\d{4}[-. ]?\d{4}[-. ]?\d{4}\b/g,
            ssn: /\b\d{3}[-]?\d{2}[-]?\d{4}\b/g
        };

        const piiDetections = Object.entries(piiPatterns)
            .filter(([_, pattern]) => pattern.test(input))
            .map(([type]) => ({ type, severity: 'high' }));

        if (piiDetections.length > 0) {
            userMessage.piiDetected = piiDetections;
        }

        // Content warnings for potentially sensitive content
        const contentWarningPatterns = {
            profanity: /\b(damn|hell|ass|crap)\b/gi,
            sensitive: /\b(death|kill|harm|suicide|violence)\b/gi,
            personal: /\b(address|password|account|secret)\b/gi
        };

        const contentWarnings = Object.entries(contentWarningPatterns)
            .filter(([_, pattern]) => pattern.test(input))
            .map(([type]) => ({ type, severity: 'medium' }));

        if (contentWarnings.length > 0) {
            userMessage.contentWarnings = contentWarnings;
        }

        userMessage.processingTime = Date.now() - startTime;
        userMessage.performanceMetrics = {
            totalTime: userMessage.processingTime,
            streamingTime: 0,
            tokensPerSecond: userMessage.tokenCount! / (userMessage.processingTime / 1000)
        };

        await handleStatisticsUpdate(userMessage, 'user');

        const newMessages = [...messages, userMessage];
        setMessages(newMessages);
        setInput('');
        setPendingFiles([]);
        setShouldAutoScroll(true);

        handleChatResponse(newMessages);
    };

    const handleChatResponse = async (messageHistory: Message[]) => {
        setIsLoadingMessage(true);
        const startTime = Date.now();
        let errorOccurred = false;
        let streamingStartTime: number;

        try {
            const formattedHistory = messageHistory.map(msg => ({
                ...msg,
                content: msg.fileInfos
                    ? `${msg.content}\n\nFiles:\n${msg.fileInfos.map(file =>
                        `[${file.name}]:\n${file.content}`
                    ).join('\n\n')}`
                    : msg.content
            }));

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'text/plain'
                },
                body: JSON.stringify({
                    message: formattedHistory[formattedHistory.length - 1].content,
                    messageHistory: formattedHistory,
                    model: selectedModel
                })
            });

            if (!response.body) throw new Error('No response body');

            const assistantMessage: Message = {
                id: generateMessageId(),
                role: 'assistant',
                content: '',
                timestamp: new Date(),
                processingTime: Date.now() - startTime,
                streamingStartTime: Date.now(),
                tokenCount: 0,
                contentAnalysis: {
                    hasCode: false,
                    hasMath: false,
                    hasMarkdown: false,
                    wordCount: 0,
                    questionCount: 0
                },
                performanceMetrics: {
                    totalTime: 0,
                    streamingTime: 0,
                    tokensPerSecond: 0
                }
            };

            streamingStartTime = Date.now();

            setMessages(prev => {
                const updated = [...prev, assistantMessage];
                updateConversation(updated);
                return updated;
            });

            const reader = response.body.getReader();
            const decoder = new TextDecoder();
            let accumulatedContent = '';
            let lastChunkTime = Date.now();
            let totalTokens = 0;

            while (true) {
                const { value, done } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value, { stream: true });
                accumulatedContent += chunk;
                totalTokens += calculateTokenCount(chunk);

                const currentTime = Date.now();
                const chunkProcessingTime = currentTime - lastChunkTime;
                lastChunkTime = currentTime;

                setMessages(prev => {
                    const lastMessage = prev[prev.length - 1];
                    if (lastMessage.role === 'assistant') {
                        const updatedContent = lastMessage.content + chunk;
                        const updatedMessage = {
                            ...lastMessage,
                            content: updatedContent,
                            tokenCount: totalTokens,
                            contentAnalysis: {
                                hasCode: /```[\s\S]*?```/.test(updatedContent),
                                hasMath: /\$\$[\s\S]*?\$\$/.test(updatedContent),
                                hasMarkdown: /[*_#\[\]`]/.test(updatedContent),
                                wordCount: updatedContent.split(/\s+/).length,
                                questionCount: (updatedContent.match(/\?/g) || []).length
                            },
                            performanceMetrics: {
                                totalTime: currentTime - startTime,
                                streamingTime: currentTime - streamingStartTime,
                                tokensPerSecond: totalTokens / ((currentTime - streamingStartTime) / 1000),
                                chunkLatency: chunkProcessingTime
                            }
                        };

                        const updatedMessages = [...prev.slice(0, -1), updatedMessage];
                        updateConversation(updatedMessages);
                        return updatedMessages;
                    }
                    return prev;
                });
            }

            // Final update with complete metrics
            setMessages(prev => {
                const finalMessage = prev[prev.length - 1];
                if (finalMessage.role === 'assistant') {
                    const endTime = Date.now();
                    const updatedMessage = {
                        ...finalMessage,
                        performanceMetrics: {
                            ...finalMessage.performanceMetrics,
                            totalTime: endTime - startTime,
                            streamingTime: endTime - streamingStartTime,
                            tokensPerSecond: totalTokens / ((endTime - streamingStartTime) / 1000)
                        }
                    };

                    const updatedMessages = [...prev.slice(0, -1), updatedMessage];
                    updateConversation(updatedMessages);
                    handleStatisticsUpdate(updatedMessage, 'assistant');
                    return updatedMessages;
                }
                return prev;
            });

        } catch (error) {
            console.error('Error:', error);
            errorOccurred = true;

            const errorMessage: Message = {
                id: generateMessageId(),
                role: 'assistant',
                content: `Error: ${error instanceof Error ? error.message : 'Failed to process request'}`,
                timestamp: new Date(),
                error: {
                    type: 'processing_error',
                    message: error instanceof Error ? error.message : 'Unknown error'
                },
                performanceMetrics: {
                    totalTime: Date.now() - startTime,
                    streamingTime: 0,
                    tokensPerSecond: 0
                }
            };

            setMessages(prev => {
                const updatedMessages = [...prev, errorMessage];
                updateConversation(updatedMessages);
                handleStatisticsUpdate(errorMessage, 'assistant');
                return updatedMessages;
            });
        } finally {
            setIsLoadingMessage(false);
        }
    };

    const createNewConversation = (folderId?: string) => {
        if (!user) return;

        const newConversation: Conversation = {
            id: Date.now().toString(),
            title: 'New Chat',
            timestamp: new Date(),
            messages: [],
            folderId: folderId || null,
            modelId: selectedModel.id,
            userId: user.id,
            folderOperations: []
        };

        setConversations(prev => [...prev, newConversation]);
        setCurrentConversationId(newConversation.id);
        setMessages([]);
        setShouldAutoScroll(true);

        if (folderId) {
            setFolders(prev => prev.map(folder =>
                folder.id === folderId
                    ? { ...folder, conversations: [...folder.conversations, newConversation.id] }
                    : folder
            ));
        }

        return newConversation.id;
    };

    const updateConversation = (messages: Message[]) => {
        if (!currentConversationId || !user) return;

        isSaving.current = true;
        setConversations(prev => prev.map(conv => {
            if (conv.id === currentConversationId) {
                const firstMessage = messages.find(m => m.role === 'user');
                return {
                    ...conv,
                    title: firstMessage ? firstMessage.content.slice(0, 30) + '...' : 'New Chat',
                    messages,
                    timestamp: new Date(),
                    modelId: selectedModel.id,
                    userId: user.id
                };
            }
            return conv;
        }));
        isSaving.current = false;
    };

    const handleModelChange = (newModel: ChatModel) => {
        setSelectedModel(newModel);
        if (currentConversationId) {
            setConversations(prev => prev.map(conv =>
                conv.id === currentConversationId
                    ? { ...conv, modelId: newModel.id }
                    : conv
            ));
        }
    };

    const onMoveConversation = (conversationId: string, folderId: string | null) => {
        setFolders(prev => prev.map(folder => ({
            ...folder,
            conversations: folder.conversations.filter(id => id !== conversationId)
        })));

        if (folderId) {
            setFolders(prev => prev.map(folder =>
                folder.id === folderId
                    ? { ...folder, conversations: [...folder.conversations, conversationId] }
                    : folder
            ));
        }

        setConversations(prev => prev.map(conv =>
            conv.id === conversationId ? { ...conv, folderId } : conv
        ));
    };

    const onDeleteConversation = async (id: string) => {
        setConversations(prev => prev.map(conv =>
            conv.id === id
                ? { ...conv, deleted: true, deletedAt: new Date() }
                : conv
        ));

        if (currentConversationId === id) {
            setCurrentConversationId(null);
            setMessages([]);
        }

        if (statistics && user) {
            const deletedConv = conversations.find(conv => conv.id === id);
            if (deletedConv) {
                const updatedStats = await updateStatistics(
                    '',
                    'user',
                    statistics,
                    undefined,
                    deletedConv.messages,
                    [{ ...deletedConv, deleted: true, deletedAt: new Date() }],
                    [],
                    []
                );
                await setStatistics(updatedStats);
            }
        }
    };

    const onRenameConversation = (id: string, newTitle: string) => {
        setConversations(prev => prev.map(conv =>
            conv.id === id ? { ...conv, title: newTitle } : conv
        ));
    };

    const handleImportChats = (importedChats: any[], targetFolderId?: string | null) => {
        if (!user) return;

        const processedChats = importedChats.map(chat => ({
            ...chat,
            id: `imported_${chat.id}_${Date.now()}`,
            timestamp: new Date(chat.timestamp || Date.now()),
            userId: user.id,
            folderId: targetFolderId || null,
            messages: chat.messages.map((msg: any) => ({
                ...msg,
                timestamp: new Date(msg.timestamp || Date.now())
            }))
        }));

        setConversations(prev => [...prev, ...processedChats]);

        if (targetFolderId) {
            setFolders(prev => prev.map(folder => {
                if (folder.id === targetFolderId) {
                    return {
                        ...folder,
                        conversations: [...folder.conversations, ...processedChats.map(chat => chat.id)]
                    };
                }
                return folder;
            }));
        }

        if (!currentConversationId && processedChats.length > 0) {
            const firstChat = processedChats[0];
            setCurrentConversationId(firstChat.id);
            setMessages(firstChat.messages);
            if (firstChat.modelId) {
                const savedModel = chatModels.find(m => m.id === firstChat.modelId);
                if (savedModel) setSelectedModel(savedModel);
            }
        }

        if (!isLoading && user) {
            setData({
                conversations: [...conversations, ...processedChats],
                folders
            });
        }
    };

    const userConversations = conversations.filter(conv => conv.userId === user?.id);

    return (
        <div className="flex h-screen bg-theme-gradient">
            <FolderSidebar
                folders={folders}
                conversations={userConversations}
                currentConversationId={currentConversationId}
                onSelectConversation={(conv) => {
                    setCurrentConversationId(conv.id);
                    setMessages(conv.messages);
                    setShouldAutoScroll(true);
                    if (conv.modelId) {
                        const savedModel = chatModels.find(m => m.id === conv.modelId);
                        if (savedModel) setSelectedModel(savedModel);
                    }
                }}
                onCreateNewChat={createNewConversation}
                onCreateFolder={(name) => {
                    const newFolder: Folder = {
                        id: Date.now().toString(),
                        name,
                        createdAt: new Date(),
                        parentId: null,
                        conversations: []
                    };
                    setFolders(prev => [...prev, newFolder]);
                }}
                onMoveConversation={onMoveConversation}
                onDeleteFolder={(folderId) => {
                    const folder = folders.find(f => f.id === folderId);
                    if (folder) {
                        folder.conversations.forEach(convId => {
                            setConversations(prev => prev.map(conv =>
                                conv.id === convId ? { ...conv, folderId: null } : conv
                            ));
                        });
                        setFolders(prev => prev.filter(f => f.id !== folderId));
                    }
                }}
                onRenameFolder={(folderId, newName) => {
                    setFolders(prev => prev.map(folder =>
                        folder.id === folderId ? { ...folder, name: newName } : folder
                    ));
                }}
                onDeleteConversation={onDeleteConversation}
                onRenameConversation={onRenameConversation}
                onOpenShareModal={() => setIsShareModalOpen(true)}
            />

            <div className="flex-1 flex flex-col relative">
                <div className="absolute top-4 right-4 z-20">
                    <ModelSelector
                        models={chatModels}
                        selectedModel={selectedModel}
                        onSelectModel={handleModelChange}
                    />
                </div>

                <div ref={messageContainerRef} className="flex-1 overflow-y-auto overflow-x-hidden p-6">
                    <div className="flex flex-col-reverse min-h-full">
                        <div>
                            {messages.map((message, index) => (
                                <div
                                    key={message.id}
                                    ref={index === messages.length - 1 ? lastMessageRef : null}
                                    className={`message-bubble group flex w-full ${
                                        message.role === 'user' ? 'justify-end' : 'justify-start'
                                    } mb-6`}
                                >
                                    <div className={`relative p-4 rounded-2xl transition-all duration-200 ${
                                        message.role === 'user'
                                            ? 'bg-primary text-white rounded-br-sm'
                                            : 'bg-secondary rounded-bl-sm'
                                    } shadow-lg max-w-3xl`}>
                                        <div className="flex items-start gap-3">
                                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                                message.role === 'user' ? 'bg-primary-hover' : 'bg-secondary'
                                            }`}>
                                                {message.role === 'user' ? (
                                                    <User className="w-5 h-5 text-white" />
                                                ) : (
                                                    <Bot className="w-5 h-5 text-theme" />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                {message.fileInfos && message.fileInfos.length > 0 && (
                                                    <FilePreviewInChat
                                                        files={message.fileInfos}
                                                    />
                                                )}
                                                <MessageContent
                                                    content={message.content}
                                                    model={selectedModel.id}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div ref={messagesEndRef} />
                    </div>
                </div>

                {/* Scroll to bottom button */}
                {showScrollButton && (
                    <button
                        onClick={scrollToBottom}
                        className="fixed bottom-24 right-8 p-3 bg-primary text-white rounded-full shadow-lg hover:bg-primary-hover transition-colors z-10"
                        aria-label="Scroll to bottom"
                    >
                        <ChevronDown className="w-6 h-6" />
                    </button>
                )}

                <div className="p-4 border-t border-theme relative">
                    <div className="max-w-5xl mx-auto">
                        {pendingFiles.length > 0 && (
                            <div className="absolute bottom-full left-0 right-0 p-4 pointer-events-none">
                                <div className="max-w-5xl mx-auto">
                                    <div className="pointer-events-auto">
                                        <FilePreviewPending
                                            files={pendingFiles}
                                            onRemove={(index) => {
                                                setPendingFiles(prev => prev.filter((_, i) => i !== index));
                                            }}
                                            onView={(index) => setShowContentModal(index)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {showContentModal !== null && pendingFiles[showContentModal] && (
                            <FileContentModal
                                fileName={pendingFiles[showContentModal].file.name}
                                content={pendingFiles[showContentModal].content}
                                onClose={() => setShowContentModal(null)}
                            />
                        )}

                        <form onSubmit={handleSubmit} className="flex gap-3">
                            <FileUpload
                                onFilesSelect={handleFileSelect}
                                disabled={isLoadingMessage}
                            />
                            <div className="flex-1 relative">
                                <div className="relative flex items-center">
                                    <textarea
                                        ref={textareaRef}
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        className="w-full px-4 py-3 bg-secondary backdrop-blur-sm text-theme rounded-lg
                                            border border-theme hover:bg-secondary-hover transition-all
                                            focus:outline-none focus:ring-2 focus:ring-primary
                                            placeholder-theme/50 pr-16 resize-none overflow-x-hidden"
                                        placeholder="Ask me anything..."
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSubmit(e);
                                            }
                                        }}
                                        rows={1}
                                    />
                                    <button
                                        type="submit"
                                        className={`absolute right-2 p-2 rounded-lg transition-all duration-200 ${
                                            isLoadingMessage || (!input.trim() && pendingFiles.length === 0)
                                                ? 'bg-secondary/30 text-theme/30 cursor-not-allowed'
                                                : 'bg-primary hover:bg-primary-hover text-white'
                                        }`}
                                        disabled={isLoadingMessage || (!input.trim() && pendingFiles.length === 0)}
                                    >
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Chat Sharing Modal */}
            {isShareModalOpen && (
                <ChatSharingModal
                    isOpen={isShareModalOpen}
                    onClose={() => setIsShareModalOpen(false)}
                    conversations={conversations}
                    folders={folders}
                    onImport={handleImportChats}
                />
            )}
        </div>
    );
}