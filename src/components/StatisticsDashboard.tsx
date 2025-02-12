'use client';
import React, { useState } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import {
    MessageCircle,
    Zap,
    Bot,
    ArrowLeft,
    RefreshCcw,
    Clock,
    MessageSquare,
    FileText,
    AlertCircle,
    Activity,
    Users,
    Code,
    Image,
    Download,
    Share2,
    Palette
} from 'lucide-react';
import Link from 'next/link';
import { useStatistics } from '@/hooks/useStatistics';
import type { ModelUsage, UserStatistics } from '@/types/statistics';

interface StatCardProps {
    title: string;
    value: number | string;
    icon: React.ComponentType<any>;
    description?: string;
}

const StatCard = ({ title, value, icon: Icon, description }: StatCardProps) => (
    <div className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-theme">
        <div className="flex items-start justify-between">
            <div>
                <p className="text-theme/70 text-sm font-medium mb-1">{title}</p>
                <h3 className="text-2xl font-bold text-theme">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                </h3>
                {description && <p className="text-sm text-theme/50 mt-1">{description}</p>}
            </div>
            <div className="p-3 bg-secondary rounded-lg">
                <Icon className="w-6 h-6 text-accent" />
            </div>
        </div>
    </div>
);

const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];

const PerformanceSection = ({ data }: { data: any }) => {
    const performance = data?.performance || {
        averageLatency: 0,
        tokenProcessingRate: 0,
        streamingSpeed: 0,
        errorRecoveryRate: 0,
        successfulRequests: 0,
        failedRequests: 0,
        timeoutRate: 0
    };

    const totalRequests = performance.successfulRequests + performance.failedRequests;
    const successRate = totalRequests > 0 ? (performance.successfulRequests / totalRequests) * 100 : 0;

    return (
        <div className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-theme">
            <h3 className="text-lg font-semibold text-theme mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-accent" />
                Performance Metrics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-secondary/30 rounded-lg">
                    <h4 className="text-sm font-medium text-theme/70 mb-2">Response Times</h4>
                    <p className="text-xl font-semibold text-theme">
                        {(performance.averageLatency / 1000).toFixed(2)}s
                    </p>
                    <p className="text-sm text-theme/50">Average response time</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                    <h4 className="text-sm font-medium text-theme/70 mb-2">Success Rate</h4>
                    <p className="text-xl font-semibold text-theme">{successRate.toFixed(1)}%</p>
                    <p className="text-sm text-theme/50">Request success rate</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                    <h4 className="text-sm font-medium text-theme/70 mb-2">Token Processing</h4>
                    <p className="text-xl font-semibold text-theme">
                        {performance.tokenProcessingRate.toFixed(1)}/s
                    </p>
                    <p className="text-sm text-theme/50">Tokens processed per second</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                    <h4 className="text-sm font-medium text-theme/70 mb-2">Error Recovery</h4>
                    <p className="text-xl font-semibold text-theme">
                        {(performance.errorRecoveryRate * 100).toFixed(1)}%
                    </p>
                    <p className="text-sm text-theme/50">Error recovery rate</p>
                </div>
            </div>
        </div>
    );
};

