import {
    ActivityHeatMapData,
    WordCloudItem,
    ConversationLengthData,
    LanguageUsage,
    FileStatistics,
    ErrorStatistics,
    InteractionMetrics,
    ContentAnalytics,
    UserBehavior,
    FeatureUsage,
    ConversationMetrics,
    PerformanceMetrics,
    ComplianceMetrics,
    TimeSeriesData
} from '@/types/statistics';

// Helper function to get day name
const getDayName = (date: Date): string => {
    return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()];
};

// Process common queries and word frequency
export const processCommonQueries = (messages: Array<{ content: string }>): WordCloudItem[] => {
    const wordCount: { [key: string]: number } = {};
    const stopWords = new Set(['the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at']);

    messages.forEach(message => {
        const words = message.content
            .toLowerCase()
            .replace(/[^\w\s]/g, '')
            .split(/\s+/)
            .filter(word => word.length > 3 && !stopWords.has(word));

        words.forEach(word => {
            wordCount[word] = (wordCount[word] || 0) + 1;
        });
    });

    return Object.entries(wordCount)
        .map(([text, count]) => ({ text, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 50);
};

// Process conversation lengths
export const processConversationLengths = (conversations: Array<{ messages: any[] }>): ConversationLengthData[] => {
    const ranges = [
        { min: 1, max: 5, label: '1-5' },
        { min: 6, max: 10, label: '6-10' },
        { min: 11, max: 15, label: '11-15' },
        { min: 16, max: 20, label: '16-20' },
        { min: 21, max: Infinity, label: '20+' }
    ];

    return ranges.map(range => ({
        range: range.label,
        count: conversations.filter(conv => {
            const messageCount = conv.messages.length;
            return messageCount >= range.min && messageCount <= range.max;
        }).length
    }));
};

// Process activity patterns
export const processActivityPatterns = (messages: Array<{ timestamp: Date }>): ActivityHeatMapData => {
    const activityMap: ActivityHeatMapData = {};
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    days.forEach(day => {
        hours.forEach(hour => {
            activityMap[`${day}-${hour}`] = 0;
        });
    });

    messages.forEach(message => {
        const date = new Date(message.timestamp);
        const day = getDayName(date);
        const hour = date.getHours();
        const key = `${day}-${hour}`;
        activityMap[key] = (activityMap[key] || 0) + 1;
    });

    return activityMap;
};

// Process language usage
export const processLanguageUsage = (messages: Array<{ content: string }>): LanguageUsage[] => {
    const languages = new Map<string, { count: number; totalBytes: number }>();

    messages.forEach(message => {
        const hasCode = /```[\s\S]*?```/.test(message.content);
        const hasMath = /\$\$[\s\S]*?\$\$/.test(message.content);
        const hasMarkdown = /[*_#\[\]`]/.test(message.content);

        if (hasCode) {
            const lang = languages.get('code') || { count: 0, totalBytes: 0 };
            languages.set('code', {
                count: lang.count + 1,
                totalBytes: lang.totalBytes + message.content.length
            });
        }
        if (hasMath) {
            const lang = languages.get('math') || { count: 0, totalBytes: 0 };
            languages.set('math', {
                count: lang.count + 1,
                totalBytes: lang.totalBytes + message.content.length
            });
        }
        if (hasMarkdown) {
            const lang = languages.get('markdown') || { count: 0, totalBytes: 0 };
            languages.set('markdown', {
                count: lang.count + 1,
                totalBytes: lang.totalBytes + message.content.length
            });
        }
    });

    return Array.from(languages.entries()).map(([language, stats]) => ({
        language,
        count: stats.count,
        totalBytes: stats.totalBytes
    }));
};

// Process file statistics
export const processFileStatistics = (files: Array<{
    size: number;
    type: string;
    timestamp: number
}>): FileStatistics => {
    const byType: { [key: string]: { count: number; totalSize: number } } = {};
    let totalSize = 0;
    let largestFile = 0;

    files.forEach(file => {
        totalSize += file.size;
        largestFile = Math.max(largestFile, file.size);

        if (!byType[file.type]) {
            byType[file.type] = { count: 0, totalSize: 0 };
        }
        byType[file.type].count++;
        byType[file.type].totalSize += file.size;
    });

    return {
        totalUploads: files.length,
        totalSize,
        byType,
        averageSize: files.length > 0 ? totalSize / files.length : 0,
        largestFile,
        uploadTimes: files.map(f => f.timestamp)
    };
};

// Process error statistics
export const processErrorStatistics = (errors: Array<{ type: string }>): ErrorStatistics => {
    const byType: { [key: string]: number } = {};
    let mostCommonError = '';
    let maxCount = 0;

    errors.forEach(error => {
        byType[error.type] = (byType[error.type] || 0) + 1;
        if (byType[error.type] > maxCount) {
            maxCount = byType[error.type];
            mostCommonError = error.type;
        }
    });

    return {
        totalErrors: errors.length,
        byType,
        mostCommonError,
        errorRate: errors.length / (errors.length + 1000) // Assuming 1000 successful operations
    };
};

// Process interaction metrics
export const processInteractionMetrics = (messages: Array<{
    timestamp: Date;
    edited?: boolean;
    deleted?: boolean;
    reactions?: string[];
    content?: string;
}>): InteractionMetrics => {
    let totalResponseTime = 0;
    let responseCount = 0;
    let editCount = 0;
    let deleteCount = 0;
    const reactionCounts: { [key: string]: number } = {};

    messages.forEach((msg, index) => {
        if (index > 0) {
            const timeDiff = new Date(msg.timestamp).getTime() - new Date(messages[index - 1].timestamp).getTime();
            totalResponseTime += timeDiff;
            responseCount++;
        }

        if (msg.edited) editCount++;
        if (msg.deleted) deleteCount++;

        msg.reactions?.forEach(reaction => {
            reactionCounts[reaction] = (reactionCounts[reaction] || 0) + 1;
        });
    });

    const clarificationRequests = messages.filter(m =>
        m.content && /what|clarify|explain|mean/i.test(m.content)
    ).length;

    return {
        averageResponseTime: responseCount > 0 ? totalResponseTime / responseCount : 0,
        messageEditCount: editCount,
        deletedMessages: deleteCount,
        reactionCounts,
        userCorrectionRate: editCount / messages.length,
        clarificationRequests
    };
};

// Process content analytics
export const processContentAnalytics = (messages: Array<{ content: string }>): ContentAnalytics => {
    const wordCounts = messages.map(m => m.content.split(/\s+/).length);
    const averageWordCount = wordCounts.reduce((a, b) => a + b, 0) / messages.length;

    // Simple sentiment analysis based on keywords
    const sentimentScores = messages.map(m => {
        const positive = (m.content.match(/\b(good|great|excellent|amazing|happy|love|wonderful)\b/gi) || []).length;
        const negative = (m.content.match(/\b(bad|poor|terrible|awful|sad|hate|worst)\b/gi) || []).length;
        return (positive - negative) / (positive + negative + 1);
    });

    // Topic detection
    const topics: { [key: string]: number } = {};
    const topicKeywords = {
        'technology': /\b(computer|software|hardware|tech|code|programming)\b/gi,
        'science': /\b(science|physics|chemistry|biology|research)\b/gi,
        'math': /\b(math|calculation|equation|number|formula)\b/gi,
        'general': /\b(help|question|how|what|why)\b/gi
    };

    messages.forEach(m => {
        Object.entries(topicKeywords).forEach(([topic, regex]) => {
            const matches = (m.content.match(regex) || []).length;
            topics[topic] = (topics[topic] || 0) + matches;
        });
    });

    return {
        averageWordCount,
        sentimentScores,
        topicDistribution: topics,
        questionFrequency: messages.filter(m => /\?/.test(m.content)).length,
        codeBlockCount: messages.filter(m => /```[\s\S]*?```/.test(m.content)).length,
        imageAnalysisCount: messages.filter(m => /!\[.*?\]\(.*?\)/.test(m.content)).length,
        mathExpressionCount: messages.filter(m => /\$\$[\s\S]*?\$\$/.test(m.content)).length
    };
};

// Process user behavior
export const processUserBehavior = (
    messages: Array<{ timestamp: Date }>,
    sessionTimeout: number = 30 * 60 * 1000 // 30 minutes
): UserBehavior => {
    const sessions: number[] = [];
    let currentSession = 0;
    let lastMessageTime: number | null = null;

    const activeTimeOfDay: { [hour: number]: number } = {};
    const activeDaysOfWeek: { [day: string]: number } = {};

    messages.forEach(msg => {
        const timestamp = new Date(msg.timestamp).getTime();
        const hour = new Date(msg.timestamp).getHours();
        const day = getDayName(new Date(msg.timestamp));

        activeTimeOfDay[hour] = (activeTimeOfDay[hour] || 0) + 1;
        activeDaysOfWeek[day] = (activeDaysOfWeek[day] || 0) + 1;

        if (lastMessageTime && timestamp - lastMessageTime > sessionTimeout) {
            if (currentSession > 0) sessions.push(currentSession);
            currentSession = 0;
        }
        currentSession += lastMessageTime ? (timestamp - lastMessageTime) : 0;
        lastMessageTime = timestamp;
    });

    if (currentSession > 0) sessions.push(currentSession);

    return {
        sessionDuration: sessions,
        averageSessionLength: sessions.length > 0 ? sessions.reduce((a, b) => a + b, 0) / sessions.length : 0,
        sessionCount: sessions.length,
        activeTimeOfDay,
        activeDaysOfWeek,
        returnRate: sessions.length > 1 ? sessions.length / messages.length : 0,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };
};

// Process feature usage
export const processFeatureUsage = (events: Array<{
    type: string;
    subType?: string;
}>): FeatureUsage => {
    const folderOps = {
        created: 0,
        deleted: 0,
        renamed: 0,
        moved: 0
    };

    events.forEach(event => {
        if (event.type === 'folder' && event.subType) {
            folderOps[event.subType as keyof typeof folderOps]++;
        }
    });

    return {
        themeChanges: events.filter(e => e.type === 'theme').length,
        folderOperations: folderOps,
        modelSwitches: events.filter(e => e.type === 'model').length,
        fileUploads: events.filter(e => e.type === 'file').length,
        codeExecution: events.filter(e => e.type === 'code').length,
        imageAnalysis: events.filter(e => e.type === 'image').length,
        conversationExports: events.filter(e => e.type === 'export').length,
        markdownUsage: events.filter(e => e.type === 'markdown').length
    };
};

// Process performance metrics
export const processPerformanceMetrics = (events: Array<{
    type: string;
    duration: number;
    success: boolean;
    tokenCount?: number;
}>): PerformanceMetrics => {
    const successfulEvents = events.filter(e => e.success);
    const failedEvents = events.filter(e => !e.success);
    const timeouts = events.filter(e => e.type === 'timeout');

    const totalTokens = events.reduce((sum, e) => sum + (e.tokenCount || 0), 0);
    const totalDuration = events.reduce((sum, e) => sum + e.duration, 0);

    return {
        averageLatency: events.length > 0 ? totalDuration / events.length : 0,
        tokenProcessingRate: totalDuration > 0 ? totalTokens / totalDuration : 0,
        streamingSpeed: totalTokens / (totalDuration / 1000), // tokens per second
        errorRecoveryRate: failedEvents.length > 0 ?
            successfulEvents.length / (failedEvents.length + successfulEvents.length) : 1,
        successfulRequests: successfulEvents.length,
        failedRequests: failedEvents.length,
        timeoutRate: events.length > 0 ? timeouts.length / events.length : 0
    };
};

// Process time series data
export const processTimeSeriesData = (
    messages: Array<{
        timestamp: Date;
        content: string;
        tokenCount?: number;
        processingTime?: number;
    }>[],
    conversations: Array<{ timestamp: Date; id: string; }>
): TimeSeriesData[] => {
    const timeSeriesMap = new Map<string, TimeSeriesData>();

    messages.forEach(msg => {
        const date = new Date(msg.timestamp).toISOString().split('T')[0];
        const existing = timeSeriesMap.get(date) || {
            date,
            tokens: 0,
            messages: 0,
            averageResponseTime: 0,
            averageMessageLength: 0,
            uniqueConversations: 0
        };

        existing.tokens += msg.tokenCount || 0;
        existing.messages += 1;
        existing.averageMessageLength =
            (existing.averageMessageLength * (existing.messages - 1) + msg.content.length) /
            existing.messages;

        timeSeriesMap.set(date, existing);
    });

    // Process conversation metrics
    conversations.forEach(conv => {
        const date = new Date(conv.timestamp).toISOString().split('T')[0];
        const existing = timeSeriesMap.get(date);
        if (existing) {
            existing.uniqueConversations += 1;
        }
    });

    // Calculate response times
    messages.forEach((msg, index) => {
        if (index > 0) {
            const date = new Date(msg.timestamp).toISOString().split('T')[0];
            const existing = timeSeriesMap.get(date);
            if (existing && msg.processingTime) {
                existing.averageResponseTime =
                    (existing.averageResponseTime * (existing.messages - 1) + msg.processingTime) /
                    existing.messages;
            }
        }
    });

    return Array.from(timeSeriesMap.values()).sort((a, b) => a.date.localeCompare(b.date));
};

// Filter data by time period
export const filterByPeriod = (
    data: any[],
    period: 'daily' | 'weekly' | 'monthly' | 'yearly'
) => {
    const now = new Date();
    const periodMap = {
        daily: 24 * 60 * 60 * 1000,
        weekly: 7 * 24 * 60 * 60 * 1000,
        monthly: 30 * 24 * 60 * 60 * 1000,
        yearly: 365 * 24 * 60 * 60 * 1000
    };

    const cutoff = new Date(now.getTime() - periodMap[period]);
    return data.filter(item => new Date(item.timestamp) > cutoff);
};

// Process conversation metrics
export const processConversationMetrics = (conversations: Array<{
    messages: any[];
    timestamp: Date;
}>): ConversationMetrics => {
    const lengths = conversations.map(c => c.messages.length);
    const completedConvs = conversations.filter(c =>
        c.messages.length > 1 &&
        c.messages[c.messages.length - 1].role === 'assistant'
    ).length;

    return {
        averageLength: lengths.reduce((a, b) => a + b, 0) / lengths.length,
        maxLength: Math.max(...lengths),
        minLength: Math.min(...lengths),
        topicContinuity: 0.8, // Placeholder - would need more sophisticated analysis
        branchingFactor: 1.2, // Placeholder - would need conversation tree analysis
        contextWindowUtilization: 0.7, // Placeholder - would need token counting
        completionRate: completedConvs / conversations.length,
        abandonmentRate: 1 - (completedConvs / conversations.length)
    };
};

// Process all statistics for a specific time period
export const processStatisticsForPeriod = (
    messages: any[],
    conversations: any[],
    files: any[],
    errors: any[],
    events: any[],
    period: 'daily' | 'weekly' | 'monthly' | 'yearly'
) => {
    const filteredMessages = filterByPeriod(messages, period);
    const filteredConversations = filterByPeriod(conversations, period);
    const filteredFiles = filterByPeriod(files, period);
    const filteredErrors = filterByPeriod(errors, period);
    const filteredEvents = filterByPeriod(events, period);

    return {
        activityHeatMap: processActivityPatterns(filteredMessages),
        commonQueries: processCommonQueries(filteredMessages),
        conversationLengths: processConversationLengths(filteredConversations),
        languageUsage: processLanguageUsage(filteredMessages),
        fileStats: processFileStatistics(filteredFiles),
        errors: processErrorStatistics(filteredErrors),
        interactions: processInteractionMetrics(filteredMessages),
        content: processContentAnalytics(filteredMessages),
        userBehavior: processUserBehavior(filteredMessages),
        featureUsage: processFeatureUsage(filteredEvents),
        conversationMetrics: processConversationMetrics(filteredConversations),
        performance: processPerformanceMetrics(
            filteredEvents.filter(e => e.type === 'performance')
        )
    };
};

// Calculate metrics for monitoring and optimization
export const calculateMetrics = {
    averageResponseTime: (messages: any[]): number => {
        let totalTime = 0;
        let count = 0;

        for (let i = 1; i < messages.length; i++) {
            if (messages[i].role === 'assistant' && messages[i-1].role === 'user') {
                const timeDiff = new Date(messages[i].timestamp).getTime() -
                    new Date(messages[i-1].timestamp).getTime();
                totalTime += timeDiff;
                count++;
            }
        }

        return count > 0 ? totalTime / count : 0;
    },

    tokenUtilization: (messages: any[]): number => {
        const totalTokens = messages.reduce((sum, msg) => sum + (msg.tokenCount || 0), 0);
        const maxTokens = messages.length * 8192; // Assuming 8k context window
        return maxTokens > 0 ? totalTokens / maxTokens : 0;
    },

    userEngagement: (messages: any[]): number => {
        const userMessages = messages.filter(m => m.role === 'user').length;
        return messages.length > 0 ? userMessages / messages.length : 0;
    },

    errorRate: (events: any[]): number => {
        const errors = events.filter(e => e.type === 'error').length;
        return events.length > 0 ? errors / events.length : 0;
    },

    featureAdoption: (events: any[], featureType: string): number => {
        const featureUses = events.filter(e => e.type === featureType).length;
        const uniqueUsers = new Set(events.map(e => e.userId)).size;
        return uniqueUsers > 0 ? featureUses / uniqueUsers : 0;
    }
};

// Export main statistics processing function
export const processStatistics = {
    initialize: () => ({
        daily: processStatisticsForPeriod([], [], [], [], [], 'daily'),
        weekly: processStatisticsForPeriod([], [], [], [], [], 'weekly'),
        monthly: processStatisticsForPeriod([], [], [], [], [], 'monthly'),
        yearly: processStatisticsForPeriod([], [], [], [], [], 'yearly'),
        allTime: processStatisticsForPeriod([], [], [], [], [], 'yearly'),
        timeSeriesData: []
    }),

    process: (
        messages: any[],
        conversations: any[],
        files: any[],
        errors: any[],
        events: any[]
    ) => ({
        daily: processStatisticsForPeriod(messages, conversations, files, errors, events, 'daily'),
        weekly: processStatisticsForPeriod(messages, conversations, files, errors, events, 'weekly'),
        monthly: processStatisticsForPeriod(messages, conversations, files, errors, events, 'monthly'),
        yearly: processStatisticsForPeriod(messages, conversations, files, errors, events, 'yearly'),
        allTime: processStatisticsForPeriod(messages, conversations, files, errors, events, 'yearly'),
        timeSeriesData: processTimeSeriesData(messages, conversations)
    })
};