'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

export interface ThemeVariables {
    '--background-start': string;
    '--background-end': string;
    '--primary': string;
    '--primary-hover': string;
    '--secondary': string;
    '--secondary-hover': string;
    '--text': string;
    '--accent': string;
    '--sidebar-gradient-1': string;
    '--sidebar-gradient-2': string;
    '--sidebar-gradient-3': string;
    '--card-background': string;
    '--border-color': string;
}

export interface Theme {
    id: string;
    name: string;
    variables: ThemeVariables;
    isCustom?: boolean;
}

// Built-in themes
export const themes: Theme[] = [
    {
        id: 'midnight',
        name: 'Midnight',
        variables: {
            '--background-start': '#0f172a',
            '--background-end': '#1e293b',
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
    },
    {
        id: 'sunset',
        name: 'Sunset',
        variables: {
            '--background-start': '#4c1d95',
            '--background-end': '#831843',
            '--primary': '#f97316',
            '--primary-hover': '#ea580c',
            '--secondary': 'rgba(76, 29, 149, 0.7)',
            '--secondary-hover': 'rgba(76, 29, 149, 0.9)',
            '--text': '#fef2f2',
            '--accent': '#fb923c',
            '--sidebar-gradient-1': '#4c1d95',
            '--sidebar-gradient-2': '#6b21a8',
            '--sidebar-gradient-3': '#831843',
            '--card-background': 'rgba(76, 29, 149, 0.5)',
            '--border-color': 'rgba(251, 146, 60, 0.2)',
        }
    },
    {
        id: 'forest',
        name: 'Forest',
        variables: {
            '--background-start': '#064e3b',
            '--background-end': '#166534',
            '--primary': '#10b981',
            '--primary-hover': '#059669',
            '--secondary': 'rgba(6, 78, 59, 0.7)',
            '--secondary-hover': 'rgba(6, 78, 59, 0.9)',
            '--text': '#ecfdf5',
            '--accent': '#34d399',
            '--sidebar-gradient-1': '#064e3b',
            '--sidebar-gradient-2': '#065f46',
            '--sidebar-gradient-3': '#047857',
            '--card-background': 'rgba(6, 78, 59, 0.5)',
            '--border-color': 'rgba(52, 211, 153, 0.2)',
        }
    },
    {
        id: 'ocean',
        name: 'Ocean',
        variables: {
            '--background-start': '#0c4a6e',
            '--background-end': '#1e40af',
            '--primary': '#0ea5e9',
            '--primary-hover': '#0284c7',
            '--secondary': 'rgba(12, 74, 110, 0.7)',
            '--secondary-hover': 'rgba(12, 74, 110, 0.9)',
            '--text': '#f0f9ff',
            '--accent': '#38bdf8',
            '--sidebar-gradient-1': '#0c4a6e',
            '--sidebar-gradient-2': '#0369a1',
            '--sidebar-gradient-3': '#0c4a6e',
            '--card-background': 'rgba(12, 74, 110, 0.5)',
            '--border-color': 'rgba(56, 189, 248, 0.2)',
        }
    },
    {
        id: 'aurora',
        name: 'Aurora',
        variables: {
            '--background-start': '#042f2e',
            '--background-end': '#1e1b4b',
            '--primary': '#2dd4bf',
            '--primary-hover': '#14b8a6',
            '--secondary': 'rgba(4, 47, 46, 0.7)',
            '--secondary-hover': 'rgba(4, 47, 46, 0.9)',
            '--text': '#f0fdfa',
            '--accent': '#5eead4',
            '--sidebar-gradient-1': '#042f2e',
            '--sidebar-gradient-2': '#134e4a',
            '--sidebar-gradient-3': '#1e1b4b',
            '--card-background': 'rgba(4, 47, 46, 0.5)',
            '--border-color': 'rgba(94, 234, 212, 0.2)',
        }
    },
    {
        id: 'nebula',
        name: 'Nebula',
        variables: {
            '--background-start': '#2e1065',
            '--background-end': '#701a75',
            '--primary': '#d946ef',
            '--primary-hover': '#c026d3',
            '--secondary': 'rgba(46, 16, 101, 0.7)',
            '--secondary-hover': 'rgba(46, 16, 101, 0.9)',
            '--text': '#fdf4ff',
            '--accent': '#e879f9',
            '--sidebar-gradient-1': '#2e1065',
            '--sidebar-gradient-2': '#4c1d95',
            '--sidebar-gradient-3': '#701a75',
            '--card-background': 'rgba(46, 16, 101, 0.5)',
            '--border-color': 'rgba(232, 121, 249, 0.2)',
        }
    },
    // New themes
    {
        id: 'cyberpunk',
        name: 'Cyberpunk',
        variables: {
            '--background-start': '#000000',
            '--background-end': '#1a0f3d',
            '--primary': '#ff00ff',
            '--primary-hover': '#cc00cc',
            '--secondary': 'rgba(26, 15, 61, 0.7)',
            '--secondary-hover': 'rgba(26, 15, 61, 0.9)',
            '--text': '#00ffff',
            '--accent': '#ff00ff',
            '--sidebar-gradient-1': '#000000',
            '--sidebar-gradient-2': '#1a0f3d',
            '--sidebar-gradient-3': '#3b1f8c',
            '--card-background': 'rgba(26, 15, 61, 0.5)',
            '--border-color': 'rgba(255, 0, 255, 0.2)',
        }
    },
    {
        id: 'desert',
        name: 'Desert',
        variables: {
            '--background-start': '#7c2d12',
            '--background-end': '#92400e',
            '--primary': '#f97316',
            '--primary-hover': '#ea580c',
            '--secondary': 'rgba(124, 45, 18, 0.7)',
            '--secondary-hover': 'rgba(124, 45, 18, 0.9)',
            '--text': '#fff7ed',
            '--accent': '#fb923c',
            '--sidebar-gradient-1': '#7c2d12',
            '--sidebar-gradient-2': '#92400e',
            '--sidebar-gradient-3': '#b45309',
            '--card-background': 'rgba(124, 45, 18, 0.5)',
            '--border-color': 'rgba(251, 146, 60, 0.2)',
        }
    },
    {
        id: 'glacier',
        name: 'Glacier',
        variables: {
            '--background-start': '#0c4a6e',
            '--background-end': '#0369a1',
            '--primary': '#38bdf8',
            '--primary-hover': '#0ea5e9',
            '--secondary': 'rgba(12, 74, 110, 0.7)',
            '--secondary-hover': 'rgba(12, 74, 110, 0.9)',
            '--text': '#f0f9ff',
            '--accent': '#7dd3fc',
            '--sidebar-gradient-1': '#0c4a6e',
            '--sidebar-gradient-2': '#0369a1',
            '--sidebar-gradient-3': '#0284c7',
            '--card-background': 'rgba(12, 74, 110, 0.5)',
            '--border-color': 'rgba(125, 211, 252, 0.2)',
        }
    }
];

interface ThemeContextType {
    currentTheme: string;
    setTheme: (themeId: string) => void;
    themes: Theme[];
    addCustomTheme: (theme: Theme) => void;
    deleteCustomTheme: (themeId: string) => void;
    updateCustomTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const CUSTOM_THEMES_KEY = 'customThemes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [currentTheme, setCurrentTheme] = useState('midnight');
    const [customThemes, setCustomThemes] = useState<Theme[]>([]);

    useEffect(() => {
        // Load saved theme and custom themes on mount
        const savedTheme = localStorage.getItem('selectedTheme');
        const savedCustomThemes = localStorage.getItem(CUSTOM_THEMES_KEY);

        if (savedTheme) {
            setCurrentTheme(savedTheme);
        }
        if (savedCustomThemes) {
            setCustomThemes(JSON.parse(savedCustomThemes));
        }
    }, []);

    useEffect(() => {
        // Apply theme variables when theme changes
        const allThemes = [...themes, ...customThemes];
        const theme = allThemes.find(t => t.id === currentTheme);
        if (theme) {
            Object.entries(theme.variables).forEach(([key, value]) => {
                document.documentElement.style.setProperty(key, value);
            });
            localStorage.setItem('selectedTheme', currentTheme);
        }
    }, [currentTheme, customThemes]);

    const addCustomTheme = (theme: Theme) => {
        const updatedThemes = [...customThemes, { ...theme, isCustom: true }];
        setCustomThemes(updatedThemes);
        localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updatedThemes));
    };

    const deleteCustomTheme = (themeId: string) => {
        const updatedThemes = customThemes.filter(theme => theme.id !== themeId);
        setCustomThemes(updatedThemes);
        localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updatedThemes));

        // If the deleted theme was selected, switch to default
        if (currentTheme === themeId) {
            setCurrentTheme('midnight');
        }
    };

    const updateCustomTheme = (updatedTheme: Theme) => {
        const updatedThemes = customThemes.map(theme =>
            theme.id === updatedTheme.id ? { ...updatedTheme, isCustom: true } : theme
        );
        setCustomThemes(updatedThemes);
        localStorage.setItem(CUSTOM_THEMES_KEY, JSON.stringify(updatedThemes));
    };

    const setTheme = (themeId: string) => {
        setCurrentTheme(themeId);
    };

    return (
        <ThemeContext.Provider value={{
            currentTheme,
            setTheme,
            themes: [...themes, ...customThemes],
            addCustomTheme,
            deleteCustomTheme,
            updateCustomTheme
        }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}