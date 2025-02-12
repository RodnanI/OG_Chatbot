// src/components/ThinkingProcess.tsx
import React from 'react';
import { Brain, Sparkles } from 'lucide-react';

interface ThinkingProcessProps {
    children: React.ReactNode;
}

const ThinkingProcess = ({ children }: ThinkingProcessProps) => {
    return (
        <div className="my-4 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-lg p-4 border border-indigo-500/30">
            <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
                <div className="flex items-center gap-1">
                    <span className="text-indigo-400 font-medium">Reasoning Process</span>
                    <Sparkles className="w-4 h-4 text-purple-400" />
                </div>
            </div>
            <div className="text-gray-300 pl-7">
                {children}
            </div>
        </div>
    );
};

export default ThinkingProcess;