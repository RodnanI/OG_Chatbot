'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { User, AuthState } from '@/types/auth';
import { getStoredAuth, login as authLogin, logout as authLogout } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType extends AuthState {
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [authState, setAuthState] = useState<AuthState>({
        user: null,
        isAuthenticated: false
    });
    const router = useRouter();

    useEffect(() => {
        const stored = getStoredAuth();
        if (stored) {
            setAuthState({
                user: stored.user,
                isAuthenticated: true
            });
        }
    }, []);

    const login = async (username: string, password: string) => {
        try {
            const user = await authLogin(username, password);
            setAuthState({
                user,
                isAuthenticated: true
            });
        } catch (error) {
            throw error;
        }
    };

    const logout = () => {
        authLogout();
        setAuthState({
            user: null,
            isAuthenticated: false
        });
        router.push('/login');
    };

    return (
        <AuthContext.Provider value={{ ...authState, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};