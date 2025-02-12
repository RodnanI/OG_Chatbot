//src/components/CodeBlock.tsx
import React, { useEffect, useState } from 'react';
import { Copy, Check, Play, Loader } from 'lucide-react';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-bash';

interface CodeBlockProps {
    code: string;
    language: string;
    onRun?: (code: string, language: string) => void;
    isRunnable?: boolean;
}

const CodeBlock: React.FC<CodeBlockProps> = ({
                                                 code,
                                                 language,
                                                 onRun,
                                                 isRunnable = false
                                             }) => {
    const [isCopied, setIsCopied] = useState(false);
    const [isRunning, setIsRunning] = useState(false);
    const [showButtons, setShowButtons] = useState(false);

    useEffect(() => {
        Prism.highlightAll();
    }, [code, language]);

    const handleCopy = async () => {
        await navigator.clipboard.writeText(code);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
    };

    const handleRun = async () => {
        if (!onRun) return;

        setIsRunning(true);
        try {
            await onRun(code, language);
        } finally {
            setIsRunning(false);
        }
    };

    return (
        <div
            className="relative my-6 group"
            onMouseEnter={() => setShowButtons(true)}
            onMouseLeave={() => setShowButtons(false)}
        >
            <div className="flex items-center justify-between px-4 py-2 bg-gray-900 rounded-t-lg">
        <span className="text-sm font-mono text-gray-400">
          {language}
        </span>

                <div className={`flex items-center gap-2 transition-opacity ${
                    showButtons ? 'opacity-100' : 'opacity-0'
                }`}>
                    <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-md hover:bg-gray-800 transition-colors"
                        title={isCopied ? "Copied!" : "Copy code"}
                    >
                        {isCopied ? (
                            <Check className="w-4 h-4 text-green-400" />
                        ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                        )}
                    </button>
                    {isRunnable && (
                        <button
                            onClick={handleRun}
                            disabled={isRunning}
                            className={`p-1.5 rounded-md transition-colors ${
                                isRunning
                                    ? 'bg-blue-600/50 cursor-not-allowed'
                                    : 'hover:bg-blue-600/50 bg-blue-600/30'
                            }`}
                            title={isRunning ? "Running..." : "Run code"}
                        >
                            {isRunning ? (
                                <Loader className="w-4 h-4 text-blue-400 animate-spin" />
                            ) : (
                                <Play className="w-4 h-4 text-blue-400" />
                            )}
                        </button>
                    )}
                </div>
            </div>

            <pre className="!m-0 !rounded-t-none overflow-x-auto bg-gray-900 p-4 line-numbers">
        <code className={`language-${language}`}>
          {code}
        </code>
      </pre>
            <div className="absolute inset-0 rounded-lg ring-1 ring-inset ring-white/10 pointer-events-none" />
        </div>
    );
};

export default CodeBlock;