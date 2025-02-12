// src/lib/auth.ts
import { User } from '@/types/auth';

const STORAGE_KEY = 'auth_state';

// Define valid users
const VALID_USERS: Record<string, User & { password: string }> = {
    'rodnan': {
        id: '1',
        username: 'rodnan',
        name: 'Rodnan',
        password: 'rod2024'
    },
    'dodo': {
        id: '2',
        username: 'dodo',
        name: 'Dodo',
        password: 'dodo2024'
    },
    'dindi': {
        id: '3',
        username: 'dindi',
        name: 'Dindi',
        password: 'dindi2024'
    },
    'koko': {
        id: '4',
        username: 'koko',
        name: 'Koko',
        password: 'koko2024'
    },
    'tofu': {
        id: '5',
        username: 'tofu',
        name: 'Tofu',
        password: 'tofu2024'
    },
    'mathi': {
        id: '6',
        username: 'mathi',
        name: 'Mathi',
        password: 'mathi2024'
    },
    'andi': {
        id: '7',
        username: 'tofu',
        name: 'Andi',
        password: 'andi2024'
    }

};

interface StoredAuthState {
    user: User;
    token: string;
}

export const login = async (username: string, password: string): Promise<User> => {
    const user = VALID_USERS[username.toLowerCase()];

    if (user && user.password === password) {
        const { password: _, ...userWithoutPassword } = user;
        const authState: StoredAuthState = {
            user: userWithoutPassword,
            token: 'token_' + Math.random().toString(36).substring(7)
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
        return userWithoutPassword;
    }
    throw new Error('Invalid credentials');
};

export const logout = () => {
    localStorage.removeItem(STORAGE_KEY);
};

export const getStoredAuth = (): StoredAuthState | null => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    try {
        return JSON.parse(stored);
    } catch {
        return null;
    }
};