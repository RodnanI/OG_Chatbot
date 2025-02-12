// src/app/api/chat/route.ts
import { Anthropic } from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from "@google/generative-ai";
import { ReadableStream } from 'stream/web';
import type { ChatModel } from '@/components/ModelSelector';

const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
});

const nebiusClient = new OpenAI({
    baseURL: "https://api.studio.nebius.ai/v1/",
    apiKey: process.env.NEBIUS_API_KEY,
});

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

async function handleAnthropicChat(messages: any[], model: string) {
    const formattedMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
    })).filter(msg => msg.role !== 'system');

    const stream = await anthropic.messages.stream({
        model: model,
        max_tokens: 8192,
        messages: formattedMessages,
        system: "You are a helpful AI assistant that can analyze documents and help with various tasks. Always do math with latex and dollar signs."
    });

    return new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of stream) {
                    if (chunk.type === 'content_block_delta') {
                        controller.enqueue(chunk.delta.text);
                    }
                }
                controller.close();
            } catch (error) {
                console.error('Stream error:', error);
                controller.error(error);
            }
        },
        cancel() {
            stream.abort();
        }
    });
}

async function handleNebiusChat(messages: any[], model: ChatModel) {
    const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
    }));

    const stream = await nebiusClient.chat.completions.create({
        model: model.id,
        messages: formattedMessages,
        stream: true,
        max_tokens: model.maxTokens,
        temperature: model.temperature,
        top_p: model.topP
    });

    return new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    controller.enqueue(content);
                }
                controller.close();
            } catch (error) {
                console.error('Stream error:', error);
                controller.error(error);
            }
        }
    });
}

async function handleGeminiChat(messages: any[], model: string) {
    const geminiModel = genAI.getGenerativeModel({ model });

    // Map the roles to what Gemini expects
    const formattedMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    // Create chat with history
    const chat = geminiModel.startChat({
        history: formattedMessages.slice(0, -1).map(msg => ({
            role: msg.role,
            parts: msg.parts
        })),
        generationConfig: {
            maxOutputTokens: 8000,
        },
    });

    // Send the latest message
    const result = await chat.sendMessageStream(formattedMessages[formattedMessages.length - 1].parts[0].text);

    return new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of result.stream) {
                    const text = chunk.text();
                    controller.enqueue(text);
                }
                controller.close();
            } catch (error) {
                console.error('Stream error:', error);
                controller.error(error);
            }
        }
    });
}

async function handleOpenAIChat(messages: any[], model: string) {
    const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content
    })).filter(msg => msg.role !== 'system');

    const stream = await openai.chat.completions.create({
        model: model,
        messages: formattedMessages,
        stream: true
    });

    return new ReadableStream({
        async start(controller) {
            try {
                for await (const chunk of stream) {
                    const content = chunk.choices[0]?.delta?.content || '';
                    controller.enqueue(content);
                }
                controller.close();
            } catch (error) {
                console.error('Stream error:', error);
                controller.error(error);
            }
        }
    });
}

export async function POST(request: Request) {
    try {
        const { message, messageHistory, model } = await request.json();

        const messages = messageHistory
            .filter((msg: any) => msg.role !== 'system')
            .map((msg: any) => ({
                role: msg.role === 'assistant' ? 'assistant' : 'user',
                content: msg.content
            }));

        let stream: ReadableStream;

        if (model.provider === 'anthropic') {
            stream = await handleAnthropicChat(messages, model.id);
        } else if (model.provider === 'openai') {
            stream = await handleOpenAIChat(messages, model.id);
        } else if (model.provider === 'google') {
            stream = await handleGeminiChat(messages, model.id);
        } else if (model.provider === 'nebius') {
            stream = await handleNebiusChat(messages, model);
        } else {
            throw new Error('Unsupported model provider');
        }

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Transfer-Encoding': 'chunked'
            }
        });
    } catch (error) {
        console.error('Error:', error);
        let errorMessage = 'Error processing your request';
        let statusCode = 500;

        if (error instanceof Error) {
            if (error.message.includes('api key')) {
                errorMessage = 'Invalid API key configuration';
                statusCode = 401;
            } else if (error.message.includes('rate limit')) {
                errorMessage = 'Rate limit exceeded';
                statusCode = 429;
            }
        }

        return new Response(JSON.stringify({
            error: errorMessage,
            details: error instanceof Error ? error.message : 'Unknown error'
        }), {
            status: statusCode,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
        });
    }
}