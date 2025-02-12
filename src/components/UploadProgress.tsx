import React from 'react';
import { Loader } from 'lucide-react';

interface UploadProgressProps {
    progress: number;
    fileName: string;
}

const UploadProgress = ({ progress, fileName }: UploadProgressProps) => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-secondary/90 backdrop-blur-sm rounded-lg border border-theme p-6 w-full max-w-md mx-4">
                <div className="flex items-center gap-3 mb-4">
                    <Loader className="w-5 h-5 text-primary animate-spin" />
                    <div className="flex-1 min-w-0">
                        <h3 className="text-theme font-medium mb-1">Uploading File</h3>
                        <p className="text-sm text-theme/70 truncate">{fileName}</p>
                    </div>
                    <span className="text-lg font-semibold text-theme">{Math.round(progress)}%</span>
                </div>

                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-300 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <p className="text-sm text-theme/70 text-center mt-4">
                    Please wait while your file is being uploaded...
                </p>
            </div>
        </div>
    );
};

export default UploadProgress;