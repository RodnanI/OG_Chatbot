// src/app/api/share-chat/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { notifyClients } from '../sync/stream/route';

const DATA_DIR = path.join(process.cwd(), 'data');

async function ensureUserData(userId: string) {
    const userDataPath = path.join(DATA_DIR, `user_${userId}.json`);
    try {
        await fs.access(userDataPath);
    } catch {
        // If no data exists, create a default structure
        const defaultData = {
            conversations: [],
            folders: [
                {
                    id: 'inbox',
                    name: 'Inbox',
                    conversations: [],
                    createdAt: new Date(),
                    parentId: null
                }
            ]
        };
        await fs.writeFile(userDataPath, JSON.stringify(defaultData, null, 2));
    }
    return userDataPath;
}

export async function POST(request: Request) {
    try {
        const { senderId, recipientId, chat } = await request.json();
        if (!senderId || !recipientId || !chat) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Load recipient's data
        const userDataPath = await ensureUserData(recipientId);
        const dataStr = await fs.readFile(userDataPath, 'utf-8');
        const data = JSON.parse(dataStr);

        // Ensure an "Inbox" folder exists
        let inboxFolder = data.folders.find((f: any) => f.id === 'inbox');
        if (!inboxFolder) {
            inboxFolder = {
                id: 'inbox',
                name: 'Inbox',
                conversations: [],
                createdAt: new Date(),
                parentId: null
            };
            data.folders.push(inboxFolder);
        }

        // Create a new shared conversation with explicit properties
        const newConversation = {
            id: `shared_${Date.now()}`,
            title: chat.title || 'Shared Chat',
            messages: chat.messages,
            timestamp: new Date(),
            sharedFrom: senderId,
            folderId: 'inbox', // Explicitly set the folderId
            userId: recipientId, // Add userId for filtering
            modelId: chat.modelId // Preserve the model ID if it exists
        };

        // Add the conversation to the main conversations array
        data.conversations.push(newConversation);

        // Add the conversation ID to the Inbox folder's conversations array
        inboxFolder.conversations.push(newConversation.id);

        // Save the updated data
        await fs.writeFile(userDataPath, JSON.stringify(data, null, 2));

        // Notify clients of the update
        await notifyClients(recipientId, data);

        return NextResponse.json({
            success: true,
            conversation: newConversation
        });
    } catch (error: any) {
        console.error('Error sharing chat:', error);
        return NextResponse.json({
            error: error.message || 'Unknown error',
            details: error.stack
        }, { status: 500 });
    }
}