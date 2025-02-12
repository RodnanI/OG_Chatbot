'use client';

import React, { useState } from 'react';
import { Check, ChevronLeft, ChartBar, LogOut, Plus, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useTheme, Theme, ThemeVariables } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface ThemePreviewProps {
    theme: Theme;
    isSelected: boolean;
    onClick: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
}

const ThemePreview = ({ theme, isSelected, onClick, onEdit, onDelete }: ThemePreviewProps) => {
    return (
        <div className="bg-secondary rounded-lg overflow-hidden">
            <button
                onClick={onClick}
                className={`w-full p-1 transition-all duration-200 ${
                    isSelected ? 'ring-2 ring-primary' : 'hover:ring-2 hover:ring-secondary'
                }`}
            >
                <div className="p-4">
                    <div className="w-full space-y-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-theme">{theme.name}</span>
                            <div className="flex items-center gap-2">
                                {theme.isCustom && (
                                    <>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEdit?.();
                                            }}
                                            className="p-1 hover:bg-secondary/70 rounded"
                                        >
                                            <Edit2 className="w-4 h-4 text-theme/70" />
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDelete?.();
                                            }}
                                            className="p-1 hover:bg-secondary/70 rounded"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                        </button>
                                    </>
                                )}
                                {isSelected && (
                                    <span className="flex items-center justify-center w-5 h-5 bg-primary rounded-full">
                                        <Check className="w-3 h-3 text-white" />
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Chat Interface Preview */}
                        <div
                            className="w-full h-32 rounded-lg p-2"
                            style={{
                                background: `linear-gradient(to bottom right, ${theme.variables['--background-start']}, ${theme.variables['--background-end']})`
                            }}
                        >
                            {/* Header */}
                            <div className="flex justify-between items-center mb-2">
                                <div className="w-20 h-2 rounded"
                                     style={{ backgroundColor: theme.variables['--secondary'] }}/>
                                <div className="w-8 h-2 rounded"
                                     style={{ backgroundColor: theme.variables['--secondary'] }}/>
                            </div>

                            {/* Messages */}
                            <div className="space-y-2">
                                <div className="flex justify-end">
                                    <div className="w-24 h-6 rounded"
                                         style={{ backgroundColor: theme.variables['--primary'] }}/>
                                </div>
                                <div className="flex justify-start">
                                    <div className="w-32 h-6 rounded"
                                         style={{ backgroundColor: theme.variables['--secondary'] }}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </button>
        </div>
    );
};

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
        <div className="bg-secondary/50 backdrop-blur-sm rounded-xl p-6 border border-theme mb-6">
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
                <div className="space-y-6">
                    {/* Main Colors */}
                    <div>
                        <h3 className="text-sm font-medium text-theme/70 mb-3">Main Colors</h3>
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
                        </div>
                    </div>

                    {/* Sidebar Colors */}
                    <div>
                        <h3 className="text-sm font-medium text-theme/70 mb-3">Sidebar Colors</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ColorInput
                                label="Sidebar Gradient Start"
                                value={variables['--sidebar-gradient-1']}
                                onChange={(value) => setVariables(prev => ({ ...prev, '--sidebar-gradient-1': value }))}
                            />
                            <ColorInput
                                label="Sidebar Gradient Middle"
                                value={variables['--sidebar-gradient-2']}
                                onChange={(value) => setVariables(prev => ({ ...prev, '--sidebar-gradient-2': value }))}
                            />
                            <ColorInput
                                label="Sidebar Gradient End"
                                value={variables['--sidebar-gradient-3']}
                                onChange={(value) => setVariables(prev => ({ ...prev, '--sidebar-gradient-3': value }))}
                            />
                            <ColorInput
                                label="Card Background"
                                value={variables['--card-background']}
                                onChange={(value) => setVariables(prev => ({ ...prev, '--card-background': value }))}
                            />
                            <ColorInput
                                label="Border Color"
                                value={variables['--border-color']}
                                onChange={(value) => setVariables(prev => ({ ...prev, '--border-color': value }))}
                            />
                        </div>
                    </div>
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

export default function SettingsPage() {
    const { currentTheme, setTheme, themes, addCustomTheme, deleteCustomTheme, updateCustomTheme } = useTheme();
    const { logout } = useAuth();
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [editingTheme, setEditingTheme] = useState<Theme | undefined>();

    const handleLogout = () => {
        Cookies.remove('auth_token');
        localStorage.removeItem('auth_state');
        logout();
        router.push('/login');
    };

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
        <div className="min-h-screen bg-theme-gradient">
            <div className="max-w-4xl mx-auto py-12 px-4">
                {/* Navigation and Title Area */}
                <div className="flex items-center justify-between mb-12">
                    <Link
                        href="/"
                        className="flex items-center gap-2 text-gray-400 hover:text-gray-300 transition-colors px-3 py-2 rounded-lg hover:bg-secondary"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back to Chat
                    </Link>
                    <h1 className="text-3xl font-bold text-theme">Settings</h1>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>

                {/* Content */}
                <div className="space-y-12">
                    {/* Theme Section */}
                    <section>
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-theme">Theme</h2>
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

                        {isEditing && (
                            <ThemeEditor
                                initialTheme={editingTheme}
                                onSave={handleSaveTheme}
                                onCancel={() => {
                                    setIsEditing(false);
                                    setEditingTheme(undefined);
                                }}
                            />
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {themes.map((theme) => (
                                <ThemePreview
                                    key={theme.id}
                                    theme={theme}
                                    isSelected={currentTheme === theme.id}
                                    onClick={() => setTheme(theme.id)}
                                    onEdit={theme.isCustom ? () => {
                                        setIsEditing(true);
                                        setEditingTheme(theme);
                                    } : undefined}
                                    onDelete={theme.isCustom ? () => {
                                        if (confirm('Are you sure you want to delete this theme?')) {
                                            deleteCustomTheme(theme.id);
                                        }
                                    } : undefined}
                                />
                            ))}
                        </div>
                    </section>

                    {/* Statistics Section */}
                    <section>
                        <h2 className="text-xl font-semibold text-theme mb-6">Analytics</h2>
                        <Link
                            href="/statistics"
                            className="flex items-center gap-3 p-4 bg-secondary rounded-lg hover:opacity-90 transition-colors"
                        >
                            <ChartBar className="w-5 h-5 text-primary" />
                            <div>
                                <h3 className="text-sm font-medium text-theme">View Statistics</h3>
                                <p className="text-sm text-gray-400">Check your usage analytics and metrics</p>
                            </div>
                        </Link>
                    </section>
                </div>
            </div>
        </div>
    );
}