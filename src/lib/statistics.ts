// src/lib/statistics.ts

import type { UserStatistics, StatsPeriod, TimeSeriesData, ModelUsage } from '@/types/statistics';
import type { ChatModel } from '@/components/ModelSelector';

//////////////////////////////////////////////////////////////////////////////
// 1) Helper to convert a timestamp into a YYYY-MM-DD string in local time
//////////////////////////////////////////////////////////////////////////////
function getLocalDateString(timestamp: number | string | Date): string {
    const dateObj = new Date(timestamp);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

//////////////////////////////////////////////////////////////////////////////
// 2) User behavior/time window logic (unchanged except for local date usage)
//////////////////////////////////////////////////////////////////////////////
const processUserBehavior = (messages: any[], period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'allTime'): any => {
    const now = new Date().getTime();
    let timeFrame: number;

    switch (period) {
        case 'daily':
            timeFrame = 24 * 60 * 60 * 1000; // 24 hours
            break;
        case 'weekly':
            timeFrame = 7 * 24 * 60 * 60 * 1000; // 7 days
            break;
        case 'monthly':
            timeFrame = 30 * 24 * 60 * 60 * 1000; // 30 days
            break;
        case 'yearly':
            timeFrame = 365 * 24 * 60 * 60 * 1000; // 365 days
            break;
        default:
            timeFrame = Number.POSITIVE_INFINITY;
    }

    const filteredMessages = messages.filter(m => {
        const messageTime = new Date(m.timestamp).getTime();
        return now - messageTime <= timeFrame;
    });

    const activeTimeOfDay: { [hour: number]: number } = {};
    const activeDaysOfWeek: { [day: string]: number } = {};
    let sessionDuration: number[] = [];
    let currentSession = 0;
    let lastMessageTime: number | null = null;
    const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

    filteredMessages.forEach(message => {
        const date = new Date(message.timestamp);
        const hour = date.getHours();
        const day = getDayName(date); // e.g. 'Mon', 'Tue', etc.
        const messageTime = date.getTime();

        activeTimeOfDay[hour] = (activeTimeOfDay[hour] || 0) + 1;
        activeDaysOfWeek[day] = (activeDaysOfWeek[day] || 0) + 1;

        if (lastMessageTime && messageTime - lastMessageTime > SESSION_TIMEOUT) {
            if (currentSession > 0) sessionDuration.push(currentSession);
            currentSession = 0;
        } else if (lastMessageTime) {
            currentSession += messageTime - lastMessageTime;
        }
        lastMessageTime = messageTime;
    });

    if (currentSession > 0) {
        sessionDuration.push(currentSession);
    }

    const averageSessionLength = sessionDuration.length > 0
        ? sessionDuration.reduce((a, b) => a + b, 0) / sessionDuration.length
        : 0;

    return {
        sessionDuration,
        averageSessionLength,
        sessionCount: sessionDuration.length,
        activeTimeOfDay,
        activeDaysOfWeek,
        returnRate: sessionDuration.length > 1 ? sessionDuration.length / filteredMessages.length : 0,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
};

//////////////////////////////////////////////////////////////////////////////
// 3) "Empty" StatsPeriod object
//////////////////////////////////////////////////////////////////////////////
const createEmptyPeriodStats = () => ({
    tokens: 0,
    messages: 0,
    modelUsage: [],
    activityHeatMap: {},
    commonQueries: [],
    conversationLengths: [],
    languageUsage: [],
    fileStats: {
        totalUploads: 0,
        totalSize: 0,
        byType: {},
        averageSize: 0,
        largestFile: 0,
        uploadTimes: []
    },
    performance: {
        averageLatency: 0,
        tokenProcessingRate: 0,
        streamingSpeed: 0,
        errorRecoveryRate: 0,
        successfulRequests: 0,
        failedRequests: 0,
        timeoutRate: 0
    },
    compliance: {
        piiDetections: 0,
        contentWarnings: 0,
        moderationFlags: 0,
        safetyInterventions: 0
    },
    featureUsage: {
        themeChanges: 0,
        folderOperations: {
            created: 0,
            deleted: 0,
            renamed: 0,
            moved: 0
        },
        modelSwitches: 0,
        fileUploads: 0,
        codeExecution: 0,
        imageAnalysis: 0,
        conversationExports: 0,
        markdownUsage: 0
    },
    content: {
        averageWordCount: 0,
        sentimentScores: [],
        topicDistribution: {},
        questionFrequency: 0,
        codeBlockCount: 0,
        imageAnalysisCount: 0,
        mathExpressionCount: 0
    },
    interactions: {
        averageResponseTime: 0,
        messageEditCount: 0,
        deletedMessages: 0,
        reactionCounts: {},
        userCorrectionRate: 0,
        clarificationRequests: 0
    },
    userBehavior: {
        sessionDuration: [],
        averageSessionLength: 0,
        sessionCount: 0,
        activeTimeOfDay: {},
        activeDaysOfWeek: {},
        returnRate: 0,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    }
});

//////////////////////////////////////////////////////////////////////////////
// 4) Token counting helpers (unchanged)
//////////////////////////////////////////////////////////////////////////////
export const calculateTokenCount = (text: string | undefined | null): number => {
    if (!text) return 0;
    const words = text.split(/\s+/);
    let tokenCount = 0;
    for (const word of words) {
        const specialChars = word.match(/[^a-zA-Z0-9]/g)?.length || 0;
        const remainingChars = word.length - specialChars;
        tokenCount += specialChars;
        tokenCount += Math.ceil(remainingChars / 4);
    }
    return Math.max(1, tokenCount);
};

export const calculateConversationTokens = (messages: any[]): number => {
    if (!Array.isArray(messages)) return 0;
    let totalTokens = 0;
    for (let i = 0; i < messages.length; i++) {
        const message = messages[i];
        if (!message) continue;
        totalTokens += calculateTokenCount(message.content);
        if (message.systemMessage) {
            totalTokens += calculateTokenCount(message.systemMessage);
        }
        if (message.role === 'assistant') {
            for (let j = 0; j < i; j++) {
                if (messages[j]) {
                    totalTokens += calculateTokenCount(messages[j].content);
                    if (messages[j].systemMessage) {
                        totalTokens += calculateTokenCount(messages[j].systemMessage);
                    }
                }
            }
        }
    }
    return totalTokens;
};

//////////////////////////////////////////////////////////////////////////////
// 5) This is the critical function that builds timeSeriesData for charts
//    We now use getLocalDateString() to group by local date instead of UTC.
//////////////////////////////////////////////////////////////////////////////
export const processTimeSeriesData = (messages: any[], conversations: any[]): TimeSeriesData[] => {
    const timeSeriesMap = new Map<string, TimeSeriesData>();

    // Process messages by local date
    messages.forEach(msg => {
        const date = getLocalDateString(msg.timestamp);  // e.g. "2025-02-13"
        let existing = timeSeriesMap.get(date) || {
            date,
            tokens: 0,
            messages: 0,
            averageResponseTime: 0,
            averageMessageLength: 0,
            uniqueConversations: new Set()
        };

        existing.messages++;
        existing.tokens += calculateTokenCount(msg.content || '');
        if (msg.conversationId) {
            existing.uniqueConversations.add(msg.conversationId);
        }

        timeSeriesMap.set(date, existing);
    });

    // Convert to array and format
    const timeSeriesArray = Array.from(timeSeriesMap.values())
        .map(entry => ({
            ...entry,
            uniqueConversations: entry.uniqueConversations.size
        }));

    // Optionally compute averageResponseTime or averageMessageLength here
    // if you want to incorporate more logic. For simplicity, left as-is.

    // Sort by date string
    return timeSeriesArray.sort((a, b) => a.date.localeCompare(b.date));
};

//////////////////////////////////////////////////////////////////////////////
// 6) Merging usage, model usage, aggregator logic, etc. (unchanged)
//////////////////////////////////////////////////////////////////////////////
const mergeStatistics = (current: any, update: any): any => {
    if (!current) return update;
    if (!update) return current;
    if (Array.isArray(current) && Array.isArray(update)) {
        if (current[0]?.id) {
            const merged = [...current];
            update.forEach(item => {
                if (!merged.find(m => m.id === item.id)) {
                    merged.push(item);
                }
            });
            return merged;
        }
        return [...current, ...update];
    }
    if (typeof current === 'object' && typeof update === 'object') {
        const merged = { ...current };
        for (const key in update) {
            if (key in merged) {
                if (typeof merged[key] === 'object' && typeof update[key] === 'object') {
                    merged[key] = mergeStatistics(merged[key], update[key]);
                } else if (typeof merged[key] === 'number' && typeof update[key] === 'number') {
                    merged[key] += update[key];
                } else if (typeof update[key] === 'object' && update[key] !== null) {
                    merged[key] = { ...update[key] };
                } else {
                    merged[key] = update[key];
                }
            } else {
                merged[key] = update[key];
            }
        }
        return merged;
    }
    return update;
};

const updateModelUsage = (
    currentUsage: ModelUsage[] = [],
    model?: ChatModel,
    messages: any[] = [],
    isNewSwitch: boolean = false
): ModelUsage[] => {
    if (!model) return currentUsage;
    if (!Array.isArray(messages)) messages = [];
    const existingModel = currentUsage.find(m => m.modelId === model.id);
    const totalTokens = calculateConversationTokens(messages);
    const lastMessage = messages[messages.length - 1] || {};

    if (existingModel) {
        return currentUsage.map(m =>
            m.modelId === model.id
                ? {
                    ...m,
                    usage: isNewSwitch ? m.usage + 1 : m.usage,
                    totalTokens: m.totalTokens + totalTokens,
                    averageResponseTime: messages.length > 0
                        ? (m.averageResponseTime * m.usage + (lastMessage.processingTime || 0)) / (m.usage + 1)
                        : m.averageResponseTime,
                    errorRate: messages.length > 0
                        ? ((m.errorRate * m.usage) + (lastMessage.error ? 1 : 0)) / (m.usage + 1)
                        : m.errorRate,
                    averageMessageLength: messages.length > 0
                        ? (m.averageMessageLength * m.usage + (lastMessage.content?.length || 0)) / (m.usage + 1)
                        : m.averageMessageLength,
                    costEstimate: m.costEstimate + (totalTokens * 0.000002)
                }
                : m
        );
    }

    return [
        ...currentUsage,
        {
            modelId: model.id,
            name: model.name,
            provider: model.provider,
            usage: 1,
            totalTokens,
            averageResponseTime: lastMessage.processingTime || 0,
            errorRate: lastMessage.error ? 1 : 0,
            averageMessageLength: lastMessage.content?.length || 0,
            costEstimate: totalTokens * 0.000002
        }
    ];
};

//////////////////////////////////////////////////////////////////////////////
// 7) Main updateStatistics function
//    (unchanged, except that processTimeSeriesData now does local date)
//////////////////////////////////////////////////////////////////////////////
export const updateStatistics = async (
    content: string | undefined | null,
    role: 'user' | 'assistant',
    currentStats: UserStatistics,
    selectedModel?: ChatModel,
    allMessages: any[] = [],
    allConversations: any[] = [],
    allFiles: any[] = [],
    allErrors: any[] = []
): Promise<UserStatistics> => {
    allMessages = allMessages || [];
    allConversations = allConversations || [];
    allFiles = allFiles || [];
    allErrors = allErrors || [];

    if (!currentStats) {
        const emptyStats = {
            daily: createEmptyPeriodStats(),
            weekly: createEmptyPeriodStats(),
            monthly: createEmptyPeriodStats(),
            yearly: createEmptyPeriodStats(),
            allTime: createEmptyPeriodStats(),
            timeSeriesData: []
        };
        return emptyStats;
    }

    const tokenCount = calculateTokenCount(content);

    const getStatsForPeriod = (period: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'allTime') => {
        let timeFrame: number;
        const now = new Date().getTime();
        switch (period) {
            case 'daily':
                timeFrame = 24 * 60 * 60 * 1000;
                break;
            case 'weekly':
                timeFrame = 7 * 24 * 60 * 60 * 1000;
                break;
            case 'monthly':
                timeFrame = 30 * 24 * 60 * 60 * 1000;
                break;
            case 'yearly':
                timeFrame = 365 * 24 * 60 * 60 * 1000;
                break;
            default:
                timeFrame = Number.POSITIVE_INFINITY;
        }

        const filteredFiles = (allFiles || []).filter(f => {
            if (!f || !f.timestamp) return false;
            const fileDate = new Date(f.timestamp).getTime();
            return now - fileDate <= timeFrame;
        });

        const filteredMessages = (allMessages || []).filter(m => {
            if (!m || !m.timestamp) return false;
            const messageDate = new Date(m.timestamp).getTime();
            return now - messageDate <= timeFrame;
        });

        const filteredErrors = (allErrors || []).filter(e => {
            if (!e || !e.timestamp) return false;
            const errorDate = new Date(e.timestamp).getTime();
            return now - errorDate <= timeFrame;
        });

        const existingStats = currentStats[period] || createEmptyPeriodStats();

        const stats = {
            ...existingStats,
            tokens: (existingStats.tokens || 0) + tokenCount,
            messages: (existingStats.messages || 0) + 1,
            fileStats: {
                ...existingStats.fileStats,
                totalUploads: filteredFiles.length,
                totalSize: filteredFiles.reduce((sum, f) => sum + (f.size || 0), 0),
                averageSize: filteredFiles.length > 0
                    ? filteredFiles.reduce((sum, f) => sum + (f.size || 0), 0) / filteredFiles.length
                    : 0,
                largestFile: Math.max(...filteredFiles.map(f => f.size || 0), 0),
                uploadTimes: filteredFiles.map(f => new Date(f.timestamp).getTime()),
                byType: filteredFiles.reduce((acc, file) => {
                    const type = file.type || 'unknown';
                    if (!acc[type]) acc[type] = { count: 0, totalSize: 0 };
                    acc[type].count++;
                    acc[type].totalSize += file.size || 0;
                    return acc;
                }, {} as Record<string, { count: number; totalSize: number }>)
            },
            performance: {
                ...existingStats.performance,
                averageLatency: filteredMessages.length > 0
                    ? filteredMessages.reduce((sum, m) => sum + (m.processingTime || 0), 0) / filteredMessages.length
                    : 0,
                tokenProcessingRate: filteredMessages.length > 0
                    ? tokenCount / Math.max(1, filteredMessages[filteredMessages.length - 1]?.processingTime || 1)
                    : 0,
                streamingSpeed: filteredMessages.length > 0
                    ? tokenCount / Math.max(1, filteredMessages[filteredMessages.length - 1]?.streamingTime || 1)
                    : 0,
                errorRecoveryRate: filteredMessages.length > 0
                    ? (filteredMessages.length - filteredErrors.length) / filteredMessages.length
                    : 1,
                successfulRequests: filteredMessages.length - filteredErrors.length,
                failedRequests: filteredErrors.length,
                timeoutRate: 0
            },
            content: {
                averageWordCount: filteredMessages.reduce((sum, m) => sum + (m.content?.split(/\s+/).length || 0), 0) /
                    Math.max(1, filteredMessages.length),
                sentimentScores: [],
                topicDistribution: {},
                questionFrequency: filteredMessages.filter(m => m.content?.includes('?')).length,
                codeBlockCount: filteredMessages.filter(m => m.content?.includes('```')).length,
                imageAnalysisCount: filteredFiles.filter(f => f.type?.startsWith('image/')).length,
                mathExpressionCount: filteredMessages.filter(m => m.content?.includes('$$')).length
            },
            interactions: {
                averageResponseTime: filteredMessages.length > 1
                    ? filteredMessages.reduce((sum, m, i) => {
                    if (i === 0) return 0;
                    return sum + (new Date(m.timestamp).getTime() - new Date(filteredMessages[i - 1].timestamp).getTime());
                }, 0) / (filteredMessages.length - 1)
                    : 0,
                messageEditCount: filteredMessages.filter(m => m.edited).length,
                deletedMessages: filteredMessages.filter(m => m.deleted).length,
                reactionCounts: {},
                userCorrectionRate: 0,
                clarificationRequests: filteredMessages.filter(m =>
                    m.content?.toLowerCase().includes('what do you mean') ||
                    m.content?.toLowerCase().includes('could you clarify') ||
                    m.content?.toLowerCase().includes('please explain')
                ).length
            },
            userBehavior: processUserBehavior(filteredMessages, period)
        };

        return stats;
    };

    const updatedStats: UserStatistics = {
        daily: getStatsForPeriod('daily'),
        weekly: getStatsForPeriod('weekly'),
        monthly: getStatsForPeriod('monthly'),
        yearly: getStatsForPeriod('yearly'),
        allTime: getStatsForPeriod('allTime'),
        // timeSeriesData is generated by the function we changed to local date
        timeSeriesData: processTimeSeriesData(allMessages, allConversations)
    };

    if (selectedModel && role === 'assistant') {
        const previousMessages = allMessages.slice(0, -1);
        const lastModelId = previousMessages.length > 0 ? previousMessages[previousMessages.length - 1]?.modelId : null;
        const isModelSwitch = lastModelId && lastModelId !== selectedModel.id;

        updatedStats.daily.modelUsage = updateModelUsage(currentStats.daily.modelUsage, selectedModel, [content], isModelSwitch);
        updatedStats.weekly.modelUsage = updateModelUsage(currentStats.weekly.modelUsage, selectedModel, [content], isModelSwitch);
        updatedStats.monthly.modelUsage = updateModelUsage(currentStats.monthly.modelUsage, selectedModel, [content], isModelSwitch);
        updatedStats.yearly.modelUsage = updateModelUsage(currentStats.yearly.modelUsage, selectedModel, [content], isModelSwitch);
        updatedStats.allTime.modelUsage = updateModelUsage(currentStats.allTime.modelUsage, selectedModel, [content], isModelSwitch);
    }

    // Activity Heat Map (unchanged, but note it's also local vs. UTC)
    const now = new Date();
    const dayHourKey = `${getDayName(now)}-${now.getHours()}`;
    ['daily', 'weekly', 'monthly', 'yearly', 'allTime'].forEach(period => {
        const periodStats = updatedStats[period as keyof UserStatistics];
        if (periodStats && typeof periodStats === 'object') {
            if (!periodStats.activityHeatMap) {
                periodStats.activityHeatMap = {};
            }
            periodStats.activityHeatMap[dayHourKey] = (periodStats.activityHeatMap[dayHourKey] || 0) + 1;
        }
    });

    return updatedStats;
};

//////////////////////////////////////////////////////////////////////////////
// 8) Simple day name helper for userBehavior
//////////////////////////////////////////////////////////////////////////////
function getDayName(date: Date): string {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
}

//////////////////////////////////////////////////////////////////////////////
// That's it! Now your "Token Usage Over Time" and "Message Activity" charts
// will use local date boundaries, matching your user behavior aggregator.
//////////////////////////////////////////////////////////////////////////////
