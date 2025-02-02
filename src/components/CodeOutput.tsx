'use client';
import { X } from 'lucide-react';

interface CodeOutputProps {
    output: string;
    language: string;
    originalCode: string;
    onClose: () => void;
}

export default function CodeOutput({ output, language, originalCode, onClose }: CodeOutputProps) {
    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg w-[800px] max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h3 className="text-lg font-semibold text-white">
                        Code Output - {language.toUpperCase()}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-4 space-y-4">
                    {/* Original Code */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Original Code:</h4>
                        <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto">
              <code className={`language-${language}`}>{originalCode}</code>
            </pre>
                    </div>

                    {/* Output */}
                    <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Output:</h4>
                        {language === 'html' ? (
                            <div
                                className="bg-white rounded-lg overflow-hidden"
                                dangerouslySetInnerHTML={{ __html: output }}
                            />
                        ) : (
                            <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-white">
                {output}
              </pre>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}