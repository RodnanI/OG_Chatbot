export interface TimeSeriesData {
    date: string;
    tokens: number;
    messages: number;
    averageResponseTime: number;
    averageMessageLength: number;
    uniqueConversations: number;
}

export interface ModelUsage {
    modelId: string;
    name: string;
    provider: string;
    usage: number;
    averageResponseTime: number;
    totalTokens: number;
    errorRate: number;
    averageMessageLength: number;
    costEstimate: number;
}

export interface ActivityHeatMapData {
    [key: string]: number; // Format: "Day-Hour": count
}

export interface WordCloudItem {
    text: string;
    count: number;
}

export interface ConversationLengthData {
    range: string;
    count: number;
}

export interface LanguageUsage {
    language: string;
    count: number;
    totalBytes: number;
}

export interface FileStatistics {
    totalUploads: number;
    totalSize: number;
    byType: {
        [key: string]: {
            count: number;
            totalSize: number;
        }
    };
    averageSize: number;
    largestFile: number;
    uploadTimes: number[]; // Array of timestamps for trending
}

export interface ErrorStatistics {
    totalErrors: number;
    byType: {
        [key: string]: number;
    };
    mostCommonError: string;
    errorRate: number;
}

export interface InteractionMetrics {
    averageResponseTime: number;
    messageEditCount: number;
    deletedMessages: number;
    reactionCounts: {
        [key: string]: number; // emoji reactions
    };
    userCorrectionRate: number;
    clarificationRequests: number;
}

export interface ContentAnalytics {
    averageWordCount: number;
    sentimentScores: number[];
    topicDistribution: {
        [key: string]: number;
    };
    questionFrequency: number;
    codeBlockCount: number;
    imageAnalysisCount: number;
    mathExpressionCount: number;
}

export interface UserBehavior {
    sessionDuration: number[];
    averageSessionLength: number;
    sessionCount: number;
    activeTimeOfDay: {
        [hour: number]: number;
    };
    activeDaysOfWeek: {
        [day: string]: number;
    };
    returnRate: number;
    timeZone: string;
}

export interface FeatureUsage {
    themeChanges: number;
    folderOperations: {
        created: number;
        deleted: number;
        renamed: number;
        moved: number;
    };
    modelSwitches: number;
    fileUploads: number;
    codeExecution: number;
    imageAnalysis: number;
    conversationExports: number;
    markdownUsage: number;
}

export interface ConversationMetrics {
    averageLength: number;
    maxLength: number;
    minLength: number;
    topicContinuity: number;
    branchingFactor: number;
    contextWindowUtilization: number;
    completionRate: number;
    abandonmentRate: number;
}

export interface PerformanceMetrics {
    averageLatency: number;
    tokenProcessingRate: number;
    streamingSpeed: number;
    errorRecoveryRate: number;
    successfulRequests: number;
    failedRequests: number;
    timeoutRate: number;
}

export interface ComplianceMetrics {
    piiDetections: number;
    contentWarnings: number;
    moderationFlags: number;
    safetyInterventions: number;
}

export interface StatsPeriod {
    tokens: number;
    messages: number;
    modelUsage: ModelUsage[];
    activityHeatMap: ActivityHeatMapData;
    commonQueries: WordCloudItem[];
    conversationLengths: ConversationLengthData[];
    languageUsage: LanguageUsage[];
    fileStats: FileStatistics;
    errors: ErrorStatistics;
    interactions: InteractionMetrics;
    content: ContentAnalytics;
    userBehavior: UserBehavior;
    featureUsage: FeatureUsage;
    conversationMetrics: ConversationMetrics;
    performance: PerformanceMetrics;
    compliance: ComplianceMetrics;
}

export interface UserStatistics {
    daily: StatsPeriod;
    weekly: StatsPeriod;
    monthly: StatsPeriod;
    yearly: StatsPeriod;
    allTime: StatsPeriod;
    timeSeriesData: TimeSeriesData[];
}