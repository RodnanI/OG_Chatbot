// src/components/ModelSelector.tsx
import React from 'react';
import { ChevronDown, Bot, Sparkles } from 'lucide-react';

export interface ChatModel {
    id: string;
    name: string;
    provider: string;
    description: string;
    apiConfigKey: string;
}

interface ModelSelectorProps {
    models: ChatModel[];
    selectedModel: ChatModel;
    onSelectModel: (model: ChatModel) => void;
}

const ModelSelector = ({ models, selectedModel, onSelectModel }: ModelSelectorProps) => {
    const [isOpen, setIsOpen] = React.useState(false);

    const getProviderColor = (provider: string) => {
        switch (provider) {
            case 'anthropic':
                return 'bg-[#e27602]';
            case 'openai':
                return 'bg-[#74f9a3]';
            case 'nebius':
                return 'bg-[#1134a6]';
            case 'google':
                return 'bg-[#ff5c5c]'; // Unique red color for Google/Gemini
            default:
                return 'bg-gray-500';
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-gray-800/50 backdrop-blur-sm rounded-lg hover:bg-gray-700/70 transition-all border border-gray-700"
            >
                <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${getProviderColor(selectedModel.provider)}`} />
                    <span className="text-sm font-medium text-gray-200">{selectedModel.name}</span>
                    <ChevronDown className="w-4 h-4 text-gray-400" />
                </div>
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 rounded-lg shadow-xl border border-gray-800 overflow-hidden z-50">
                    <div className="p-3 border-b border-gray-800 bg-gray-900">
                        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">
                            AI Model Selection
                        </h4>
                        <p className="text-xs text-gray-500">
                            Choose your preferred AI model provider
                        </p>
                    </div>

                    <div className="divide-y divide-gray-800">
                        {models.map((model) => (
                            <button
                                key={model.id}
                                onClick={() => {
                                    onSelectModel(model);
                                    setIsOpen(false);
                                }}
                                className={`w-full px-3 py-2.5 text-left group transition-colors ${
                                    selectedModel.id === model.id
                                        ? 'bg-blue-900/20'
                                        : 'hover:bg-gray-800/50'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${getProviderColor(model.provider)}`} />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-gray-200">
                                                {model.name}
                                            </span>
                                            <span className="text-[10px] px-1.5 py-1 rounded-md bg-gray-800 text-gray-400 uppercase tracking-wide">
                                                {model.provider}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-1 leading-tight">
                                            {model.description}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ModelSelector;