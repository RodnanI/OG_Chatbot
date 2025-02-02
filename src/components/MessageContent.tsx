'use client';
import ReactMarkdown from 'react-markdown';
import 'github-markdown-css/github-markdown.css';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';
import { useEffect, useState } from 'react';
import { Play, Loader } from 'lucide-react';
import LatexRenderer from './LatexRenderer';
import CodeOutput from './CodeOutput';
import 'katex/dist/katex.min.css';

interface MessageContentProps {
    content: string;
}

export default function MessageContent({ content }: MessageContentProps) {
    const [runningCodes, setRunningCodes] = useState<Record<string, boolean>>({});
    const [currentOutput, setCurrentOutput] = useState<{
        output: string;
        language: string;
        code: string;
    } | null>(null);

    useEffect(() => {
        Prism.highlightAll();
    }, [content]);

    // Function to separate LaTeX blocks and text
    const renderContentWithLatex = (text: string) => {
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
            // Handle block math
            if (part.startsWith('$$') && part.endsWith('$$')) {
                const latex = part.slice(2, -2).trim();
                return <LatexRenderer key={index} content={latex} displayMode={true} />;
            }
            // Handle inline math
            if (part.startsWith('$') && part.endsWith('$')) {
                const latex = part.slice(1, -1).trim();
                return <LatexRenderer key={index} content={latex} displayMode={false} />;
            }
            // Restore code blocks and render markdown
            const restoredText = part.replace(/<<<CODE(\d+)>>>/g, (_, i) => codeBlocks[parseInt(i)]);
            return (
                <ReactMarkdown
                    key={index}
                    components={{
                        code({ node, inline, className, children, ...props }) {
                            const match = /language-(\w+)/.exec(className || '');
                            const language = match ? match[1] : '';
                            const isRunnable = ['python', 'html'].includes(language);
                            const codeString = children.toString();
                            const codeId = inline ? null : Math.random().toString(36).slice(2);

                            return !inline && match ? (
                                <div className="relative group">
                  <pre className={`language-${language} relative`}>
                    <code className={`language-${language}`} {...props}>
                      {children}
                    </code>
                      {isRunnable && (
                          <button
                              onClick={() => runCode(codeString, language, codeId)}
                              disabled={runningCodes[codeId]}
                              className={`absolute top-2 right-2 p-2 rounded-lg 
                          ${runningCodes[codeId]
                                  ? 'bg-gray-700 cursor-not-allowed'
                                  : 'bg-blue-600 hover:bg-blue-700'} 
                          text-white opacity-0 group-hover:opacity-100 transition-opacity`}
                          >
                              {runningCodes[codeId]
                                  ? <Loader className="w-4 h-4 animate-spin" />
                                  : <Play className="w-4 h-4" />
                              }
                          </button>
                      )}
                  </pre>
                                </div>
                            ) : (
                                <code className={className} {...props}>
                                    {children}
                                </code>
                            );
                        }
                    }}
                >
                    {restoredText}
                </ReactMarkdown>
            );
        });

        return <>{processed}</>;
    };

    const runCode = async (code: string, language: string, codeId: string) => {
        setRunningCodes(prev => ({ ...prev, [codeId]: true }));

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
            setRunningCodes(prev => ({ ...prev, [codeId]: false }));
        }
    };

    return (
        <div className="markdown-body bg-transparent">
            {renderContentWithLatex(content)}
            {currentOutput && (
                <CodeOutput
                    output={currentOutput.output}
                    language={currentOutput.language}
                    originalCode={currentOutput.code}
                    onClose={() => setCurrentOutput(null)}
                />
            )}
        </div>
    );
}