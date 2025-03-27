// src/components/ModelSelector.tsx
import React from 'react';
import { ChevronDown, Bot, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
        const colorMap: Record<string, string> = {
            'anthropic': 'var(--accent-anthropic)',
            'openai': 'var(--accent-openai)',
            'nebius': 'var(--accent-nebius)',
            'google': 'var(--accent-google)'
        };
        return colorMap[provider] || 'var(--accent)';
    };

    const dropdownVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.2,
                ease: "easeOut"
            }
        },
        exit: {
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.15
            }
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-card backdrop-blur-sm rounded-xl hover:bg-card-hover transition-all duration-200 border border-theme/20 shadow-sm"
            >
                <div className="flex items-center gap-2">
                    <motion.div
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: getProviderColor(selectedModel.provider) }}
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.3 }}
                    />
                    <span className="text-sm font-medium text-theme">{selectedModel.name}</span>
                    <motion.div
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <ChevronDown className="w-4 h-4 text-theme/70" />
                    </motion.div>
                </div>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        className="absolute right-0 top-full mt-2 w-64 origin-top"
                        variants={dropdownVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                    >
                        <div className="bg-card backdrop-blur-lg rounded-xl shadow-xl border border-theme/20 overflow-hidden">
                            <div className="p-3 border-b border-theme/10 bg-card-header">
                                <h4 className="text-xs font-semibold text-theme/80 uppercase tracking-wider mb-1">
                                    AI Model Selection
                                </h4>
                                <p className="text-xs text-theme/60">
                                    Choose your preferred AI model provider
                                </p>
                            </div>

                            <div className="divide-y divide-theme/10">
                                {models.map((model) => (
                                    <button
                                        key={model.id}
                                        onClick={() => {
                                            onSelectModel(model);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full px-3 py-2.5 text-left group transition-all duration-150 ${
                                            selectedModel.id === model.id
                                                ? 'bg-primary/20'
                                                : 'hover:bg-theme/5'
                                        }`}
                                    >
                                        <div className="flex items-start gap-3">
                                            <div
                                                className="w-2.5 h-2.5 rounded-full mt-1.5 shrink-0"
                                                style={{ backgroundColor: getProviderColor(model.provider) }}
                                            />
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-theme">
                                                        {model.name}
                                                    </span>
                                                    <span className="text-[10px] px-1.5 py-1 rounded-md bg-theme/10 text-theme/60 uppercase tracking-wide">
                                                        {model.provider}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-theme/60 mt-1 leading-tight">
                                                    {model.description}
                                                </p>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ModelSelector;