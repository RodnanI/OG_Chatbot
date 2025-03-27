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
    '--accent-anthropic': string;
    '--accent-openai': string;
    '--accent-nebius': string;
    '--accent-google': string;
    '--card-header': string;
}

export interface Theme {
    id: string;
    name: string;
    variables: ThemeVariables;
    isCustom?: boolean;
}

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
            '--accent-anthropic': '#ff7b24',
            '--accent-openai': '#74aa9c',
            '--accent-nebius': '#4f6bed',
            '--accent-google': '#ea4335',
            '--card-header': 'rgba(30, 41, 59, 0.8)'
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
            '--accent-anthropic': '#ff7b24',
            '--accent-openai': '#74aa9c',
            '--accent-nebius': '#4f6bed',
            '--accent-google': '#ea4335',
            '--card-header': 'rgba(4, 47, 46, 0.8)'
        }
    },
    {
        id: 'yin-yang',
        name: 'Yin & Yang',
        variables: {
            '--background-start': '#000000',
            '--background-end': '#000000',
            '--primary': '#1b1b1b',
            '--primary-hover': '#0c0c0c',
            '--secondary': 'rgba(0,0,0,0.7)',
            '--secondary-hover': 'rgba(12,12,12,0.9)',
            '--text': '#B3B4BD',
            '--accent': '#ffffff',
            '--sidebar-gradient-1': '#000000',
            '--sidebar-gradient-2': '#000000',
            '--sidebar-gradient-3': '#000000',
            '--card-background': 'rgb(0,0,0)',
            '--border-color': 'rgb(0,0,0)',
            '--accent-anthropic': '#ff7b24',
            '--accent-openai': '#74aa9c',
            '--accent-nebius': '#4f6bed',
            '--accent-google': '#ea4335',
            '--card-header': 'rgba(0,0,0,0.8)'
        }
    },
    {
        id: 'canvas',
        name: 'Canvas',
        variables: {
            '--background-start': '#cccfcc',
            '--background-end': '#bdc1be',
            '--primary': '#000000',
            '--primary-hover': '#333333',
            '--secondary': 'rgba(211, 217, 212, 0.7)',
            '--secondary-hover': 'rgba(211, 217, 212, 0.9)',
            '--text': '#000000',
            '--accent': '#c5cac6',
            '--sidebar-gradient-1': '#c7cac8',
            '--sidebar-gradient-2': '#c0c3c1',
            '--sidebar-gradient-3': '#a9aaa9',
            '--card-background': 'rgba(211, 217, 212, 0.5)',
            '--border-color': 'rgba(211, 217, 212, 0.2)',
            '--accent-anthropic': '#ff7b24',
            '--accent-openai': '#74aa9c',
            '--accent-nebius': '#4f6bed',
            '--accent-google': '#ea4335',
            '--card-header': 'rgba(211, 217, 212, 0.8)'
        }
    },
    {
        id: 'striking-simple',
        name: 'Striking and Simple',
        variables: {
            '--background-start': '#0c251c',
            '--background-end': '#295e5c',
            '--primary': '#0B0C10',
            '--primary-hover': '#1E1F23',
            '--secondary': 'rgba(11, 12, 16, 0.7)',
            '--secondary-hover': 'rgba(11, 12, 16, 0.9)',
            '--text': '#FFFFFF',
            '--accent': '#45A29E',
            '--sidebar-gradient-1': '#0B0C10',
            '--sidebar-gradient-2': '#1f453b',
            '--sidebar-gradient-3': '#387e7a',
            '--card-background': 'rgba(11, 12, 16, 0.5)',
            '--border-color': 'rgba(69, 162, 158, 0.2)',
            '--accent-anthropic': '#ff7b24',
            '--accent-openai': '#74aa9c',
            '--accent-nebius': '#4f6bed',
            '--accent-google': '#ea4335',
            '--card-header': 'rgba(11, 12, 16, 0.8)'
        }
    },
    {
        id: 'elegant-approachable',
        name: 'Elegant Yet Approachable',
        variables: {
            '--background-start': '#EDC7B7',
            '--background-end': '#EEE2DC',
            '--primary': '#123C69',
            '--primary-hover': '#0A2A4A',
            '--secondary': 'rgba(237, 199, 183, 0.7)',
            '--secondary-hover': 'rgba(237, 199, 183, 0.9)',
            '--text': '#000000',
            '--accent': '#AC3B61',
            '--sidebar-gradient-1': '#EDC7B7',
            '--sidebar-gradient-2': '#EEE2DC',
            '--sidebar-gradient-3': '#BAB2B5',
            '--card-background': 'rgba(237, 199, 183, 0.5)',
            '--border-color': 'rgba(172, 59, 97, 0.2)',
            '--accent-anthropic': '#ff7b24',
            '--accent-openai': '#74aa9c',
            '--accent-nebius': '#4f6bed',
            '--accent-google': '#ea4335',
            '--card-header': 'rgba(237, 199, 183, 0.8)'
        }
    },
    {
        id: 'corporate-serious',
        name: 'Corporate and Serious',
        variables: {
            '--background-start': '#265077',
            '--background-end': '#022140',
            '--primary': '#1E4258',
            '--primary-hover': '#0A1F2E',
            '--secondary': 'rgba(38, 80, 119, 0.7)',
            '--secondary-hover': 'rgba(38, 80, 119, 0.9)',
            '--text': '#FFFFFF',
            '--accent': '#2D5F5D',
            '--sidebar-gradient-1': '#265077',
            '--sidebar-gradient-2': '#022140',
            '--sidebar-gradient-3': '#1E4258',
            '--card-background': 'rgba(38, 80, 119, 0.5)',
            '--border-color': 'rgba(45, 95, 93, 0.2)',
            '--accent-anthropic': '#ff7b24',
            '--accent-openai': '#74aa9c',
            '--accent-nebius': '#4f6bed',
            '--accent-google': '#ea4335',
            '--card-header': 'rgba(38, 80, 119, 0.8)'
        }
    },
    {
        id: 'ocean-depths',
        name: 'Ocean Depths',
        variables: {
            '--background-start': '#0D1B2A',
            '--background-end': '#415A77',
            '--primary': '#778DA9',
            '--primary-hover': '#E0E1DD',
            '--secondary': 'rgba(13, 27, 42, 0.7)',
            '--secondary-hover': 'rgba(13, 27, 42, 0.9)',
            '--text': '#E0E1DD',
            '--accent': '#1B263B',
            '--sidebar-gradient-1': '#0D1B2A',
            '--sidebar-gradient-2': '#1B263B',
            '--sidebar-gradient-3': '#415A77',
            '--card-background': 'rgba(27, 38, 59, 0.5)',
            '--border-color': 'rgba(224, 225, 221, 0.2)',
            '--accent-anthropic': '#ff7b24',
            '--accent-openai': '#74aa9c',
            '--accent-nebius': '#4f6bed',
            '--accent-google': '#ea4335',
            '--card-header': 'rgba(27, 38, 59, 0.8)'
        }
    },
    {
        id: 'forest-whispers',
        name: 'Forest Whispers',
        variables: {
            '--background-start': '#EDEEC9',
            '--background-end': '#DDE7C7',
            '--primary': '#77BFA3',
            '--primary-hover': '#98C9A3',
            '--secondary': 'rgba(237, 238, 201, 0.7)',
            '--secondary-hover': 'rgba(237, 238, 201, 0.9)',
            '--text': '#2D3A3A',
            '--accent': '#BFD8BD',
            '--sidebar-gradient-1': '#EDEEC9',
            '--sidebar-gradient-2': '#DDE7C7',
            '--sidebar-gradient-3': '#BFD8BD',
            '--card-background': 'rgba(119, 191, 163, 0.5)',
            '--border-color': 'rgba(45, 58, 58, 0.2)',
            '--accent-anthropic': '#ff7b24',
            '--accent-openai': '#74aa9c',
            '--accent-nebius': '#4f6bed',
            '--accent-google': '#ea4335',
            '--card-header': 'rgba(119, 191, 163, 0.8)'
        }
    },
    {
        id: 'gentle-dawn',
        name: 'Gentle Dawn',
        variables: {
            '--background-start': '#8E9AAF',
            '--background-end': '#CBC0D3',
            '--primary': '#DEE2FF',
            '--primary-hover': '#EFD3D7',
            '--secondary': 'rgba(142, 154, 175, 0.7)',
            '--secondary-hover': 'rgba(142, 154, 175, 0.9)',
            '--text': '#2D2D34',
            '--accent': '#FEEAFA',
            '--sidebar-gradient-1': '#8E9AAF',
            '--sidebar-gradient-2': '#CBC0D3',
            '--sidebar-gradient-3': '#DEE2FF',
            '--card-background': 'rgba(203, 192, 211, 0.5)',
            '--border-color': 'rgba(45, 45, 52, 0.2)',
            '--accent-anthropic': '#ff7b24',
            '--accent-openai': '#74aa9c',
            '--accent-nebius': '#4f6bed',
            '--accent-google': '#ea4335',
            '--card-header': 'rgba(203, 192, 211, 0.8)'
        }
    },
    {
        id: 'royal-twilight',
        name: 'Royal Twilight',
        variables: {
            '--background-start': '#231942',
            '--background-end': '#5E548E',
            '--primary': '#9F86C0',
            '--primary-hover': '#BE95C4',
            '--secondary': 'rgba(35, 25, 66, 0.7)',
            '--secondary-hover': 'rgba(35, 25, 66, 0.9)',
            '--text': '#E0B1CB',
            '--accent': '#BE95C4',
            '--sidebar-gradient-1': '#231942',
            '--sidebar-gradient-2': '#5E548E',
            '--sidebar-gradient-3': '#9F86C0',
            '--card-background': 'rgba(94, 84, 142, 0.5)',
            '--border-color': 'rgba(224, 177, 203, 0.2)',
            '--accent-anthropic': '#ff7b24',
            '--accent-openai': '#74aa9c',
            '--accent-nebius': '#4f6bed',
            '--accent-google': '#ea4335',
            '--card-header': 'rgba(94, 84, 142, 0.8)'
        }
    },
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