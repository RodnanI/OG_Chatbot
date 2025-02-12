import { X } from 'lucide-react';
export default function FileContentModal({ fileName, content, onClose }: FileContentModalProps) {
    return (
        <div
            className="fixed inset-0 bg-secondary/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-card rounded-xl w-full max-w-4xl max-h-[80vh] flex flex-col shadow-2xl border border-theme"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-theme">
                    <h3 className="text-lg font-semibold text-theme">{fileName}</h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-theme/70" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-auto p-6">
                    <pre className="text-sm text-theme whitespace-pre-wrap font-mono bg-secondary/50 p-4 rounded-lg">
                        {content}
                    </pre>
                </div>
            </div>
        </div>
    );
}