const ContentAnalyticsSection = ({ data }: { data: any }) => {
    const content = data?.content || {
        averageWordCount: 0,
        codeBlockCount: 0,
        imageAnalysisCount: 0,
        questionFrequency: 0,
        topicDistribution: {},
        mathExpressionCount: 0,
        sentimentScores: []
    };

    return (
        <div className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-theme">
            <h3 className="text-lg font-semibold text-theme mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-accent" />
                Content Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Code className="w-4 h-4 text-theme/70" />
                        <h4 className="text-sm font-medium text-theme/70">Code Blocks</h4>
                    </div>
                    <p className="text-2xl font-bold text-theme">{content.codeBlockCount}</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <Image className="w-4 h-4 text-theme/70" />
                        <h4 className="text-sm font-medium text-theme/70">Images Analyzed</h4>
                    </div>
                    <p className="text-2xl font-bold text-theme">{content.imageAnalysisCount}</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="w-4 h-4 text-theme/70" />
                        <h4 className="text-sm font-medium text-theme/70">Questions</h4>
                    </div>
                    <p className="text-2xl font-bold text-theme">{content.questionFrequency}</p>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-theme/70" />
                        <h4 className="text-sm font-medium text-theme/70">Avg. Words</h4>
                    </div>
                    <p className="text-2xl font-bold text-theme">{Math.round(content.averageWordCount)}</p>
                </div>
            </div>

            <div className="mt-4">
                <h4 className="text-sm font-medium text-theme/70 mb-2">Topic Distribution</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(content.topicDistribution || {}).map(([topic, count]) => (
                        <div key={topic} className="p-3 bg-secondary/30 rounded-lg">
                            <p className="text-sm font-medium text-theme capitalize">{topic}</p>
                            <p className="text-lg font-bold text-theme">{count as number}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const UserBehaviorSection = ({ data }: { data: any }) => {
    const userBehavior = data?.userBehavior || {
        sessionDuration: [],
        averageSessionLength: 0,
        sessionCount: 0,
        activeTimeOfDay: {},
        activeDaysOfWeek: {},
        returnRate: 0,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
    };

    const formatDuration = (ms: number) => {
        const minutes = Math.floor(ms / 60000);
        if (minutes < 60) return `${minutes}min`;
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        return `${hours}h ${remainingMinutes}min`;
    };

    // Convert activeTimeOfDay object to array for the chart
    const hourlyData = Object.entries(userBehavior.activeTimeOfDay || {})
        .map(([hour, count]) => ({
            hour: `${hour.padStart(2, '0')}:00`,
            count: count as number
        }))
        .sort((a, b) => a.hour.localeCompare(b.hour));

    // Convert activeDaysOfWeek for display
    const dailyData = Object.entries(userBehavior.activeDaysOfWeek || {})
        .map(([day, count]) => ({
            day,
            count: count as number
        }))
        .sort((a, b) => {
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            return days.indexOf(a.day) - days.indexOf(b.day);
        });

    const maxDailyCount = Math.max(...dailyData.map(d => d.count), 1);

    return (
        <div className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-theme">
            <h3 className="text-lg font-semibold text-theme mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-accent" />
                User Behavior
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <h4 className="text-sm font-medium text-theme/70 mb-3">Session Statistics</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-secondary/30 rounded-lg">
                            <p className="text-2xl font-bold text-theme">{userBehavior.sessionCount}</p>
                            <p className="text-sm text-theme/70">Total Sessions</p>
                        </div>
                        <div className="p-4 bg-secondary/30 rounded-lg">
                            <p className="text-2xl font-bold text-theme">
                                {formatDuration(userBehavior.averageSessionLength)}
                            </p>
                            <p className="text-sm text-theme/70">Avg. Duration</p>
                        </div>
                    </div>

                    <h4 className="text-sm font-medium text-theme/70 mb-3 mt-6">Activity by Day</h4>
                    <div className="space-y-2">
                        {dailyData.map(({ day, count }) => (
                            <div key={day} className="flex items-center gap-2">
                                <span className="w-10 text-sm text-theme/70">{day}</span>
                                <div className="flex-1 h-2 bg-secondary/30 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-primary rounded-full transition-all duration-500"
                                        style={{
                                            width: `${(count / maxDailyCount) * 100}%`
                                        }}
                                    />
                                </div>
                                <span className="w-8 text-sm text-theme/70 text-right">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h4 className="text-sm font-medium text-theme/70 mb-3">Activity by Hour</h4>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={hourlyData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-theme/20" />
                                <XAxis
                                    dataKey="hour"
                                    stroke="currentColor"
                                    tick={{ fill: 'currentColor' }}
                                    className="text-theme/70"
                                />
                                <YAxis
                                    stroke="currentColor"
                                    tick={{ fill: 'currentColor' }}
                                    className="text-theme/70"
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--secondary)',
                                        border: '1px solid var(--theme)',
                                        borderRadius: '0.5rem',
                                        color: 'var(--theme)'
                                    }}
                                />
                                <Bar
                                    dataKey="count"
                                    fill="var(--primary)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface TimeRangeSelectorProps {
    value: string;
    onChange: (value: string) => void;
}

const TimeRangeSelector = ({ value, onChange }: TimeRangeSelectorProps) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-secondary backdrop-blur-sm text-theme border border-theme rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary hover:bg-secondary/70 transition-colors appearance-none cursor-pointer"
    >
        <option value="daily">Last 24 Hours</option>
        <option value="weekly">Last 7 Days</option>
        <option value="monthly">Last 30 Days</option>
        <option value="yearly">Last Year</option>
        <option value="allTime">All Time</option>
    </select>
);

export default function StatisticsDashboard() {
    const [timeRange, setTimeRange] = useState('monthly');
    const [isResetting, setIsResetting] = useState(false);
    const { statistics, setStatistics, isLoading, error } = useStatistics();

    const handleReset = async () => {
        if (window.confirm('Are you sure you want to reset all statistics? This action cannot be undone.')) {
            setIsResetting(true);
            try {
                const defaultStats: UserStatistics = {
                    daily: createEmptyPeriodStats(),
                    weekly: createEmptyPeriodStats(),
                    monthly: createEmptyPeriodStats(),
                    yearly: createEmptyPeriodStats(),
                    allTime: createEmptyPeriodStats(),
                    timeSeriesData: []
                };
                await setStatistics(defaultStats);
            } catch (error) {
                console.error('Failed to reset statistics:', error);
            } finally {
                setIsResetting(false);
            }
        }
    };

    if (isLoading) {
        return (
            <div className="p-8 bg-theme-gradient min-h-screen flex items-center justify-center">
                <div className="text-theme/70">Loading statistics...</div>
            </div>
        );
    }

    if (error || !statistics) {
        return (
            <div className="p-8 bg-theme-gradient min-h-screen flex items-center justify-center">
                <div className="text-red-400">Error loading statistics</div>
            </div>
        );
    }

    const currentStats = statistics[timeRange as keyof UserStatistics];

    return (
        <div className="p-8 bg-theme-gradient min-h-screen">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-theme bg-secondary/50 hover:bg-secondary/70 rounded-lg transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Chat</span>
                    </Link>
                    <button
                        onClick={handleReset}
                        disabled={isResetting}
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm text-red-300 bg-red-900/20 hover:bg-red-900/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <RefreshCcw className={`w-4 h-4 ${isResetting ? 'animate-spin' : ''}`} />
                        <span>{isResetting ? 'Resetting...' : 'Reset Statistics'}</span>
                    </button>
                </div>

                {/* Title and Time Range Selector */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-theme">Usage Statistics</h1>
                        <p className="text-theme/70 mt-1">Track your conversation metrics and model usage</p>
                    </div>
                    <TimeRangeSelector value={timeRange} onChange={setTimeRange} />
                </div>

                {/* Main Stats Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Tokens"
                        value={currentStats.tokens || 0}
                        icon={Zap}
                        description="Total tokens processed"
                    />
                    <StatCard
                        title="Messages"
                        value={currentStats.messages || 0}
                        icon={MessageCircle}
                        description="Total messages exchanged"
                    />
                    <StatCard
                        title="Files Processed"
                        value={currentStats.fileStats?.totalUploads || 0}
                        icon={FileText}
                        description={`${((currentStats.fileStats?.totalSize || 0) / 1024 / 1024).toFixed(2)} MB total`}
                    />
                    <StatCard
                        title="Success Rate"
                        value={`${
                            (
                                ((currentStats.performance?.successfulRequests || 0) /
                                    ((currentStats.performance?.successfulRequests || 0) +
                                        (currentStats.performance?.failedRequests || 0))) *
                                100
                            ).toFixed(1)
                        }%`}
                        icon={Activity}
                        description={`${currentStats.performance?.failedRequests || 0} failed requests`}
                    />
                </div>

                {/* Performance Section */}
                <PerformanceSection data={currentStats} />

                {/* Content Analytics Section */}
                <ContentAnalyticsSection data={currentStats} />

                {/* User Behavior Section */}
                <UserBehaviorSection data={currentStats} />

                {/* Time Series Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Token Usage Chart */}
                    <div className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-theme">
                        <h3 className="text-lg font-semibold text-theme mb-6">Token Usage Over Time</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={statistics.timeSeriesData || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-theme/20" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="currentColor"
                                        tick={{ fill: 'currentColor' }}
                                        className="text-theme/70"
                                    />
                                    <YAxis
                                        stroke="currentColor"
                                        tick={{ fill: 'currentColor' }}
                                        className="text-theme/70"
                                    />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--secondary)',
                                            border: '1px solid var(--theme)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--theme)'
                                        }}
                                    />
                                    <Line type="monotone" dataKey="tokens" stroke="var(--primary)" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Message Activity Chart */}
                    <div className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-theme">
                        <h3 className="text-lg font-semibold text-theme mb-6">Message Activity</h3>
                        <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={statistics.timeSeriesData || []}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-theme/20" />
                                    <XAxis
                                        dataKey="date"
                                        stroke="currentColor"
                                        tick={{ fill: 'currentColor' }}
                                        className="text-theme/70"
                                    />
                                    <YAxis stroke="currentColor" tick={{ fill: 'currentColor' }} className="text-theme/70" />
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'var(--secondary)',
                                            border: '1px solid var(--theme)',
                                            borderRadius: '0.5rem',
                                            color: 'var(--theme)'
                                        }}
                                    />
                                    <Bar dataKey="messages" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}