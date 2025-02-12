import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; // Import the GFM plugin
import 'github-markdown-css/github-markdown.css';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import { Brain, Sparkles } from 'lucide-react';
import LatexRenderer from './LatexRenderer';
import CodeBlock from './CodeBlock';
import CodeOutput from './CodeOutput';

interface MessageContentProps {
    content: string;
    model?: string;
}

const ThinkingProcess = ({ children }: { children: React.ReactNode }) => {
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

const TableWrapper = ({ children }: { children: React.ReactNode }) => (
    <div className="my-6 overflow-x-auto">
        <table className="w-auto mx-auto border border-collapse border-theme/20 bg-secondary/10 rounded-lg">
            {children}
        </table>
    </div>
);

export default function MessageContent({ content, model }: MessageContentProps) {
    const [runningCodes, setRunningCodes] = useState<Record<string, boolean>>({});
    const [currentOutput, setCurrentOutput] = useState<{
        output: string;
        language: string;
        code: string;
    } | null>(null);

    useEffect(() => {
        Prism.highlightAll();
    }, [content]);

    const handleRunCode = async (code: string, language: string) => {
        setRunningCodes(prev => ({ ...prev, [code]: true }));

        try {
            if (language === 'html') {
                const output = `
                    <div style="height: 100%; width: 100%; border: none; overflow: hidden;">
                        <iframe 
                            srcDoc="${encodeURIComponent(code)}"
                            style="width: 100%; height: 100%; border: none;"
                            sandbox="allow-scripts"
                        ></iframe>
                    </div>
                `;
                setCurrentOutput({ output, language, code });
            } else if (language === 'python') {
                const response = await fetch('/api/run-code', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code, language }),
                });

                const data = await response.json();
                const output = data.error ? `Error: ${data.output}` : data.output;
                setCurrentOutput({ output, language, code });
            }
        } catch (error) {
            setCurrentOutput({
                output: 'Error executing code',
                language,
                code
            });
        } finally {
            setRunningCodes(prev => ({ ...prev, [code]: false }));
        }
    };

    const processThinkingContent = (text: string) => {
        if (model !== 'deepseek-ai/DeepSeek-R1') return text;

        const parts = text.split(/(<think>|<\/think>)/);
        let isInThinking = false;
        let processedContent = '';

        parts.forEach((part) => {
            if (part === '<think>') {
                isInThinking = true;
            } else if (part === '</think>') {
                isInThinking = false;
            } else if (isInThinking) {
                processedContent += `<ThinkingProcess>${part}</ThinkingProcess>`;
            } else {
                processedContent += part;
            }
        });

        return processedContent;
    };

    const renderContentWithLatex = (text: string) => {
        const uniquePrefix = Math.random().toString(36).substr(2, 9);

        // First, protect code blocks by replacing them with placeholders
        const codeBlocks: string[] = [];
        const textWithoutCode = text.replace(/```[\s\S]*?```/g, (match) => {
            codeBlocks.push(match);
            return `<<<CODE${codeBlocks.length - 1}>>>`;
        });

        // Split on both inline and block math
        const parts = textWithoutCode.split(/(\$\$[\s\S]*?\$\$|\$[\s\S]*?\$)/);

        // Process each part
        const processed = parts.map((part, index) => {
            const uniqueKey = `${uniquePrefix}-${index}`;

            // Handle block math
            if (part.startsWith('$$') && part.endsWith('$$')) {
                const latex = part.slice(2, -2).trim();
                return <LatexRenderer key={uniqueKey} content={latex} displayMode={true} />;
            }

            // Handle inline math
            if (part.startsWith('$') && part.endsWith('$')) {
                const latex = part.slice(1, -1).trim();
                return <LatexRenderer key={uniqueKey} content={latex} displayMode={false} />;
            }

            // Restore code blocks and render markdown
            const restoredText = part.replace(/<<<CODE(\d+)>>>/g, (_, i) => codeBlocks[parseInt(i)]);
            return (
                <ReactMarkdown
                    key={uniqueKey}
                    remarkPlugins={[remarkGfm]} // Enable GFM (tables, strikethrough, etc.)
                    components={{
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            if (!inline && match) {
                                const language = match[1];
                                const codeString = String(children).replace(/\n$/, '');
                                const isRunnable = ['python', 'html'].includes(language);

                                return (
                                    <CodeBlock
                                        code={codeString}
                                        language={language}
                                        onRun={isRunnable ? handleRunCode : undefined}
                                        isRunnable={isRunnable}
                                    />
                                );
                            }
                            return (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        },
                        table({ children }) {
                            return <TableWrapper>{children}</TableWrapper>;
                        },
                        thead({ children }) {
                            return (
                                <thead className="bg-secondary/30 border-b border-theme/20">
                                {children}
                                </thead>
                            );
                        },
                        tbody({ children }) {
                            return <tbody className="divide-y divide-theme/20">{children}</tbody>;
                        },
                        th({ children }) {
                            return (
                                <th className="px-6 py-4 text-left text-sm font-semibold text-theme border-r border-theme/20 last:border-r-0">
                                    {children}
                                </th>
                            );
                        },
                        td({ children }) {
                            return (
                                <td className="px-6 py-4 text-sm text-theme border-r border-theme/20 last:border-r-0">
                                    {children}
                                </td>
                            );
                        },
                        tr({ children }) {
                            return (
                                <tr className="hover:bg-secondary/30 transition-colors">
                                    {children}
                                </tr>
                            );
                        },
                        p({ children }) {
                            return <p className="mb-4 last:mb-0">{children}</p>;
                        }
                    }}
                >
                    {restoredText}
                </ReactMarkdown>
            );
        });

        return <>{processed}</>;
    };

    const renderContent = () => {
        if (model === 'deepseek-ai/DeepSeek-R1') {
            const processedContent = processThinkingContent(content);
            const uniquePrefix = Math.random().toString(36).substr(2, 9);
            return (
                <div className="markdown-body bg-transparent">
                    {processedContent.split(/(<ThinkingProcess>.*?<\/ThinkingProcess>)/s).map((part, index) => {
                        const uniqueKey = `${uniquePrefix}-thinking-${index}`;
                        if (part.startsWith('<ThinkingProcess>')) {
                            const thinkingContent = part.replace(/<ThinkingProcess>(.*?)<\/ThinkingProcess>/s, '$1');
                            return (
                                <ThinkingProcess key={uniqueKey}>
                                    {renderContentWithLatex(thinkingContent)}
                                </ThinkingProcess>
                            );
                        }
                        return <div key={uniqueKey}>{renderContentWithLatex(part)}</div>;
                    })}
                </div>
            );
        }

        return (
            <div className="markdown-body bg-transparent">
                {renderContentWithLatex(content)}
            </div>
        );
    };

    return (
        <>
            {renderContent()}
            {currentOutput && (
                <CodeOutput
                    output={currentOutput.output}
                    language={currentOutput.language}
                    originalCode={currentOutput.code}
                    onClose={() => setCurrentOutput(null)}
                />
            )}
        </>
    );
}
