'use client';

import React, { useState } from 'react';
import { useTheme, Theme, ThemeVariables } from '@/context/ThemeContext';
import { Edit2, Trash2, Plus, Check, X } from 'lucide-react';

interface ColorInputProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

const ColorInput = ({ label, value, onChange }: ColorInputProps) => (
    <div className="flex flex-col gap-1">
        <label className="text-sm text-theme/70">{label}</label>
        <div className="flex gap-2">
            <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-8 h-8 rounded cursor-pointer"
            />
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 bg-secondary/50 text-theme rounded px-2 py-1 text-sm border border-theme"
            />
        </div>
    </div>
);

interface ThemeEditorProps {
    initialTheme?: Theme;
    onSave: (theme: Theme) => void;
    onCancel: () => void;
}

const ThemeEditor = ({ initialTheme, onSave, onCancel }: ThemeEditorProps) => {
    const [name, setName] = useState(initialTheme?.name || '');
    const [variables, setVariables] = useState<ThemeVariables>(
        initialTheme?.variables || {
            '--background-start': '#000000',
            '--background-end': '#1a1a1a',
            '--primary': '#3b82f6',
            '--primary-hover': '#2563eb',
            '--secondary': 'rgba(30, 41, 59, 0.7)',
            '--secondary-hover': 'rgba(30, 41, 59, 0.9)',
            '--text': '#f8fafc',
            '--accent': '#60a5fa',
            '--sidebar-gradient-1': '#0f172a',
            '--sidebar-gradient-2': '#1e293b',
            '--sidebar-gradient-3': '#334155',
            '--card-background': 'rgba(30, 41, 59, 0.5)',
            '--border-color': 'rgba(148, 163, 184, 0.1)',
        }
    );

    const handleSave = () => {
        if (!name.trim()) {
            alert('Please enter a theme name');
            return;
        }

        const theme: Theme = {
            id: initialTheme?.id || `custom-${Date.now()}`,
            name: name.trim(),
            variables,
            isCustom: true
        };

        onSave(theme);
    };

    return (
        <div className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-theme">
            <div className="space-y-6">
                {/* Theme Name */}
                <div>
                    <label className="block text-sm text-theme/70 mb-1">Theme Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-secondary/50 text-theme rounded px-3 py-2 border border-theme"
                        placeholder="Enter theme name"
                    />
                </div>

                {/* Color Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ColorInput
                        label="Background Start"
                        value={variables['--background-start']}
                        onChange={(value) => setVariables(prev => ({ ...prev, '--background-start': value }))}
                    />
                    <ColorInput
                        label="Background End"
                        value={variables['--background-end']}
                        onChange={(value) => setVariables(prev => ({ ...prev, '--background-end': value }))}
                    />
                    <ColorInput
                        label="Primary Color"
                        value={variables['--primary']}
                        onChange={(value) => setVariables(prev => ({ ...prev, '--primary': value }))}
                    />
                    <ColorInput
                        label="Primary Hover"
                        value={variables['--primary-hover']}
                        onChange={(value) => setVariables(prev => ({ ...prev, '--primary-hover': value }))}
                    />
                    <ColorInput
                        label="Secondary Color"
                        value={variables['--secondary']}
                        onChange={(value) => setVariables(prev => ({ ...prev, '--secondary': value }))}
                    />
                    <ColorInput
                        label="Secondary Hover"
                        value={variables['--secondary-hover']}
                        onChange={(value) => setVariables(prev => ({ ...prev, '--secondary-hover': value }))}
                    />
                    <ColorInput
                        label="Text Color"
                        value={variables['--text']}
                        onChange={(value) => setVariables(prev => ({ ...prev, '--text': value }))}
                    />
                    <ColorInput
                        label="Accent Color"
                        value={variables['--accent']}
                        onChange={(value) => setVariables(prev => ({ ...prev, '--accent': value }))}
                    />
                    <ColorInput
                        label="Sidebar Gradient 1"
                        value={variables['--sidebar-gradient-1']}
                        onChange={(value) => setVariables(prev => ({ ...prev, '--sidebar-gradient-1': value }))}
                    />
                    <ColorInput
                        label="Sidebar Gradient 2"
                        value={variables['--sidebar-gradient-2']}
                        onChange={(value) => setVariables(prev => ({ ...prev, '--sidebar-gradient-2': value }))}
                    />
                    <ColorInput
                        label="Sidebar Gradient 3"
                        value={variables['--sidebar-gradient-3']}
                        onChange={(value) => setVariables(prev => ({ ...prev, '--sidebar-gradient-3': value }))}
                    />
                    <ColorInput
                        label="Card Background"
                        value={variables['--card-background']}
                        onChange={(value) => setVariables(prev => ({ ...prev, '--card-background': value }))}
                    />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-theme bg-secondary/50 hover:bg-secondary/70 rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 text-sm text-white bg-primary hover:bg-primary-hover rounded-lg transition-colors"
                    >
                        Save Theme
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function ThemeCustomizer() {
    const { themes, currentTheme, setTheme, addCustomTheme, deleteCustomTheme, updateCustomTheme } = useTheme();
    const [isEditing, setIsEditing] = useState(false);
    const [editingTheme, setEditingTheme] = useState<Theme | undefined>();

    const handleSaveTheme = (theme: Theme) => {
        if (editingTheme) {
            updateCustomTheme(theme);
        } else {
            addCustomTheme(theme);
        }
        setIsEditing(false);
        setEditingTheme(undefined);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-theme">Themes</h2>
                <button
                    onClick={() => {
                        setIsEditing(true);
                        setEditingTheme(undefined);
                    }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-theme bg-secondary/50 hover:bg-secondary/70 rounded-lg transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    <span>Create Theme</span>
                </button>
            </div>

            {isEditing ? (
                <ThemeEditor
                    initialTheme={editingTheme}
                    onSave={handleSaveTheme}
                    onCancel={() => {
                        setIsEditing(false);
                        setEditingTheme(undefined);
                    }}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {themes.map((theme) => (
                        <div
                            key={theme.id}
                            className={`relative p-4 rounded-xl border transition-all cursor-pointer
                                ${currentTheme === theme.id
                                ? 'border-primary bg-primary/10'
                                : 'border-theme/10 hover:border-theme/30 bg-secondary/50'
                            }`}
                            onClick={() => setTheme(theme.id)}
                        >
                            {/* Theme Preview */}
                            <div
                                className="h-20 rounded-lg mb-3"
                                style={{
                                    background: `linear-gradient(135deg, ${theme.variables['--background-start']} 0%, ${theme.variables['--background-end']} 100%)`
                                }}
                            >
                                <div className="h-full w-full p-2 flex gap-2">
                                    <div
                                        className="w-1/3 rounded"
                                        style={{ backgroundColor: theme.variables['--primary'] }}
                                    />
                                    <div
                                        className="w-1/3 rounded"
                                        style={{ backgroundColor: theme.variables['--secondary'] }}
                                    />
                                    <div
                                        className="w-1/3 rounded"
                                        style={{ backgroundColor: theme.variables['--accent'] }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-theme font-medium">{theme.name}</span>
                                {theme.isCustom && (
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setIsEditing(true);
                                                setEditingTheme(theme);
                                            }}
                                            className="p-1 hover:bg-secondary/70 rounded"
                                            title="Edit theme"
                                        >
                                            <Edit2 className="w-4 h-4 text-theme/70" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (confirm('Are you sure you want to delete this theme?')) {
                                                    deleteCustomTheme(theme.id);
                                                }
                                            }}
                                            className="p-1 hover:bg-secondary/70 rounded"
                                            title="Delete theme"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {currentTheme === theme.id && (
                                <div className="absolute top-2 right-2">
                                    <Check className="w-4 h-4 text-primary" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}