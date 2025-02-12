// src/config/chatModels.ts
export const chatModels = [
    {
        id: "claude-3-5-sonnet-20241022",
        name: "Claude 3.5 Sonnet",
        provider: "anthropic",
        description: "Advanced AI for analysis and complex tasks",
        apiConfigKey: "ANTHROPIC_API_KEY"
    },
    {
        id: "gpt-4-turbo-preview",
        name: "GPT-4 Turbo",
        provider: "openai",
        description: "Latest GPT-4 model with enhanced capabilities",
        apiConfigKey: "OPENAI_API_KEY"
    },
    {
        id: "gpt-3.5-turbo",
        name: "GPT-3.5 Turbo",
        provider: "openai",
        description: "Fast and efficient for general tasks",
        apiConfigKey: "OPENAI_API_KEY"
    },
    {
        id: "deepseek-ai/DeepSeek-R1",
        name: "Deepseek R1",
        provider: "nebius",
        description: "Powerful model for complex reasoning tasks",
        apiConfigKey: "NEBIUS_API_KEY",
        maxTokens: 8192,
        temperature: 0.6,
        topP: 0.95
    },
    {
        id: "gemini-2.0-flash",
        name: "Gemini 2.0 Flash",
        provider: "google",
        description: "Fast, efficient model for general tasks",
        apiConfigKey: "GOOGLE_API_KEY"
    },
];