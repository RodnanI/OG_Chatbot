'use client';
import { Upload } from 'lucide-react';
import { useCallback, useState } from 'react';
import { isImageFile } from '@/lib/imageProcessing';

interface FileUploadProps {
    onFilesSelect: (files: File[]) => void;
    disabled?: boolean;
}

export default function FileUpload({ onFilesSelect, disabled }: FileUploadProps) {
    const [isDragging, setIsDragging] = useState(false);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (e.dataTransfer.files?.length > 0) {
            const filesArray = Array.from(e.dataTransfer.files);
            onFilesSelect(filesArray);
        }
    }, [onFilesSelect]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length > 0) {
            const filesArray = Array.from(e.target.files);
            onFilesSelect(filesArray);
        }
    }, [onFilesSelect]);

    return (
        <div className="relative">
            <label
                className={`flex items-center justify-center w-12 h-12 rounded-lg transition-all duration-200 
                    ${disabled
                    ? 'bg-secondary/30 cursor-not-allowed'
                    : isDragging
                        ? 'bg-primary/20 border-2 border-dashed border-primary'
                        : 'bg-secondary hover:bg-secondary-hover cursor-pointer'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
            >
                <input
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                    accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.gif,.webp"
                    disabled={disabled}
                    multiple
                />
                <Upload
                    className={`w-5 h-5 ${
                        disabled
                            ? 'text-gray-500'
                            : isDragging
                                ? 'text-primary'
                                : 'text-accent'
                    }`}
                />
            </label>

            {isDragging && (
                <div
                    className="absolute inset-0 z-50"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                />
            )}
        </div>
    );
}