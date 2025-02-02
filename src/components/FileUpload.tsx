'use client';
import { useState } from 'react';

interface FileUploadProps {
    onFileSelect: (file: File) => void;
    disabled?: boolean;
}

export default function FileUpload({ onFileSelect, disabled }: FileUploadProps) {
    const [dragActive, setDragActive] = useState(false);
    const [selectedFileName, setSelectedFileName] = useState<string | null>(null);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleFile = (file: File) => {
        setSelectedFileName(file.name);
        onFileSelect(file);
    };

    return (
        <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                dragActive
                    ? 'border-blue-500 bg-blue-50'
                    : disabled
                        ? 'border-gray-200 bg-gray-50 cursor-not-allowed'
                        : 'border-gray-300 hover:border-blue-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
        >
            <label className={`cursor-pointer ${disabled ? 'cursor-not-allowed' : ''}`}>
                <input
                    type="file"
                    className="hidden"
                    onChange={handleChange}
                    accept=".docx,.pdf,.txt,image/*"
                    disabled={disabled}
                />
                <div className="text-sm text-gray-600">
                    {selectedFileName ? (
                        <p>Selected file: {selectedFileName}</p>
                    ) : (
                        <>
                            <p>Drag and drop files here or</p>
                            <p className="text-blue-500">Browse files</p>
                        </>
                    )}
                </div>
            </label>
        </div>
    );
}